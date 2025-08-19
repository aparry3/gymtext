import { UserWithProfile } from '@/server/models/userModel';
import { userProfileAgent } from '@/server/agents/profile/chain';
import { chatAgent, contextualChatAgent } from '@/server/agents/chat/chain';
import { ConversationContextService } from '@/server/services/context/conversationContext';
import { MessageRepository } from '@/server/repositories/messageRepository';
import { ConversationRepository } from '@/server/repositories/conversationRepository';

// Configuration from environment variables
const SMS_MAX_LENGTH = parseInt(process.env.SMS_MAX_LENGTH || '1600');
const ENABLE_PROFILE_UPDATES = process.env.PROFILE_PATCH_ENABLED !== 'false';

/**
 * ChatService handles incoming SMS messages and generates AI-powered responses.
 * 
 * This service orchestrates the two-agent architecture:
 * 1. UserProfileAgent - Extracts and updates profile information
 * 2. ChatAgent - Generates conversational responses
 * 
 * The service ensures that:
 * - Profile updates happen automatically when users provide new information
 * - Chat responses acknowledge profile updates when they occur
 * - Conversation history and context are properly maintained
 * - SMS length constraints are enforced
 */
export class ChatService {
  private contextService: ConversationContextService;
  private messageRepo: MessageRepository;
  private conversationRepo: ConversationRepository;

  constructor() {
    this.contextService = new ConversationContextService();
    this.messageRepo = new MessageRepository();
    this.conversationRepo = new ConversationRepository();
  }

