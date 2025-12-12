import { UserWithProfile } from '@/server/models/userModel';
import { createChatAgent } from '@/server/agents/conversation/chain';
import { messageService } from '../../messaging/messageService';
import { workoutInstanceService } from '../../training/workoutInstanceService';
import { ProfileService } from '../profile';
import { ModificationService } from '../modifications';
import { userService } from '../../user/userService';
import { now } from '@/shared/utils/date';
import { createChatTools } from './tools';
import type { ToolResult } from '../shared/types';

// Configuration from environment variables
const SMS_MAX_LENGTH = parseInt(process.env.SMS_MAX_LENGTH || '1600');
const CHAT_CONTEXT_MINUTES = parseInt(process.env.CHAT_CONTEXT_MINUTES || '10');

/**
 * Get or generate today's workout for a user.
 * Returns a ToolResult with the workout message in the messages array.
 */
async function getWorkoutForToday(userId: string, timezone: string): Promise<ToolResult> {
  try {
    const today = now(timezone);
    const todayDate = today.toJSDate();

    // Check if workout already exists
    const existingWorkout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, todayDate);

    if (existingWorkout) {
      // Workout exists - return its message
      console.log('[ChatService] Existing workout found for today');
      return {
        toolType: 'query',
        response: `User's workout for today: ${existingWorkout.sessionType || 'Workout'} - ${existingWorkout.description || 'Custom workout'}`,
        messages: existingWorkout.message ? [existingWorkout.message] : undefined,
      };
    }

    // No workout - need to generate one
    // Fetch user with profile for generation
    const user = await userService.getUser(userId);
    if (!user) {
      return { toolType: 'query', response: 'User not found.' };
    }

    // Generate the workout
    console.log('[ChatService] Generating workout for today');
    const generatedWorkout = await workoutInstanceService.generateWorkoutForDate(user, today);

    if (!generatedWorkout) {
      return {
        toolType: 'query',
        response: 'No workout scheduled for today. This could be a rest day based on the training plan, or the user may not have a fitness plan yet.',
      };
    }

    return {
      toolType: 'query',
      response: `User's workout for today: ${generatedWorkout.sessionType || 'Workout'} - ${generatedWorkout.description || 'Custom workout'}`,
      messages: generatedWorkout.message ? [generatedWorkout.message] : undefined,
    };
  } catch (error) {
    console.error('[ChatService] Error getting/generating workout:', error);
    return {
      toolType: 'query',
      response: `Failed to get workout: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * ChatService handles incoming SMS messages and generates AI-powered responses.
 *
 * This service orchestrates the chat agent which operates in an agentic loop:
 * - Agent decides when to call tools (update_profile, make_modification)
 * - Agent generates a final conversational response
 * - Tool messages are accumulated and sent after the agent's response
 *
 * The service ensures that:
 * - Profile updates happen when the agent decides to call update_profile
 * - Modifications happen when the agent decides to call make_modification
 * - Conversation history and context are properly maintained
 * - SMS length constraints are enforced
 */
export class ChatService {

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
   * const messages = await ChatService.handleIncomingMessage(user);
   * // Returns [] if no pending messages, otherwise generates responses
   * ```
   */
  static async handleIncomingMessage(
    user: UserWithProfile
  ): Promise<string[]> {
    try {
      // Single DB fetch: get enough messages for pending + context window
      // We fetch extra to ensure we have enough context after splitting
      const allMessages = await messageService.getRecentMessages(
        user.id,
        20
      );

      // Split into pending (needs response) and context (conversation history)
      const { pending, context } = messageService.splitMessages(allMessages, CHAT_CONTEXT_MINUTES);

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

      // Fetch current workout
      const currentWorkout = await workoutInstanceService.getWorkoutByUserIdAndDate(user.id, now(user.timezone).toJSDate());

      // Fetch user with profile (if not already included)
      const userWithProfile = user.profile !== undefined
        ? user
        : await userService.getUser(user.id) || user;

              // Callback for sending immediate messages
      const onSendMessage = async (immediateMessage: string) => {
        try {
          await messageService.sendMessage(userWithProfile, immediateMessage);
          console.log('[ChatService] Sent immediate message:', immediateMessage);
        } catch (error) {
          console.error('[ChatService] Failed to send immediate message:', error);
          // Don't throw - continue with tool execution
        }
      };

      // Create base tools using the factory function
      const tools = createChatTools(
        {
          userId: userWithProfile.id,
          message,
          previousMessages: context,
          timezone: userWithProfile.timezone,
        },
        {
          updateProfile: ProfileService.updateProfile,
          makeModification: ModificationService.makeModification,
          getWorkout: getWorkoutForToday,
        },
        onSendMessage,
      );


      // Create chat agent with wrapped tools
      const agent = createChatAgent({
        tools,
      });

      // Invoke the agent
      const chatResult = await agent.invoke({
        user: userWithProfile,
        message,
        previousMessages: context,
        currentWorkout: currentWorkout,
      });

      // ChatOutput always returns messages array
      // Order: [agent's final response, ...tool messages]
      const { messages } = chatResult;

      if (!messages || messages.length === 0) {
        throw new Error('Chat agent returned no messages');
      }

      // Enforce SMS length constraints on each message
      const validatedMessages = messages
        .filter((msg: string) => msg && msg.trim())
        .map((msg: string) => {
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

// Re-export tools for external use
export { createChatTools } from './tools';
export type { ChatToolContext, ChatToolDeps } from './tools';
