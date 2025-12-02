import { UserWithProfile } from '@/server/models/userModel';
import { createChatAgent } from '@/server/agents/conversation/chat/chain';
import { MessageService } from './messageService';
import { FitnessProfileService } from '../user/fitnessProfileService';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { userService } from '@/server/services/user/userService';
import { now } from '@/shared/utils/date';

// Configuration from environment variables
const SMS_MAX_LENGTH = parseInt(process.env.SMS_MAX_LENGTH || '1600');
const CHAT_CONTEXT_MESSAGES = parseInt(process.env.CHAT_CONTEXT_MESSAGES || '10');

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
   * Processes pending inbound SMS messages using the two-agent architecture.
   *
   * @param user - The user object with their profile information
   * @returns A promise that resolves to an array of response messages (empty if no pending messages)
   *
   * @remarks
   * This method performs a single DB fetch and splits messages into:
   * - pending: inbound messages after the last outbound (to be processed)
   * - context: conversation history up to and including the last outbound
   *
   * This architecture ensures:
   * - No race conditions from multiple DB fetches
   * - Profile information is always current
   * - Proper acknowledgment of profile updates in responses
   * - Support for multiple messages (e.g., week update + workout message)
   *
   * @example
   * ```typescript
   * const messages = await chatService.handleIncomingMessage(user);
   * // Returns [] if no pending messages, otherwise generates responses
   * ```
   */
  async handleIncomingMessage(
    user: UserWithProfile
  ): Promise<string[]> {
    try {
      // Single DB fetch: get enough messages for pending + context window
      // We fetch extra to ensure we have enough context after splitting
      const allMessages = await this.messageService.getRecentMessages(
        user.id,
        CHAT_CONTEXT_MESSAGES + 20
      );

      // Split into pending (needs response) and context (conversation history)
      const { pending, context } = this.messageService.splitMessages(allMessages);

      // Early return if no pending messages
      if (pending.length === 0) {
        console.log('[ChatService] No pending messages, skipping');
        return [];
      }

      // Aggregate pending message content
      const message = pending.map(m => m.content).join('\n\n');

      console.log('[ChatService] Processing pending messages:', {
        pendingCount: pending.length,
        contextCount: context.length,
        aggregatedContent: message.substring(0, 100) + (message.length > 100 ? '...' : '')
      });

      // Trim context to configured window size
      const contextMessages = context.slice(-CHAT_CONTEXT_MESSAGES);

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