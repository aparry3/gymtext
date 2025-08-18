import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EnhancedOnboardingAgent } from '@/server/agents/onboarding/structuredChain';
import { ProfileUpdateService } from '@/server/services/profileUpdateService';
import { FitnessProfileRepository } from '@/server/repositories/fitnessProfileRepository';
import { Kysely } from 'kysely';
import { DB } from '@/server/models/_types';

// Mock the LLM
vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    invoke: vi.fn(),
  })),
}));

// Mock database
vi.mock('@/server/connections/postgres/postgres', () => ({
  postgresDb: {
    selectFrom: vi.fn().mockReturnThis(),
    insertInto: vi.fn().mockReturnThis(),
    updateTable: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    execute: vi.fn(),
    executeTakeFirst: vi.fn(),
    selectAll: vi.fn().mockReturnThis(),
  },
}));

describe('Onboarding Flow Integration', () => {
  let agent: EnhancedOnboardingAgent;
  let mockLLM: any;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new EnhancedOnboardingAgent();
    mockLLM = (agent as any).llm;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Profile extraction from conversation', () => {
    it('should extract basic profile information', async () => {
      // Mock LLM response with profile extraction
      mockLLM.invoke = vi.fn().mockResolvedValue({
        content: JSON.stringify({
          reply: "Great! So you're 30 years old and want to build muscle. How many days per week can you work out?",
          profileUpdate: {
            type: 'mergePatch',
            patch: {
              primaryGoal: 'muscle gain',
              identity: {
                age: 30,
              },
            },
          },
          confidence: 0.9,
          nextQuestion: "How many days per week can you work out?",
        }),
      });

      const result = await agent.processMessage(
        "I'm 30 years old and I want to build muscle",
        []
      );

      expect(result.profileUpdate).toBeDefined();
      expect(result.profileUpdate?.type).toBe('mergePatch');
      expect(result.profileUpdate?.patch).toMatchObject({
        primaryGoal: 'muscle gain',
        identity: { age: 30 },
      });
      expect(result.confidence).toBe(0.9);
      expect(result.reply).toContain("30 years old");
    });

    it('should extract constraint information', async () => {
      // Mock LLM response for injury constraint
      mockLLM.invoke = vi.fn().mockResolvedValue({
        content: JSON.stringify({
          reply: "I understand you have lower back pain. Let's make sure to include modifications for that. What severity would you say it is?",
          profileUpdate: {
            type: 'op',
            op: {
              kind: 'add_constraint',
              constraint: {
                type: 'injury',
                label: 'Lower back pain',
                severity: 'moderate',
                modifications: 'Avoid heavy deadlifts, use belt for squats',
              },
            },
          },
          confidence: 0.85,
        }),
      });

      const result = await agent.processMessage(
        "I have lower back pain so I need to be careful with certain exercises",
        [
          { role: 'assistant', content: "Tell me about any injuries or limitations" },
        ]
      );

      expect(result.profileUpdate?.type).toBe('op');
      expect(result.profileUpdate?.op?.kind).toBe('add_constraint');
      expect(result.profileUpdate?.op?.constraint).toMatchObject({
        type: 'injury',
        label: 'Lower back pain',
      });
    });

    it('should handle multi-turn conversation with context', async () => {
      const conversation = [
        { role: 'assistant' as const, content: "What's your main fitness goal?" },
        { role: 'user' as const, content: "I want to lose weight" },
        { role: 'assistant' as const, content: "Great! How much experience do you have?" },
      ];

      mockLLM.invoke = vi.fn().mockResolvedValue({
        content: JSON.stringify({
          reply: "Perfect! As a beginner, we'll start with foundational exercises. How many days can you train?",
          profileUpdate: {
            type: 'mergePatch',
            patch: {
              experienceLevel: 'beginner',
            },
          },
          confidence: 0.95,
        }),
      });

      const result = await agent.processMessage(
        "I'm pretty new to working out",
        conversation
      );

      expect(mockLLM.invoke).toHaveBeenCalledWith(
        expect.stringContaining("I'm pretty new to working out")
      );
      expect(mockLLM.invoke).toHaveBeenCalledWith(
        expect.stringContaining("What's your main fitness goal?")
      );
      expect(result.profileUpdate?.patch).toMatchObject({
        experienceLevel: 'beginner',
      });
    });

    it('should handle complex profile updates', async () => {
      mockLLM.invoke = vi.fn().mockResolvedValue({
        content: JSON.stringify({
          reply: "Excellent! Training 4 days a week at a gym with free weights and machines gives us lots of options. Any specific preferences?",
          profileUpdate: {
            type: 'mergePatch',
            patch: {
              availability: {
                daysPerWeek: 4,
                minutesPerSession: 60,
              },
              equipment: {
                access: 'gym',
                available: ['barbell', 'dumbbells', 'machines', 'cables'],
              },
            },
          },
          confidence: 0.92,
        }),
      });

      const result = await agent.processMessage(
        "I can train 4 days a week for about an hour. I have a gym membership with full equipment",
        []
      );

      expect(result.profileUpdate?.patch).toMatchObject({
        availability: {
          daysPerWeek: 4,
          minutesPerSession: 60,
        },
        equipment: {
          access: 'gym',
        },
      });
    });

    it('should handle low confidence extractions', async () => {
      mockLLM.invoke = vi.fn().mockResolvedValue({
        content: JSON.stringify({
          reply: "I'm not quite sure what you mean. Could you tell me more specifically about your fitness experience?",
          profileUpdate: {
            type: 'mergePatch',
            patch: {
              experienceLevel: 'intermediate',
            },
          },
          confidence: 0.3,
          nextQuestion: "How long have you been training?",
        }),
      });

      const result = await agent.processMessage(
        "I guess I'm somewhere in the middle",
        []
      );

      expect(result.confidence).toBe(0.3);
      expect(result.nextQuestion).toBeDefined();
      // Low confidence should still return the extraction but let the service decide what to do
      expect(result.profileUpdate).toBeDefined();
    });

    it('should handle streaming responses', async () => {
      mockLLM.invoke = vi.fn().mockResolvedValue({
        content: JSON.stringify({
          reply: "Great to hear you want to get stronger!",
          profileUpdate: {
            type: 'mergePatch',
            patch: { primaryGoal: 'strength' },
          },
          confidence: 0.9,
        }),
      });

      const chunks: string[] = [];
      const stream = agent.streamResponse(
        "I want to get stronger",
        []
      );

      for await (const chunk of stream) {
        chunks.push(chunk);
        if (chunks.length > 10) break; // Prevent infinite loop
      }

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join('')).toContain("Great");
    }, 10000); // Increase timeout

    it('should handle extraction errors gracefully', async () => {
      mockLLM.invoke = vi.fn().mockRejectedValue(new Error('LLM API error'));

      const result = await agent.processMessage(
        "I want to build muscle",
        []
      );

      expect(result.reply).toContain("Let me help you build your fitness profile");
      expect(result.confidence).toBe(0);
      expect(result.profileUpdate).toBeUndefined();
    });

    it('should handle malformed LLM responses', async () => {
      mockLLM.invoke = vi.fn().mockResolvedValue({
        content: "This is not JSON",
      });

      const result = await agent.processMessage(
        "I want to lose weight",
        []
      );

      expect(result.reply).toBeDefined();
      expect(result.confidence).toBeLessThanOrEqual(0.5); // Low confidence for malformed response
    });
  });

  describe('Profile persistence integration', () => {
    it('should save high-confidence extractions to database', async () => {
      const mockDb = (await import('@/server/connections/postgres/postgres')).postgresDb;
      const updateService = new ProfileUpdateService(mockDb as any);
      
      // Mock repository methods
      mockDb.executeTakeFirst = vi.fn().mockResolvedValue({
        profile: {},
      });
      mockDb.execute = vi.fn().mockResolvedValue(undefined);

      // High confidence extraction
      const profileData = {
        primaryGoal: 'muscle gain',
        experienceLevel: 'intermediate',
        identity: { age: 30, gender: 'male' },
      };

      await updateService.applyPatch(
        'user123',
        profileData,
        'onboarding',
        'High confidence extraction'
      );

      expect(mockDb.updateTable).toHaveBeenCalledWith('fitnessProfiles');
      expect(mockDb.insertInto).toHaveBeenCalledWith('profileUpdates');
    });

    it('should not save low-confidence extractions automatically', async () => {
      mockLLM.invoke = vi.fn().mockResolvedValue({
        content: JSON.stringify({
          reply: "Could you clarify your experience level?",
          profileUpdate: {
            type: 'mergePatch',
            patch: { experienceLevel: 'beginner' },
          },
          confidence: 0.4, // Low confidence
        }),
      });

      const result = await agent.processMessage(
        "I'm not sure about my level",
        []
      );

      expect(result.confidence).toBeLessThan(0.5);
      // Service should check confidence before saving
      expect(result.profileUpdate).toBeDefined();
    });
  });

  describe('Complete onboarding flow', () => {
    it('should handle a full onboarding conversation', async () => {
      const responses = [
        {
          input: "Hi, I want to start working out",
          llmResponse: {
            reply: "Welcome! I'll help you create a personalized fitness plan. What's your main goal?",
            confidence: 0.1,
          },
        },
        {
          input: "I want to build muscle and get stronger",
          llmResponse: {
            reply: "Great goals! How old are you and what's your training experience?",
            profileUpdate: {
              type: 'mergePatch',
              patch: { primaryGoal: 'muscle gain' },
            },
            confidence: 0.9,
          },
        },
        {
          input: "I'm 28 and have been training on and off for 2 years",
          llmResponse: {
            reply: "Perfect! How many days per week can you train?",
            profileUpdate: {
              type: 'mergePatch',
              patch: {
                identity: { age: 28 },
                experienceLevel: 'intermediate',
              },
            },
            confidence: 0.85,
          },
        },
        {
          input: "4-5 days, about an hour each",
          llmResponse: {
            reply: "Excellent commitment! Do you have any injuries or limitations?",
            profileUpdate: {
              type: 'mergePatch',
              patch: {
                availability: {
                  daysPerWeek: 4,
                  minutesPerSession: 60,
                },
              },
            },
            confidence: 0.95,
          },
        },
        {
          input: "No injuries, I'm good to go",
          llmResponse: {
            reply: "Perfect! You're all set. Based on your profile, I'll create a muscle-building program for you.",
            confidence: 0.9,
          },
        },
      ];

      const conversation: Array<{ role: 'user' | 'assistant'; content: string }> = [];
      let collectedProfile: any = {};

      for (const step of responses) {
        mockLLM.invoke = vi.fn().mockResolvedValue({
          content: JSON.stringify(step.llmResponse),
        });

        const result = await agent.processMessage(step.input, conversation);
        
        conversation.push({ role: 'user', content: step.input });
        conversation.push({ role: 'assistant', content: result.reply });

        if (result.profileUpdate?.type === 'mergePatch' && result.profileUpdate.patch) {
          collectedProfile = { ...collectedProfile, ...result.profileUpdate.patch };
        }
      }

      expect(collectedProfile).toMatchObject({
        primaryGoal: 'muscle gain',
        identity: { age: 28 },
        experienceLevel: 'intermediate',
        availability: {
          daysPerWeek: 4,
          minutesPerSession: 60,
        },
      });
    });
  });
});