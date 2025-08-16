import { UserWithProfile } from '@/server/models/userModel';
import { contextualChatChain } from '@/server/agents/chat/chain';

// Configuration from environment variables
const SMS_MAX_LENGTH = parseInt(process.env.SMS_MAX_LENGTH || '1600');

/**
 * ChatService handles incoming SMS messages and generates AI-powered responses.
 * 
 * This service acts as a thin orchestration layer that:
 * 1. Delegates AI response generation to the contextualChatChain agent
 * 2. Enforces SMS message length constraints
 * 3. Provides error handling with user-friendly fallback messages
 * 
 * The service follows a clean architecture pattern where all LLM interactions
 * are handled by specialized agents, keeping the service layer focused on
 * business logic and orchestration.
 */
export class ChatService {

  /**
   * Processes an incoming SMS message and generates an AI-powered response.
   * 
   * @param user - The user object with their profile information
   * @param message - The incoming SMS message text from the user
   * @returns A promise that resolves to the response message text
   * 
   * @remarks
   * - The method delegates to contextualChatChain agent which handles:
   *   - Fetching conversation context and history
   *   - Building appropriate prompts with user profile data
   *   - Generating contextually aware responses via LLM
   * - Response length is capped at SMS_MAX_LENGTH (default 1600 chars)
   * - Errors are logged and a friendly fallback message is returned
   * 
   * @example
   * ```typescript
   * const response = await chatService.handleIncomingMessage(
   *   user,
   *   "What workout should I do today?"
   * );
   * ```
   * 
   * @todo Future agent capabilities will include:
   * - Updating workouts based on user feedback
   * - Modifying user preferences
   * - Saving important conversation memories
   * - Tracking workout progress
   * - Managing notification preferences
   */
  async handleIncomingMessage(
    user: UserWithProfile,
    message: string
  ): Promise<string> {
    try {
      // Invoke the contextual chat agent with user context
      // The agent handles all LLM interactions and context management
      const result = await contextualChatChain.invoke({
        userId: user.id,
        message: message
      });
      
      // Extract and clean the response text
      const responseText = result.response.trim();
      
      // Enforce SMS length constraints
      // While modern phones support concatenated SMS and Twilio handles
      // message segmentation automatically, we truncate very long responses
      // to avoid excessive SMS charges
      if (responseText.length > SMS_MAX_LENGTH) {
        return responseText.substring(0, SMS_MAX_LENGTH - 3) + '...';
      }
      
      return responseText;
    } catch (error) {
      // Log the error for debugging while providing a user-friendly response
      console.error('Error generating chat response:', error);
      
      // Return a helpful fallback message that encourages relevant queries
      return "Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!";
    }
  }
}