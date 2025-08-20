import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatService } from '@/server/services/chatService';
import { chatAgent } from '@/server/agents/chat/chain';
import { userProfileAgent } from '@/server/agents/profile/chain';
import { mockUserWithProfile } from '../../../fixtures/userWithProfile';
import type { UserWithProfile } from '@/server/models/userModel';

// Mock the agents
vi.mock('@/server/agents/chat/chain', () => ({
  chatAgent: vi.fn()
}));

vi.mock('@/server/agents/profile/chain', () => ({
  userProfileAgent: vi.fn()
}));

// Mock repositories and services
vi.mock('@/server/repositories/conversationRepository');
vi.mock('@/server/repositories/messageRepository');
vi.mock('@/server/services/context/conversationContext');

// Mock environment variables
vi.stubEnv('SMS_MAX_LENGTH', '1600');
vi.stubEnv('PROFILE_PATCH_ENABLED', 'true');

describe('ChatService', () => {
  let chatService: ChatService;
  let mockUser: UserWithProfile;

  beforeEach(() => {
    vi.clearAllMocks();
    chatService = new ChatService();
    mockUser = mockUserWithProfile.beginnerUser().userWithProfile;
  });

  describe('handleIncomingMessage', () => {
    it('should successfully handle a message and return response', async () => {
      const testMessage = 'What workout should I do today?';
      const expectedResponse = 'Here is your workout for today: Start with squats...';
      
      // Mock profile agent - no updates
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: mockUser.parsedProfile,
        wasUpdated: false,
        updateSummary: undefined
      });
      
      // Mock chat agent response
      vi.mocked(chatAgent).mockResolvedValue({
        response: expectedResponse
      });

      const result = await chatService.handleIncomingMessage(mockUser, testMessage);

      expect(userProfileAgent).toHaveBeenCalled();
      expect(chatAgent).toHaveBeenCalled();
      expect(result).toBe(expectedResponse);
    });

    it('should handle profile updates and acknowledge them', async () => {
      const testMessage = 'I now train 5 days a week';
      const updatedProfile = {
        ...mockUser.parsedProfile,
        exerciseFrequency: '5 days per week'
      };
      
      // Mock profile agent - profile was updated
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: updatedProfile,
        wasUpdated: true,
        updateSummary: {
          fieldsUpdated: ['exerciseFrequency'],
          reason: 'User specified 5 days per week',
          confidence: 0.8
        }
      });
      
      // Mock chat agent acknowledging the update
      vi.mocked(chatAgent).mockResolvedValue({
        response: "Great! I've updated your profile to 5 days per week."
      });

      const result = await chatService.handleIncomingMessage(mockUser, testMessage);

      expect(userProfileAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          message: testMessage,
          currentProfile: mockUser.parsedProfile
        })
      );
      
      expect(chatAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: updatedProfile,
          wasProfileUpdated: true
        })
      );
      
      expect(result).toContain("5 days per week");
    });

    it('should trim whitespace from response', async () => {
      const testMessage = 'Hello';
      const responseWithWhitespace = '  Hello there!  \n';
      
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: mockUser.parsedProfile,
        wasUpdated: false
      });
      
      vi.mocked(chatAgent).mockResolvedValue({
        response: responseWithWhitespace
      });

      const result = await chatService.handleIncomingMessage(mockUser, testMessage);
      
      expect(result).toBe('Hello there!');
    });

    it('should truncate long responses for SMS', async () => {
      const testMessage = 'Tell me everything';
      const longResponse = 'A'.repeat(2000);
      
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: mockUser.parsedProfile,
        wasUpdated: false
      });
      
      vi.mocked(chatAgent).mockResolvedValue({
        response: longResponse
      });

      const result = await chatService.handleIncomingMessage(mockUser, testMessage);
      
      expect(result.length).toBe(1600);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const testMessage = 'Test message';
      
      vi.mocked(userProfileAgent).mockRejectedValue(new Error('Profile API Error'));

      const result = await chatService.handleIncomingMessage(mockUser, testMessage);
      
      expect(result).toContain("Sorry, I'm having trouble");
    });

    it('should work with user without profile', async () => {
      const userWithoutProfile = mockUserWithProfile.userWithoutProfile().userWithProfile;
      const testMessage = 'Hello';
      const expectedResponse = 'Welcome! Let me help you get started.';
      
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: null,
        wasUpdated: false
      });
      
      vi.mocked(chatAgent).mockResolvedValue({
        response: expectedResponse
      });

      const result = await chatService.handleIncomingMessage(userWithoutProfile, testMessage);
      
      expect(result).toBe(expectedResponse);
    });
  });

  describe('handleSimpleMessage', () => {
    it('should process message without conversation context', async () => {
      const testMessage = 'Quick question';
      const expectedResponse = 'Here is a quick answer';
      
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: mockUser.parsedProfile,
        wasUpdated: false
      });
      
      vi.mocked(chatAgent).mockResolvedValue({
        response: expectedResponse
      });

      const result = await chatService.handleSimpleMessage(mockUser, testMessage);
      
      expect(chatAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          message: testMessage,
          userName: mockUser.name
        })
      );
      expect(result).toBe(expectedResponse);
    });
  });
});