import { UserWithProfile } from '@/server/models/userModel';
import { chatAgent } from '@/server/agents/conversation/chat/chain';
import { ConversationService } from './conversationService';

// Configuration from environment variables
const SMS_MAX_LENGTH = parseInt(process.env.SMS_MAX_LENGTH || '1600');

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
  private static instance: ChatService;
  private conversationService: ConversationService;

  private constructor() {
    this.conversationService = ConversationService.getInstance();
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Processes an incoming SMS message using the two-agent architecture.
   *
   * @param user - The user object with their profile information
   * @param message - The incoming SMS message text from the user
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
    message: string
  ): Promise<string> {
    try {
      // Get recent conversation context for the user
      // This retrieves the last 10 messages from their active conversation
      const previousMessages = await this.conversationService.getRecentMessages(user.id, 10);

      // Remove the current message if it was already stored by the API route
      // (last message might be the one we're currently processing)
      const contextMessages = previousMessages.slice(0, -1);

      const chatResult = await chatAgent(
        user,
        message,
        contextMessages,
      );
      
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
}
// Export singleton instance
export const chatService = ChatService.getInstance();