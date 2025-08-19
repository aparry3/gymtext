import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatAgent, contextualChatAgent } from '@/server/agents/chat/chain';
import type { FitnessProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';

// Mock the LangChain models
vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    invoke: vi.fn()
  }))
}));

vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    invoke: vi.fn()
  }))
}));

describe('ChatAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('chatAgent', () => {
    it('should generate response with profile context', async () => {
      const profile: FitnessProfile = {
        userId: 'user-123',
        age: 30,
        gender: 'male',
        experienceLevel: 'intermediate',
        fitnessGoals: 'build muscle',
        exerciseFrequency: '4 days per week',
        equipment: { access: 'gym' }
      };

      const ChatGoogleGenerativeAI = (await import('@langchain/google-genai')).ChatGoogleGenerativeAI;
      const mockModel = new ChatGoogleGenerativeAI();
      
      const expectedResponse = "Based on your intermediate level and muscle-building goals, here's today's workout...";
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: expectedResponse
      } as any);

      const result = await chatAgent({
        userName: 'John',
        message: 'What should I train today?',
        profile,
        wasProfileUpdated: false,
        conversationHistory: [],
        context: {},
        config: { model: 'gemini-2.0-flash', temperature: 0.7 }
      });

      expect(result.response).toBe(expectedResponse);
      expect(vi.mocked(mockModel.invoke)).toHaveBeenCalledTimes(1);
      
      // Verify system message includes profile info
      const invokeCall = vi.mocked(mockModel.invoke).mock.calls[0][0];
      expect(invokeCall[0].content).toContain('Fitness Level: intermediate');
      expect(invokeCall[0].content).toContain('Primary Goal: build muscle');
      expect(invokeCall[0].content).toContain('Training Days: 4 days per week');
    });

    it('should acknowledge profile updates when wasProfileUpdated is true', async () => {
      const profile: FitnessProfile = {
        userId: 'user-123',
        age: 25,
        gender: 'female',
        experienceLevel: 'advanced',
        exerciseFrequency: '5 days per week'
      };

      const ChatGoogleGenerativeAI = (await import('@langchain/google-genai')).ChatGoogleGenerativeAI;
      const mockModel = new ChatGoogleGenerativeAI();
      
      const expectedResponse = "Got it! I've updated your profile to reflect 5 training days. Here's your new split...";
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: expectedResponse
      } as any);

      const result = await chatAgent({
        userName: 'Jane',
        message: 'I now train 5 days a week',
        profile,
        wasProfileUpdated: true, // Profile was just updated
        conversationHistory: [],
        context: {},
        config: { temperature: 0.7 }
      });

      expect(result.response).toBe(expectedResponse);
      
      // Verify system message includes update acknowledgment
      const invokeCall = vi.mocked(mockModel.invoke).mock.calls[0][0];
      expect(invokeCall[0].content).toContain('profile was just updated');
      expect(invokeCall[0].content).toContain('acknowledge the update');
    });

    it('should include conversation history in the prompt', async () => {
      const profile: FitnessProfile = {
        userId: 'user-123',
        age: 28,
        gender: 'male'
      };

      const conversationHistory: Message[] = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          userId: 'user-123',
          direction: 'inbound',
          content: 'Can you help me with a workout?',
          phoneFrom: '+1234567890',
          phoneTo: '+0987654321',
          createdAt: new Date('2024-01-15T10:00:00Z')
        },
        {
          id: 'msg-2',
          conversationId: 'conv-1',
          userId: 'user-123',
          direction: 'outbound',
          content: 'Of course! What muscle groups do you want to focus on?',
          phoneFrom: '+0987654321',
          phoneTo: '+1234567890',
          createdAt: new Date('2024-01-15T10:01:00Z')
        }
      ];

      const ChatGoogleGenerativeAI = (await import('@langchain/google-genai')).ChatGoogleGenerativeAI;
      const mockModel = new ChatGoogleGenerativeAI();
      
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: "Let's focus on upper body today..."
      } as any);

      await chatAgent({
        userName: 'Mike',
        message: 'Upper body please',
        profile,
        wasProfileUpdated: false,
        conversationHistory,
        context: {},
        config: {}
      });

      // Verify conversation history is included in the prompt
      const invokeCall = vi.mocked(mockModel.invoke).mock.calls[0][0];
      expect(invokeCall[1].content).toContain('Conversation History');
      expect(invokeCall[1].content).toContain('User: Can you help me with a workout?');
      expect(invokeCall[1].content).toContain('Assistant: Of course! What muscle groups do you want to focus on?');
    });

    it('should handle null profile gracefully', async () => {
      const ChatGoogleGenerativeAI = (await import('@langchain/google-genai')).ChatGoogleGenerativeAI;
      const mockModel = new ChatGoogleGenerativeAI();
      
      const expectedResponse = "I don't have your fitness profile yet. Could you tell me about your fitness level and goals?";
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: expectedResponse
      } as any);

      const result = await chatAgent({
        userName: 'NewUser',
        message: 'Help me get started',
        profile: null,
        wasProfileUpdated: false,
        conversationHistory: [],
        context: {},
        config: {}
      });

      expect(result.response).toBe(expectedResponse);
      
      // Verify system message handles null profile
      const invokeCall = vi.mocked(mockModel.invoke).mock.calls[0][0];
      expect(invokeCall[0].content).toContain('No profile available');
    });

    it('should include additional context when provided', async () => {
      const profile: FitnessProfile = {
        userId: 'user-123',
        age: 35,
        gender: 'male'
      };

      const context = {
        lastWorkout: {
          date: '2024-01-14',
          type: 'legs',
          exercises: ['squats', 'lunges', 'leg press']
        },
        currentProgram: 'PPL Split'
      };

      const ChatGoogleGenerativeAI = (await import('@langchain/google-genai')).ChatGoogleGenerativeAI;
      const mockModel = new ChatGoogleGenerativeAI();
      
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: "Since you did legs yesterday, let's do push today..."
      } as any);

      await chatAgent({
        userName: 'Tom',
        message: "What's next in my program?",
        profile,
        wasProfileUpdated: false,
        conversationHistory: [],
        context,
        config: {}
      });

      // Verify context is included in the prompt
      const invokeCall = vi.mocked(mockModel.invoke).mock.calls[0][0];
      expect(invokeCall[1].content).toContain('Additional Context');
      expect(invokeCall[1].content).toContain('lastWorkout');
      expect(invokeCall[1].content).toContain('currentProgram');
      expect(invokeCall[1].content).toContain('PPL Split');
    });

    it('should handle errors and return fallback message', async () => {
      const profile: FitnessProfile = {
        userId: 'user-123',
        age: 30,
        gender: 'male'
      };

      const ChatGoogleGenerativeAI = (await import('@langchain/google-genai')).ChatGoogleGenerativeAI;
      const mockModel = new ChatGoogleGenerativeAI();
      
      vi.mocked(mockModel.invoke).mockRejectedValue(new Error('API error'));

      const result = await chatAgent({
        userName: 'ErrorUser',
        message: 'Help',
        profile,
        wasProfileUpdated: false,
        conversationHistory: [],
        context: {},
        config: {}
      });

      expect(result.response).toContain("I apologize, but I'm having trouble processing");
    });

    it('should use OpenAI model when specified', async () => {
      const profile: FitnessProfile = {
        userId: 'user-123',
        age: 25,
        gender: 'female'
      };

      const ChatOpenAI = (await import('@langchain/openai')).ChatOpenAI;
      const mockModel = new ChatOpenAI();
      
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: "Let's work on your flexibility today..."
      } as any);

      const result = await chatAgent({
        userName: 'Alice',
        message: 'I need to improve flexibility',
        profile,
        wasProfileUpdated: false,
        conversationHistory: [],
        context: {},
        config: { model: 'gpt-4-turbo', temperature: 0.5 }
      });

      expect(result.response).toContain("flexibility");
      expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-4-turbo',
        temperature: 0.5,
        maxTokens: 500
      }));
    });
  });

  describe('contextualChatAgent', () => {
    it('should generate response with full context', async () => {
      const profile: FitnessProfile = {
        userId: 'user-123',
        age: 32,
        gender: 'male',
        experienceLevel: 'intermediate'
      };

      const context = {
        userProfile: profile,
        recentWorkouts: [
          { date: '2024-01-13', type: 'push' },
          { date: '2024-01-14', type: 'pull' }
        ],
        currentMesocycle: 'strength',
        weekNumber: 3
      };

      const ChatGoogleGenerativeAI = (await import('@langchain/google-genai')).ChatGoogleGenerativeAI;
      const mockModel = new ChatGoogleGenerativeAI();
      
      const expectedResponse = "Week 3 of your strength cycle - time for legs with heavier weights...";
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: expectedResponse
      } as any);

      const result = await contextualChatAgent({
        userName: 'Bob',
        message: "What's my workout today?",
        profile,
        wasProfileUpdated: false,
        context,
        config: {}
      });

      expect(result.response).toBe(expectedResponse);
      
      // Verify context is properly passed
      const invokeCall = vi.mocked(mockModel.invoke).mock.calls[0][0];
      expect(invokeCall).toContain('Week 3 of your strength cycle');
    });

    it('should handle profile updates in contextual chat', async () => {
      const profile: FitnessProfile = {
        userId: 'user-123',
        age: 28,
        gender: 'female',
        equipment: { 
          access: 'home',
          available: ['dumbbells', 'resistance bands']
        }
      };

      const context = {
        profileUpdateHistory: [
          { field: 'equipment', oldValue: 'gym', newValue: 'home' }
        ]
      };

      const ChatGoogleGenerativeAI = (await import('@langchain/google-genai')).ChatGoogleGenerativeAI;
      const mockModel = new ChatGoogleGenerativeAI();
      
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: "Great! I've noted you're training at home now. Here's a dumbbell workout..."
      } as any);

      const result = await contextualChatAgent({
        userName: 'Sarah',
        message: 'I switched to home workouts',
        profile,
        wasProfileUpdated: true,
        context,
        config: { verbose: true }
      });

      expect(result.response).toContain("home");
      expect(result.response).toContain("dumbbell");
    });

    it('should handle errors in contextual chat', async () => {
      const profile: FitnessProfile = {
        userId: 'user-123',
        age: 30,
        gender: 'male'
      };

      const ChatGoogleGenerativeAI = (await import('@langchain/google-genai')).ChatGoogleGenerativeAI;
      const mockModel = new ChatGoogleGenerativeAI();
      
      vi.mocked(mockModel.invoke).mockRejectedValue(new Error('Context processing error'));

      const result = await contextualChatAgent({
        userName: 'ErrorUser',
        message: 'Help',
        profile,
        wasProfileUpdated: false,
        context: { someContext: 'data' },
        config: {}
      });

      expect(result.response).toContain("I apologize");
    });
  });
});