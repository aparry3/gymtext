import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatService } from '@/server/services/chatService';
import { userProfileAgent } from '@/server/agents/profile/chain';
import { chatAgent, contextualChatAgent } from '@/server/agents/chat/chain';
import { ConversationContextService } from '@/server/services/context/conversationContext';
import { MessageRepository } from '@/server/repositories/messageRepository';
import { ConversationRepository } from '@/server/repositories/conversationRepository';
import { mockUserWithProfile } from '../../../fixtures/userWithProfile';
import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';

// Mock the agents
vi.mock('@/server/agents/profile/chain', () => ({
  userProfileAgent: vi.fn()
}));

vi.mock('@/server/agents/chat/chain', () => ({
  chatAgent: vi.fn(),
  contextualChatAgent: vi.fn()
}));

// Mock the services and repositories
vi.mock('@/server/services/context/conversationContext', () => ({
  ConversationContextService: vi.fn().mockImplementation(() => ({
    getContext: vi.fn()
  }))
}));

vi.mock('@/server/repositories/messageRepository', () => ({
  MessageRepository: vi.fn().mockImplementation(() => ({
    findByConversationId: vi.fn()
  }))
}));

vi.mock('@/server/repositories/conversationRepository', () => ({
  ConversationRepository: vi.fn().mockImplementation(() => ({
    findById: vi.fn()
  }))
}));

// Mock environment variables
vi.stubEnv('SMS_MAX_LENGTH', '1600');
vi.stubEnv('PROFILE_PATCH_ENABLED', 'true');
vi.stubEnv('NODE_ENV', 'test');

