import { UserWithProfile } from '@/server/models/userModel';
import { userProfileAgent } from '@/server/agents/profile/chain';
import { chatAgent } from '@/server/agents/conversation/chat/chain';
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
      // Step 1: Get conversation if provided
      // Note: Conversation and message storage is handled by the API route,
      // not here in the service layer
      const conversation = conversationId 
        ? await this.conversationRepo.findById(conversationId)
        : null;

      // Step 2: Run UserProfileAgent to extract and update profile
      let currentProfile = user.profile;
      let wasProfileUpdated = false;
      
      if (ENABLE_PROFILE_UPDATES) {
        console.log(`[ChatService] Running UserProfileAgent for user ${user.id}`);
        
        const profileResult = await userProfileAgent({
          userId: user.id,
          message,
          currentProfile: currentProfile || {},
          config: {
            model: 'gemini-2.5-flash',
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
      // Exclude the current message that was just stored by the API route
      const conversationHistory = conversation 
        ? await this.messageRepo.findByConversationId(conversation.id)
            .then(msgs => {
              // Remove the last message (current one) and get previous 10
              const previousMessages = msgs.slice(0, -1);
              return previousMessages.slice(-10);
            })
        : [];
      
      // Note: context.recentMessages will include the current message since it was already stored
      // This is okay since we're using conversationHistory for the actual chat history
      // The context is mainly for workout history and user profile data
      const context = await this.contextService.getContext(user.id, {
        includeUserProfile: true,
        includeWorkoutHistory: true,
        messageLimit: 0  // Don't include messages in context since we handle them separately
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
          model: 'gemini-2.5-flash',
          temperature: 0.7,
          verbose: process.env.NODE_ENV === 'development'
        }
      });
      
      // Step 5: Enforce SMS length constraints
      // Note: Message storage is handled by the API route
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
      let currentProfile = user.profile;
      let wasProfileUpdated = false;
      
      if (ENABLE_PROFILE_UPDATES) {
        const profileResult = await userProfileAgent({
          userId: user.id,
          message,
          currentProfile: currentProfile || {},
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

}