import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EnhancedChatAgent } from '@/server/agents/chat/enhancedChain';
import { ProfileDetector } from '@/server/agents/chat/profileDetector';
import { ProfileUpdateService } from '@/server/services/profileUpdateService';
import { FitnessProfileRepository } from '@/server/repositories/fitnessProfileRepository';
import { ConversationRepository } from '@/server/repositories/conversationRepository';
import { MessageRepository } from '@/server/repositories/messageRepository';
import { Kysely } from 'kysely';
import { DB } from '@/server/models/_types';

// Mock the LLM
vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    invoke: vi.fn(),
  })),
}));

// Mock database
const mockDb = {
  selectFrom: vi.fn().mockReturnThis(),
  insertInto: vi.fn().mockReturnThis(),
  updateTable: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  execute: vi.fn(),
  executeTakeFirst: vi.fn(),
  selectAll: vi.fn().mockReturnThis(),
};

vi.mock('@/server/connections/postgres/postgres', () => ({
  postgresDb: mockDb,
}));

describe('SMS Profile Updates Integration', () => {
  let chatAgent: EnhancedChatAgent;
  let profileDetector: ProfileDetector;
  let mockLLM: any;

  beforeEach(() => {
    vi.clearAllMocks();
    chatAgent = new EnhancedChatAgent(mockDb as any);
    profileDetector = new ProfileDetector();
    mockLLM = (chatAgent as any).llm;
    
    // Mock conversation and message repositories
    mockDb.executeTakeFirst.mockResolvedValue({
      id: 'conv123',
      userId: 'user123',
      lastMessageAt: new Date(),
    });
    mockDb.execute.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Profile update detection in SMS', () => {
    it('should detect weight update in message', async () => {
      const detection = await profileDetector.detectUpdates(
        "I'm down to 175 pounds now!",
        "User is working on weight loss",
        "User: What's my target weight?\nCoach: Your goal is 170 lbs"
      );

      expect(detection.detectedUpdates).toBeDefined();
      expect(detection.detectedUpdates?.length).toBeGreaterThan(0);
      
      const weightUpdate = detection.detectedUpdates?.find(
        u => u.type === 'metric' && u.data?.metric === 'bodyweight'
      );
      expect(weightUpdate).toBeDefined();
      expect(weightUpdate?.data?.value).toBe(175);
      expect(weightUpdate?.data?.unit).toBe('lbs');
    });

    it('should detect injury constraint in message', async () => {
      const detection = await profileDetector.detectUpdates(
        "I hurt my shoulder yesterday at the gym",
        "User has been training consistently",
        ""
      );

      expect(detection.detectedUpdates).toBeDefined();
      const injuryUpdate = detection.detectedUpdates?.find(
        u => u.type === 'constraint'
      );
      expect(injuryUpdate).toBeDefined();
      expect(injuryUpdate?.data?.type).toBe('injury');
      expect(injuryUpdate?.data?.label).toContain('shoulder');
      expect(detection.requiresConfirmation).toBe(true);
    });

    it('should detect goal change in message', async () => {
      const detection = await profileDetector.detectUpdates(
        "I think I want to focus more on strength training now instead of just cardio",
        "User's current goal is weight loss",
        "User: I've been doing mainly cardio\nCoach: Great work on your cardio consistency!"
      );

      expect(detection.detectedUpdates).toBeDefined();
      const goalUpdate = detection.detectedUpdates?.find(
        u => u.type === 'goal'
      );
      expect(goalUpdate).toBeDefined();
      expect(goalUpdate?.data?.primaryGoal).toContain('strength');
      expect(detection.requiresConfirmation).toBe(true);
    });

    it('should detect availability change', async () => {
      const detection = await profileDetector.detectUpdates(
        "I can only make it to the gym 3 times this week",
        "User typically trains 5 days per week",
        ""
      );

      expect(detection.detectedUpdates).toBeDefined();
      const availabilityUpdate = detection.detectedUpdates?.find(
        u => u.type === 'availability'
      );
      expect(availabilityUpdate).toBeDefined();
      expect(availabilityUpdate?.data?.daysPerWeek).toBe(3);
      expect(availabilityUpdate?.data?.temporary).toBe(true);
    });

    it('should handle recovery updates', async () => {
      const detection = await profileDetector.detectUpdates(
        "My back is feeling much better now, I think I can start deadlifting again",
        "User has active lower back injury constraint",
        ""
      );

      expect(detection.detectedUpdates).toBeDefined();
      const constraintUpdate = detection.detectedUpdates?.find(
        u => u.type === 'constraint_resolve'
      );
      expect(constraintUpdate).toBeDefined();
      expect(constraintUpdate?.description).toContain('back');
      expect(detection.requiresConfirmation).toBe(true);
    });
  });

  describe('Enhanced chat with profile updates', () => {
    it('should process message and apply high-confidence updates', async () => {
      // Mock profile repository
      mockDb.executeTakeFirst.mockResolvedValueOnce({
        profile: {
          primaryGoal: 'muscle gain',
          metrics: { bodyweight: { value: 180, unit: 'lbs' } },
        },
      });

      // Mock LLM response for profile detector
      const mockDetectorLLM = vi.fn().mockResolvedValue({
        content: JSON.stringify({
          updates: [
            {
              type: 'metric',
              data: { metric: 'bodyweight', value: 175, unit: 'lbs' },
              confidence: 0.95,
              description: 'Weight loss progress',
            },
          ],
          requiresConfirmation: false,
        }),
      });

      // Override the detector's LLM
      (profileDetector as any).llm = { invoke: mockDetectorLLM };

      const result = await chatAgent.processMessage({
        userId: 'user123',
        message: "I'm down to 175 pounds!",
        conversationId: 'conv123',
        db: mockDb as any,
        detectProfileUpdates: true,
      });

      expect(result.profileUpdated).toBe(true);
      expect(result.detectedUpdates).toBeDefined();
      expect(result.detectedUpdates?.length).toBeGreaterThan(0);
    });

    it('should request confirmation for low-confidence updates', async () => {
      mockDb.executeTakeFirst.mockResolvedValueOnce({
        profile: { primaryGoal: 'muscle gain' },
      });

      const mockDetectorLLM = vi.fn().mockResolvedValue({
        content: JSON.stringify({
          updates: [
            {
              type: 'goal',
              data: { primaryGoal: 'weight loss' },
              confidence: 0.6,
              description: 'Possible goal change',
            },
          ],
          requiresConfirmation: true,
          reply: "Did you want to change your goal to weight loss?",
        }),
      });

      (profileDetector as any).llm = { invoke: mockDetectorLLM };

      const result = await chatAgent.processMessage({
        userId: 'user123',
        message: "Maybe I should focus on losing weight",
        conversationId: 'conv123',
        db: mockDb as any,
        detectProfileUpdates: true,
      });

      expect(result.requiresConfirmation).toBe(true);
      expect(result.response).toContain("Did you want to change");
      expect(result.profileUpdated).toBe(false); // Not updated due to confirmation needed
    });

    it('should handle constraint operations', async () => {
      mockDb.executeTakeFirst.mockResolvedValueOnce({
        profile: {
          constraints: [],
        },
      });

      const ops = profileDetector.convertToOps([
        {
          type: 'constraint',
          data: {
            type: 'injury',
            label: 'Knee pain',
            severity: 'mild',
          },
          confidence: 0.9,
          description: 'New injury reported',
        },
      ]);

      expect(ops).toHaveLength(1);
      expect(ops[0].kind).toBe('add_constraint');
      expect(ops[0].constraint?.type).toBe('injury');
      expect(ops[0].constraint?.label).toBe('Knee pain');
    });

    it('should convert multiple updates to operations', async () => {
      const updates = [
        {
          type: 'metric',
          data: { metric: 'bodyweight', value: 175, unit: 'lbs' },
          confidence: 0.95,
          description: 'Weight update',
        },
        {
          type: 'goal',
          data: { primaryGoal: 'strength' },
          confidence: 0.85,
          description: 'Goal change',
        },
      ];

      const ops = profileDetector.convertToOps(updates);

      expect(ops).toHaveLength(2);
      expect(ops[0].kind).toBe('set');
      expect(ops[0].path).toBe('/metrics/bodyweight');
      expect(ops[1].kind).toBe('set');
      expect(ops[1].path).toBe('/primaryGoal');
    });
  });

  describe('Conversation context integration', () => {
    it('should maintain conversation history', async () => {
      // Mock existing messages
      mockDb.execute.mockResolvedValueOnce([
        {
          id: 'msg1',
          direction: 'inbound',
          content: "How's my progress?",
          createdAt: new Date(),
        },
        {
          id: 'msg2',
          direction: 'outbound',
          content: "You're doing great! Down 5 pounds this month.",
          createdAt: new Date(),
        },
      ]);

      mockDb.executeTakeFirst.mockResolvedValueOnce({
        profile: { primaryGoal: 'weight loss' },
      });

      mockLLM.invoke = vi.fn().mockResolvedValue({
        content: "Excellent! Keep up the momentum!",
      });

      const result = await chatAgent.processMessage({
        userId: 'user123',
        message: "I lost another 2 pounds!",
        conversationId: 'conv123',
        db: mockDb as any,
        detectProfileUpdates: false,
      });

      expect(mockLLM.invoke).toHaveBeenCalledWith(
        expect.stringContaining("How's my progress?")
      );
      expect(mockLLM.invoke).toHaveBeenCalledWith(
        expect.stringContaining("You're doing great!")
      );
    });

    it('should create new conversation if needed', async () => {
      mockDb.executeTakeFirst.mockResolvedValueOnce(null); // No existing conversation

      const result = await chatAgent.processMessage({
        userId: 'user123',
        message: "Starting my workout",
        db: mockDb as any,
        detectProfileUpdates: false,
      });

      expect(mockDb.insertInto).toHaveBeenCalledWith('conversations');
      expect(result.conversationId).toBeDefined();
    });

    it('should store messages in database', async () => {
      mockDb.executeTakeFirst.mockResolvedValueOnce({
        profile: { primaryGoal: 'muscle gain' },
      });

      mockLLM.invoke = vi.fn().mockResolvedValue({
        content: "Great job on your workout!",
      });

      await chatAgent.processMessage({
        userId: 'user123',
        message: "Just finished legs day",
        conversationId: 'conv123',
        db: mockDb as any,
        detectProfileUpdates: false,
      });

      // Should store both user and assistant messages
      expect(mockDb.insertInto).toHaveBeenCalledWith('messages');
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'inbound',
          content: "Just finished legs day",
        })
      );
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'outbound',
          content: "Great job on your workout!",
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.executeTakeFirst.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        chatAgent.processMessage({
          userId: 'user123',
          message: "Test message",
          db: mockDb as any,
          detectProfileUpdates: false,
        })
      ).rejects.toThrow('Database error');
    });

    it('should handle LLM errors gracefully', async () => {
      mockDb.executeTakeFirst.mockResolvedValueOnce({
        profile: { primaryGoal: 'muscle gain' },
      });

      mockLLM.invoke = vi.fn().mockRejectedValueOnce(new Error('LLM API error'));

      await expect(
        chatAgent.processMessage({
          userId: 'user123',
          message: "Test message",
          db: mockDb as any,
          detectProfileUpdates: false,
        })
      ).rejects.toThrow('LLM API error');
    });

    it('should handle profile update failures', async () => {
      mockDb.executeTakeFirst.mockResolvedValueOnce({
        profile: { primaryGoal: 'muscle gain' },
      });

      const mockDetectorLLM = vi.fn().mockResolvedValue({
        content: JSON.stringify({
          updates: [
            {
              type: 'metric',
              data: { metric: 'bodyweight', value: 175, unit: 'lbs' },
              confidence: 0.95,
            },
          ],
          requiresConfirmation: false,
        }),
      });

      (profileDetector as any).llm = { invoke: mockDetectorLLM };

      // Make the update fail
      mockDb.updateTable.mockImplementationOnce(() => {
        throw new Error('Update failed');
      });

      // Should handle error but still return response
      const result = await chatAgent.processMessage({
        userId: 'user123',
        message: "I'm at 175 pounds",
        conversationId: 'conv123',
        db: mockDb as any,
        detectProfileUpdates: true,
      });

      expect(result.response).toBeDefined();
      expect(result.profileUpdated).toBe(false);
    });
  });
});