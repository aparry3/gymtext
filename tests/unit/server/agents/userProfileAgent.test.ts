import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userProfileAgent } from '@/server/agents/profile/chain';
import { ProfilePatchService } from '@/server/services/profilePatchService';
import type { FitnessProfile } from '@/server/models/userModel';

// Mock the ProfilePatchService
vi.mock('@/server/services/profilePatchService', () => ({
  ProfilePatchService: vi.fn().mockImplementation(() => ({
    applyPatch: vi.fn()
  }))
}));

// Mock the LangChain models
vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    bindTools: vi.fn().mockReturnThis(),
    invoke: vi.fn()
  }))
}));

vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    bindTools: vi.fn().mockReturnThis(),
    invoke: vi.fn()
  }))
}));

describe('UserProfileAgent', () => {
  let mockPatchService: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockPatchService = new ProfilePatchService();
  });

  describe('Profile extraction and updating', () => {
    it('should extract and update profile information from user message', async () => {
      const currentProfile: FitnessProfile = {
        userId: 'user-123',
        age: 25,
        gender: 'male',
        experienceLevel: 'beginner',
        fitnessGoals: 'build muscle',
        exerciseFrequency: '3 days per week',
        equipment: { 
          access: 'gym', 
          available: ['barbell', 'dumbbells', 'machines'] 
        },
        availability: {
          daysPerWeek: 3,
          minutesPerSession: 60,
          preferredDays: ['monday', 'wednesday', 'friday']
        }
      };

      const message = "I've been training for 2 years now and I go to the gym 5 days a week";
      
      // Mock the LLM response with tool calls
      const ChatOpenAI = (await import('@langchain/openai')).ChatOpenAI;
      const mockModel = new ChatOpenAI();
      
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: '',
        tool_calls: [{
          name: 'profilePatchTool',
          args: {
            patch: {
              experienceLevel: 'intermediate',
              exerciseFrequency: '5 days per week',
              availability: {
                daysPerWeek: 5
              }
            },
            confidence: 0.8,
            reason: 'User mentioned 2 years experience (intermediate level) and training 5 days per week'
          }
        }]
      } as any);

      // Mock the patch service to return updated profile
      const updatedProfile = {
        ...currentProfile,
        experienceLevel: 'intermediate',
        exerciseFrequency: '5 days per week',
        availability: {
          ...currentProfile.availability,
          daysPerWeek: 5
        }
      };

      mockPatchService.applyPatch.mockResolvedValue({
        profile: updatedProfile,
        updateId: 'update-123',
        fieldsUpdated: ['experienceLevel', 'exerciseFrequency', 'availability.daysPerWeek']
      });

      const result = await userProfileAgent({
        userId: 'user-123',
        message,
        currentProfile,
        config: { model: 'gpt-4-turbo', verbose: false }
      });

      expect(result.wasUpdated).toBe(true);
      expect(result.profile).toEqual(updatedProfile);
      expect(result.updateSummary).toEqual({
        fieldsUpdated: ['experienceLevel', 'exerciseFrequency', 'availability.daysPerWeek'],
        reason: 'User mentioned 2 years experience (intermediate level) and training 5 days per week',
        confidence: 0.8
      });
    });

    it('should not update profile when confidence is below threshold', async () => {
      const currentProfile: FitnessProfile = {
        userId: 'user-123',
        age: 30,
        gender: 'female',
        experienceLevel: 'intermediate',
        fitnessGoals: 'lose weight'
      };

      const message = "Maybe I should try going to the gym more often";
      
      const ChatOpenAI = (await import('@langchain/openai')).ChatOpenAI;
      const mockModel = new ChatOpenAI();
      
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: '',
        tool_calls: [{
          name: 'profilePatchTool',
          args: {
            patch: {
              exerciseFrequency: 'more often'
            },
            confidence: 0.3, // Below threshold
            reason: 'User is considering changing frequency but not definitive'
          }
        }]
      } as any);

      const result = await userProfileAgent({
        userId: 'user-123',
        message,
        currentProfile,
        config: { verbose: false }
      });

      expect(result.wasUpdated).toBe(false);
      expect(result.profile).toEqual(currentProfile);
      expect(result.updateSummary).toBeNull();
      expect(mockPatchService.applyPatch).not.toHaveBeenCalled();
    });

    it('should handle messages with no profile information', async () => {
      const currentProfile: FitnessProfile = {
        userId: 'user-123',
        age: 28,
        gender: 'male',
        experienceLevel: 'beginner'
      };

      const message = "What's the weather like today?";
      
      const ChatOpenAI = (await import('@langchain/openai')).ChatOpenAI;
      const mockModel = new ChatOpenAI();
      
      // No tool calls for non-profile related message
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: 'No profile information to extract',
        tool_calls: []
      } as any);

      const result = await userProfileAgent({
        userId: 'user-123',
        message,
        currentProfile,
        config: { verbose: false }
      });

      expect(result.wasUpdated).toBe(false);
      expect(result.profile).toEqual(currentProfile);
      expect(result.updateSummary).toBeNull();
      expect(mockPatchService.applyPatch).not.toHaveBeenCalled();
    });

    it('should handle multiple profile updates in one message', async () => {
      const currentProfile: FitnessProfile = {
        userId: 'user-123',
        age: 35,
        gender: 'male',
        experienceLevel: 'beginner',
        fitnessGoals: 'general fitness'
      };

      const message = "I'm 40 years old now, been training for 5 years at Planet Fitness, and my goal is to build muscle and lose fat";
      
      const ChatOpenAI = (await import('@langchain/openai')).ChatOpenAI;
      const mockModel = new ChatOpenAI();
      
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: '',
        tool_calls: [{
          name: 'profilePatchTool',
          args: {
            patch: {
              age: 40,
              experienceLevel: 'advanced',
              fitnessGoals: 'build muscle and lose fat',
              equipment: {
                access: 'gym',
                gymName: 'Planet Fitness'
              }
            },
            confidence: 0.9,
            reason: 'User provided specific age (40), 5 years experience (advanced), clear goals, and gym name'
          }
        }]
      } as any);

      const updatedProfile = {
        ...currentProfile,
        age: 40,
        experienceLevel: 'advanced',
        fitnessGoals: 'build muscle and lose fat',
        equipment: {
          access: 'gym',
          gymName: 'Planet Fitness'
        }
      };

      mockPatchService.applyPatch.mockResolvedValue({
        profile: updatedProfile,
        updateId: 'update-456',
        fieldsUpdated: ['age', 'experienceLevel', 'fitnessGoals', 'equipment']
      });

      const result = await userProfileAgent({
        userId: 'user-123',
        message,
        currentProfile,
        config: { verbose: false }
      });

      expect(result.wasUpdated).toBe(true);
      expect(result.profile.age).toBe(40);
      expect(result.profile.experienceLevel).toBe('advanced');
      expect(result.profile.fitnessGoals).toBe('build muscle and lose fat');
      expect(result.profile.equipment).toEqual({
        access: 'gym',
        gymName: 'Planet Fitness'
      });
    });

    it('should handle errors gracefully', async () => {
      const currentProfile: FitnessProfile = {
        userId: 'user-123',
        age: 25,
        gender: 'male'
      };

      const message = "I train 4 days a week";
      
      const ChatOpenAI = (await import('@langchain/openai')).ChatOpenAI;
      const mockModel = new ChatOpenAI();
      
      // Mock an error in the LLM
      vi.mocked(mockModel.invoke).mockRejectedValue(new Error('LLM API error'));

      const result = await userProfileAgent({
        userId: 'user-123',
        message,
        currentProfile,
        config: { verbose: false }
      });

      expect(result.wasUpdated).toBe(false);
      expect(result.profile).toEqual(currentProfile);
      expect(result.updateSummary).toBeNull();
    });

    it('should use Gemini model when specified', async () => {
      const currentProfile: FitnessProfile = {
        userId: 'user-123',
        age: 30,
        gender: 'female'
      };

      const message = "I prefer home workouts with dumbbells";
      
      const ChatGoogleGenerativeAI = (await import('@langchain/google-genai')).ChatGoogleGenerativeAI;
      const mockModel = new ChatGoogleGenerativeAI();
      
      vi.mocked(mockModel.invoke).mockResolvedValue({
        content: '',
        tool_calls: [{
          name: 'profilePatchTool',
          args: {
            patch: {
              equipment: {
                access: 'home',
                available: ['dumbbells']
              }
            },
            confidence: 0.85,
            reason: 'User specified home workouts with dumbbells'
          }
        }]
      } as any);

      const updatedProfile = {
        ...currentProfile,
        equipment: {
          access: 'home',
          available: ['dumbbells']
        }
      };

      mockPatchService.applyPatch.mockResolvedValue({
        profile: updatedProfile,
        updateId: 'update-789',
        fieldsUpdated: ['equipment']
      });

      const result = await userProfileAgent({
        userId: 'user-123',
        message,
        currentProfile,
        config: { model: 'gemini-pro', verbose: false }
      });

      expect(result.wasUpdated).toBe(true);
      expect(result.profile.equipment).toEqual({
        access: 'home',
        available: ['dumbbells']
      });
    });
  });
});