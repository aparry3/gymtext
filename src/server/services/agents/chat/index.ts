import { UserWithProfile } from '@/server/models/user';
import { createAgent, type Message as AgentMessage } from '@/server/agents';
import { messageService } from '../../messaging/messageService';
import { workoutInstanceService } from '../../training/workoutInstanceService';
import { ProfileService } from '../profile';
import { ModificationService } from '../modifications';
import { userService } from '../../user/userService';
import { now } from '@/shared/utils/date';
import { createChatTools } from './tools';
import { CHAT_SYSTEM_PROMPT } from '../prompts/chat';
import { ContextService, ContextType } from '@/server/services/context';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';
import type { ToolResult } from '../types/shared';

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
 * - Agent decides when to call tools (update_profile, make_modification, get_workout)
 * - Tool priority ensures update_profile runs first when called with other tools
 * - Agent generates a final conversational response
 * - Tool messages are accumulated and sent after the agent's response
 *
 * The service ensures that:
 * - Agent autonomously decides when profile updates are needed
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

      // Create tools using the factory function
      // Tool priority: update_profile (1) > get_workout (2) > make_modification (3)
      const tools = createChatTools(
        {
          userId: userWithProfile.id,
          message,
          previousMessages: context,
          timezone: userWithProfile.timezone,
        },
        {
          makeModification: ModificationService.makeModification,
          getWorkout: getWorkoutForToday,
          updateProfile: ProfileService.updateProfile,
        },
        onSendMessage,
      );


      // Build context using ContextService
      const agentContext = await ContextService.getInstance().getContext(
        userWithProfile,
        [ContextType.DATE_CONTEXT, ContextType.CURRENT_WORKOUT]
      );

      // Convert previous messages to Message format for the configurable agent
      const previousMsgs: AgentMessage[] = ConversationFlowBuilder.toMessageArray(context || [])
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Create chat agent inline with configurable agent factory
      const agent = await createAgent({
        name: 'conversation',
        systemPrompt: CHAT_SYSTEM_PROMPT,
        context: agentContext,
        previousMessages: previousMsgs,
        tools,
      });

      // Invoke the chat agent - it will decide when to call tools (including update_profile)
      const result = await agent.invoke(message);

      console.log(`[ChatService] Agent completed with response length: ${result.response.length}, accumulated messages: ${result.messages?.length || 0}`);

      // Map to ChatOutput format
      // Order: [agent's final response, ...accumulated tool messages]
      const messages = [result.response, ...(result.messages || [])].filter(m => m && m.trim());

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