  /**
   * Processes an incoming SMS message using the two-agent architecture.
   * 
   * @param user - The user object with their profile information
   * @param message - The incoming SMS message text from the user
   * @param conversationId - Optional conversation ID for context continuity
   * @returns A promise that resolves to the response message text
   * 
   * @remarks
   * The method now follows a two-agent pattern:
   * 1. UserProfileAgent analyzes the message for profile updates
   * 2. ChatAgent generates a response using the (potentially updated) profile
   * 
   * This architecture ensures:
   * - Profile information is always current
   * - No duplicate LLM calls for the same information
   * - Proper acknowledgment of profile updates in responses
   * 
   * @example
   * ```typescript
   * const response = await chatService.handleIncomingMessage(
   *   user,
   *   "I now train 5 days a week at Planet Fitness"
   * );
   * // Profile is updated AND response acknowledges the change
   * ```
   */
  async handleIncomingMessage(
    user: UserWithProfile,
    message: string,
    conversationId?: string
  ): Promise<string> {
    try {
      // Step 1: Get or create conversation
      let conversation = conversationId 
        ? await this.conversationRepo.findById(conversationId)
        : null;
      
      if (!conversation) {
        conversation = await this.conversationRepo.create({
          userId: user.id,
          lastMessageAt: new Date(),
          startedAt: new Date()
        });
      }

      // Store the incoming message
      await this.messageRepo.create({
        conversationId: conversation.id,
        userId: user.id,
        direction: 'inbound',
        content: message,
        phoneFrom: user.phoneNumber || 'user_phone',
        phoneTo: process.env.TWILIO_NUMBER || 'system_phone'
      });

      // Step 2: Run UserProfileAgent to extract and update profile
      let currentProfile = user.parsedProfile;
      let wasProfileUpdated = false;
      
      if (ENABLE_PROFILE_UPDATES) {
        console.log(`[ChatService] Running UserProfileAgent for user ${user.id}`);
        
        const profileResult = await userProfileAgent({
          userId: user.id,
          message,
          currentProfile,
          config: {
            model: 'gpt-4-turbo',
            temperature: 0.2,
            verbose: process.env.NODE_ENV === 'development'
          }
        });
        
        // Update our local profile reference
        currentProfile = profileResult.profile;
        wasProfileUpdated = profileResult.wasUpdated;
        
        if (wasProfileUpdated && profileResult.updateSummary) {
          console.log(`[ChatService] Profile updated for user ${user.id}:`, {
            fieldsUpdated: profileResult.updateSummary.fieldsUpdated,
            reason: profileResult.updateSummary.reason,
            confidence: profileResult.updateSummary.confidence
          });
        }
      }

      // Step 3: Get conversation context and history
      const allMessages = await this.messageRepo.findByConversationId(conversation.id);
      const conversationHistory = allMessages.slice(-10); // Get last 10 messages
      
      const context = await this.contextService.getContext(user.id, {
        includeUserProfile: true,
        includeWorkoutHistory: true,
        messageLimit: 5
      });

      // Step 4: Run ChatAgent with the current profile and update status
      console.log(`[ChatService] Running ChatAgent for user ${user.id}`);
      
      const chatResult = await chatAgent({
        userName: user.name,
        message,
        profile: currentProfile,
        wasProfileUpdated,
        conversationHistory,
        context: context ? (context as unknown as Record<string, unknown>) : {},
        config: {
          model: 'gemini-2.0-flash',
          temperature: 0.7,
          verbose: process.env.NODE_ENV === 'development'
        }
      });
      
      // Step 5: Store the assistant's response
      await this.messageRepo.create({
        conversationId: conversation.id,
        userId: user.id,
        direction: 'outbound',
        content: chatResult.response,
        phoneFrom: process.env.TWILIO_NUMBER || 'system_phone',
        phoneTo: user.phoneNumber || 'user_phone'
      });

      // Update conversation metadata
      await this.conversationRepo.update(conversation.id, {
        lastMessageAt: new Date(),
        messageCount: (conversation.messageCount || 0) + 2 // User message + assistant response
      });
      
      // Step 6: Enforce SMS length constraints
      const responseText = chatResult.response.trim();
      
      if (responseText.length > SMS_MAX_LENGTH) {
        return responseText.substring(0, SMS_MAX_LENGTH - 3) + '...';
      }
      
      return responseText;
      
    } catch (error) {
      console.error('[ChatService] Error handling message:', error);
      
      // Log additional context in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', {
          userId: user.id,
          message: message.substring(0, 100),
          error: error instanceof Error ? error.stack : error
        });
      }
      
      // Return a helpful fallback message
      return "Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!";
    }
  }

  /**
   * Handles a simple message without conversation context.
   * Useful for quick responses or testing.
   */
  async handleSimpleMessage(
    user: UserWithProfile,
    message: string
  ): Promise<string> {
    try {
      // Run profile extraction if enabled
      let currentProfile = user.parsedProfile;
      let wasProfileUpdated = false;
      
      if (ENABLE_PROFILE_UPDATES) {
        const profileResult = await userProfileAgent({
          userId: user.id,
          message,
          currentProfile,
          config: { verbose: false }
        });
        
        currentProfile = profileResult.profile;
        wasProfileUpdated = profileResult.wasUpdated;
      }
      
      // Generate response without full context
      const chatResult = await chatAgent({
        userName: user.name,
        message,
        profile: currentProfile,
        wasProfileUpdated,
        config: { temperature: 0.7 }
      });
      
      // Enforce SMS length
      const responseText = chatResult.response.trim();
      if (responseText.length > SMS_MAX_LENGTH) {
        return responseText.substring(0, SMS_MAX_LENGTH - 3) + '...';
      }
      
      return responseText;
      
    } catch (error) {
      console.error('[ChatService] Error in simple message handler:', error);
      return "Sorry, I'm having trouble with that. Please try again!";
    }
  }

  /**
   * Processes a message with full context but without profile updates.
   * Useful when profile updates should be disabled temporarily.
   */
  async handleMessageWithoutProfileUpdate(
    user: UserWithProfile,
    message: string
  ): Promise<string> {
    try {
      // Get context
      const context = await this.contextService.getContext(user.id, {
        includeUserProfile: true,
        includeWorkoutHistory: true,
        messageLimit: 5
      });
      
      // Use contextual chat agent directly
      const result = await contextualChatAgent({
        userName: user.name,
        message,
        profile: user.parsedProfile,
        wasProfileUpdated: false,
        context: context ? (context as unknown as Record<string, unknown>) : {},
        config: { temperature: 0.7 }
      });
      
      // Enforce SMS length
      const responseText = result.response.trim();
      if (responseText.length > SMS_MAX_LENGTH) {
        return responseText.substring(0, SMS_MAX_LENGTH - 3) + '...';
      }
      
      return responseText;
      
    } catch (error) {
      console.error('[ChatService] Error without profile update:', error);
      return "Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!";
    }
  }
}