describe('ChatService', () => {
  let chatService: ChatService;
  let mockUser: UserWithProfile;
  let mockContextService: any;
  let mockMessageRepo: any;
  let mockConversationRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    chatService = new ChatService();
    mockUser = mockUserWithProfile.beginnerUser().userWithProfile;
    
    // Get mocked instances
    mockContextService = new ConversationContextService();
    mockMessageRepo = new MessageRepository();
    mockConversationRepo = new ConversationRepository();
  });

  describe('handleIncomingMessage - Two-Agent Architecture', () => {
    it('should orchestrate UserProfileAgent and ChatAgent correctly', async () => {
      const testMessage = 'I now train 5 days a week at Planet Fitness';
      const conversationId = 'conv-123';
      
      // Mock conversation
      mockConversationRepo.findById.mockResolvedValue({
        id: conversationId,
        userId: mockUser.id,
        status: 'active'
      });

      // Mock previous messages (excluding current)
      const previousMessages: Message[] = [
        {
          id: 'msg-1',
          conversationId,
          userId: mockUser.id,
          direction: 'inbound',
          content: 'Can you help me with a workout?',
          phoneFrom: '+1234567890',
          phoneTo: '+0987654321',
          createdAt: new Date()
        }
      ];
      mockMessageRepo.findByConversationId.mockResolvedValue(previousMessages);

      // Mock context
      mockContextService.getContext.mockResolvedValue({
        userProfile: mockUser.parsedProfile,
        workoutHistory: []
      });

      // Mock UserProfileAgent response - profile was updated
      const updatedProfile = {
        ...mockUser.parsedProfile,
        exerciseFrequency: '5 days per week',
        equipment: { access: 'gym', gymName: 'Planet Fitness' }
      };
      
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: updatedProfile,
        wasUpdated: true,
        updateSummary: {
          fieldsUpdated: ['exerciseFrequency', 'equipment'],
          reason: 'User specified training 5 days per week at Planet Fitness',
          confidence: 0.9
        }
      });

      // Mock ChatAgent response acknowledging the update
      const expectedResponse = "Great! I've updated your profile to reflect 5 training days at Planet Fitness. Here's your new workout split...";
      vi.mocked(chatAgent).mockResolvedValue({
        response: expectedResponse
      });

      const result = await chatService.handleIncomingMessage(
        mockUser, 
        testMessage,
        conversationId
      );

      // Verify UserProfileAgent was called with correct params
      expect(userProfileAgent).toHaveBeenCalledWith({
        userId: mockUser.id,
        message: testMessage,
        currentProfile: mockUser.parsedProfile,
        config: expect.objectContaining({
          model: 'gpt-4-turbo',
          temperature: 0.2
        })
      });

      // Verify ChatAgent was called with updated profile and wasProfileUpdated flag
      expect(chatAgent).toHaveBeenCalledWith({
        userName: mockUser.name,
        message: testMessage,
        profile: updatedProfile,
        wasProfileUpdated: true,
        conversationHistory: previousMessages,
        context: expect.any(Object),
        config: expect.objectContaining({
          model: 'gemini-2.0-flash',
          temperature: 0.7
        })
      });

      expect(result).toBe(expectedResponse);
    });

    it('should skip profile updates when PROFILE_PATCH_ENABLED is false', async () => {
      vi.stubEnv('PROFILE_PATCH_ENABLED', 'false');
      
      // Recreate service to pick up env change
      chatService = new ChatService();
      
      const testMessage = 'I train 4 days a week now';
      
      // Mock ChatAgent response
      vi.mocked(chatAgent).mockResolvedValue({
        response: 'Got it! Training 4 days a week is great for recovery.'
      });

      // Mock context
      mockContextService.getContext.mockResolvedValue({});
      mockMessageRepo.findByConversationId.mockResolvedValue([]);

      const result = await chatService.handleIncomingMessage(
        mockUser, 
        testMessage
      );

      // Verify UserProfileAgent was NOT called
      expect(userProfileAgent).not.toHaveBeenCalled();

      // Verify ChatAgent was called with original profile
      expect(chatAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: mockUser.parsedProfile,
          wasProfileUpdated: false
        })
      );
    });

    it('should handle case when profile is not updated (low confidence)', async () => {
      const testMessage = 'Maybe I should try going to the gym more';
      
      // Mock UserProfileAgent response - no update due to low confidence
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: mockUser.parsedProfile, // Same profile, no changes
        wasUpdated: false,
        updateSummary: null
      });

      // Mock ChatAgent response
      vi.mocked(chatAgent).mockResolvedValue({
        response: 'How many days per week would you like to train?'
      });

      // Mock context and messages
      mockContextService.getContext.mockResolvedValue({});
      mockMessageRepo.findByConversationId.mockResolvedValue([]);

      const result = await chatService.handleIncomingMessage(
        mockUser, 
        testMessage
      );

      // Verify both agents were called
      expect(userProfileAgent).toHaveBeenCalled();
      expect(chatAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: mockUser.parsedProfile,
          wasProfileUpdated: false // No update occurred
        })
      );
    });

    it('should exclude current message from conversation history', async () => {
      const testMessage = 'What should I train today?';
      const conversationId = 'conv-456';
      
      // Mock conversation
      mockConversationRepo.findById.mockResolvedValue({
        id: conversationId,
        userId: mockUser.id
      });

      // Mock messages including the current one (which should be excluded)
      const allMessages: Message[] = [
        {
          id: 'msg-1',
          conversationId,
          userId: mockUser.id,
          direction: 'inbound',
          content: 'Previous message 1',
          phoneFrom: '+1234567890',
          phoneTo: '+0987654321',
          createdAt: new Date()
        },
        {
          id: 'msg-2',
          conversationId,
          userId: mockUser.id,
          direction: 'outbound',
          content: 'Previous response',
          phoneFrom: '+0987654321',
          phoneTo: '+1234567890',
          createdAt: new Date()
        },
        {
          id: 'msg-3',
          conversationId,
          userId: mockUser.id,
          direction: 'inbound',
          content: testMessage, // Current message (should be excluded)
          phoneFrom: '+1234567890',
          phoneTo: '+0987654321',
          createdAt: new Date()
        }
      ];
      
      mockMessageRepo.findByConversationId.mockResolvedValue(allMessages);

      // Mock agents
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: mockUser.parsedProfile,
        wasUpdated: false,
        updateSummary: null
      });
      
      vi.mocked(chatAgent).mockResolvedValue({
        response: 'Today is leg day!'
      });

      mockContextService.getContext.mockResolvedValue({});

      await chatService.handleIncomingMessage(
        mockUser, 
        testMessage,
        conversationId
      );

      // Verify ChatAgent received only previous messages (not the current one)
      expect(chatAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationHistory: allMessages.slice(0, -1) // Should exclude last message
        })
      );
    });

    it('should enforce SMS length constraints', async () => {
      const testMessage = 'Tell me everything about fitness';
      const longResponse = 'A'.repeat(2000); // Longer than SMS_MAX_LENGTH
      
      // Mock agents
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: mockUser.parsedProfile,
        wasUpdated: false,
        updateSummary: null
      });
      
      vi.mocked(chatAgent).mockResolvedValue({
        response: longResponse
      });

      mockContextService.getContext.mockResolvedValue({});
      mockMessageRepo.findByConversationId.mockResolvedValue([]);

      const result = await chatService.handleIncomingMessage(
        mockUser, 
        testMessage
      );

      expect(result.length).toBe(1600); // SMS_MAX_LENGTH
      expect(result.endsWith('...')).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const testMessage = 'Help me with my workout';
      
      // Mock UserProfileAgent to throw error
      vi.mocked(userProfileAgent).mockRejectedValue(new Error('Profile service error'));

      const result = await chatService.handleIncomingMessage(
        mockUser, 
        testMessage
      );

      expect(result).toContain("Sorry, I'm having trouble");
    });

    it('should set messageLimit to 0 in context to avoid duplication', async () => {
      const testMessage = 'What exercises should I do?';
      
      // Mock agents
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: mockUser.parsedProfile,
        wasUpdated: false,
        updateSummary: null
      });
      
      vi.mocked(chatAgent).mockResolvedValue({
        response: 'Try these exercises...'
      });

      mockMessageRepo.findByConversationId.mockResolvedValue([]);
      mockContextService.getContext.mockResolvedValue({});

      await chatService.handleIncomingMessage(
        mockUser, 
        testMessage
      );

      // Verify context was called with messageLimit: 0
      expect(mockContextService.getContext).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          includeUserProfile: true,
          includeWorkoutHistory: true,
          messageLimit: 0 // Should be 0 to avoid message duplication
        })
      );
    });
  });

  describe('handleSimpleMessage', () => {
    it('should process message without full context', async () => {
      const testMessage = 'Quick question about squats';
      
      // Mock agents
      vi.mocked(userProfileAgent).mockResolvedValue({
        profile: mockUser.parsedProfile,
        wasUpdated: false,
        updateSummary: null
      });
      
      vi.mocked(chatAgent).mockResolvedValue({
        response: 'For squats, focus on depth and form...'
      });

      const result = await chatService.handleSimpleMessage(
        mockUser,
        testMessage
      );

      expect(userProfileAgent).toHaveBeenCalled();
      expect(chatAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: mockUser.name,
          message: testMessage,
          profile: mockUser.parsedProfile,
          wasProfileUpdated: false,
          config: { temperature: 0.7 }
        })
      );
      
      expect(result).toContain('squats');
    });
  });

  describe('handleMessageWithoutProfileUpdate', () => {
    it('should skip profile updates and use contextual chat directly', async () => {
      const testMessage = 'What was my last workout?';
      
      // Mock contextual chat agent
      vi.mocked(contextualChatAgent).mockResolvedValue({
        response: 'Your last workout was legs on Monday'
      });

      // Mock context
      mockContextService.getContext.mockResolvedValue({
        lastWorkout: { date: 'Monday', type: 'legs' }
      });

      const result = await chatService.handleMessageWithoutProfileUpdate(
        mockUser,
        testMessage
      );

      // Verify UserProfileAgent was NOT called
      expect(userProfileAgent).not.toHaveBeenCalled();
      
      // Verify contextualChatAgent was called directly
      expect(contextualChatAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: mockUser.name,
          message: testMessage,
          profile: mockUser.parsedProfile,
          wasProfileUpdated: false
        })
      );
      
      expect(result).toContain('legs on Monday');
    });
  });
});