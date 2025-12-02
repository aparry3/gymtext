import { UserWithProfile } from '@/server/models/userModel';
import { createChatAgent } from '@/server/agents/conversation/chat/chain';
import { MessageService } from './messageService';
import { FitnessProfileService } from '../user/fitnessProfileService';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { userService } from '@/server/services/user/userService';
import { now } from '@/shared/utils/date';

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
  private messageService: MessageService;
  private fitnessProfileService: FitnessProfileService;
  private workoutInstanceService: WorkoutInstanceService;

  private constructor() {
    this.messageService = MessageService.getInstance();
    this.fitnessProfileService = FitnessProfileService.getInstance();
    this.workoutInstanceService = WorkoutInstanceService.getInstance();
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
   * @returns A promise that resolves to an array of response messages
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
   * - Support for multiple messages (e.g., week update + workout message)
   *
   * @example
   * ```typescript
   * const messages = await chatService.handleIncomingMessage(
   *   user,
   *   "I now train 5 days a week at Planet Fitness"
   * );
   * // Profile is updated AND response acknowledges the change
   * ```
   */
  async handleIncomingMessage(
    user: UserWithProfile,
    message: string
  ): Promise<string[]> {
    try {
      // Get recent conversation context for the user
      // This retrieves the last 20 messages to ensure we have enough context
      const previousMessages = await this.messageService.getRecentMessages(user.id, 20);

      // Filter messages for proper context in the debounced flow:
      // We need to remove ALL trailing inbound messages because they are already included
      // in the aggregated 'message' parameter passed to this function.
      // We keep everything up to the last OUTBOUND message.
      
      const contextMessages: typeof previousMessages = [];
      // Iterate backwards to find the split point
      let foundOutbound = false;
      for (let i = previousMessages.length - 1; i >= 0; i--) {
        const msg = previousMessages[i];
        if (msg.direction === 'outbound') {
          foundOutbound = true;
        }
        
        // Once we find an outbound message, we keep it and everything before it
        if (foundOutbound) {
          contextMessages.unshift(msg);
        }
        // If we haven't found an outbound message yet, it means we are seeing
        // trailing inbound messages which are already in our 'message' payload, so we skip them.
      }

      // Fetch current workout
      const currentWorkout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(user.id, now(user.timezone).toJSDate());

      // Fetch user with profile (if not already included)
      const userWithProfile = user.profile !== undefined
        ? user
        : await userService.getUser(user.id) || user;

      // Create chat agent with simplified dependencies
      // Note: Modification services are now handled by ModificationService singleton
      const agent = createChatAgent({
        saveProfile: this.fitnessProfileService.saveProfile.bind(this.fitnessProfileService),
      });

      // Invoke the agent with user that includes profile
      const chatResult = await agent.invoke({
        user: userWithProfile,
        message,
        previousMessages: contextMessages,
        currentWorkout: currentWorkout,
      });

      // Handle both single response and multiple messages
      let messages: string[];

      if (chatResult.messages && chatResult.messages.length > 0) {
        // Multiple messages from modifications agent
        messages = chatResult.messages;
      } else if (chatResult.response) {
        // Single response from updates agent or other subagents
        messages = [chatResult.response];
      } else {
        throw new Error('Chat agent returned invalid response');
      }

      // Enforce SMS length constraints on each message
      const validatedMessages = messages.map(msg => {
        const trimmed = msg.trim();
        if (trimmed.length > SMS_MAX_LENGTH) {
          return trimmed.substring(0, SMS_MAX_LENGTH - 3) + '...';
        }
        return trimmed;
      });

      return validatedMessages;

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
      return ["Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!"];
    }
  }
}
// Export singleton instance
export const chatService = ChatService.getInstance();