/**
 * Chat Orchestration Service
 *
 * Orchestrates chat message handling by coordinating between:
 * - Message service (fetching/splitting messages)
 * - Chat agent service (AI response generation)
 * - Other services (workout, modification, profile)
 *
 * This service handles:
 * - Message fetching and splitting (pending vs context)
 * - Tool setup with callbacks
 * - SMS length constraint enforcement
 * - Error handling and fallback messages
 */
import type { UserWithProfile } from '@/server/models/user';
import { now } from '@/shared/utils/date';
import { getChatConfig } from '@/shared/config';
import { getEnvironmentSettings } from '@/server/config';
import { createChatTools } from '../agents/chat/tools';
import { ProfileService } from '../agents/profile';
import type { ToolResult } from '../agents/types/shared';
import type { MessageServiceInstance } from '../domain/messaging/messageService';
import type { UserServiceInstance } from '../domain/user/userService';
import type { WorkoutInstanceServiceInstance } from '../domain/training/workoutInstanceService';
import type { TrainingServiceInstance } from './trainingService';
import type { ModificationServiceInstance } from './modificationService';
import type { ChatAgentServiceInstance } from '../agents/chat/chatAgentService';

// Configuration from shared config
const { smsMaxLength: SMS_MAX_LENGTH, contextMinutes: CHAT_CONTEXT_MINUTES } = getChatConfig();

/**
 * ChatServiceInstance interface
 */
export interface ChatServiceInstance {
  handleIncomingMessage(user: UserWithProfile): Promise<string[]>;
}

export interface ChatServiceDeps {
  message: MessageServiceInstance;
  user: UserServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  training: TrainingServiceInstance;
  modification: ModificationServiceInstance;
  chatAgent: ChatAgentServiceInstance;
}

/**
 * Create a ChatService instance with injected dependencies
 *
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
export function createChatService(deps: ChatServiceDeps): ChatServiceInstance {
  const {
    message: messageService,
    user: userService,
    workoutInstance: workoutInstanceService,
    training: trainingService,
    modification: modificationService,
    chatAgent: chatAgentService,
  } = deps;

  /**
   * Get or generate today's workout for a user.
   * Returns a ToolResult with the workout message in the messages array.
   */
  const getWorkoutForToday = async (userId: string, timezone: string): Promise<ToolResult> => {
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
      const generatedWorkout = await trainingService.prepareWorkoutForDate(user, today);

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
  };

  return {
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
     */
    async handleIncomingMessage(user: UserWithProfile): Promise<string[]> {
      try {
        // Single DB fetch: get enough messages for pending + context window
        // We fetch extra to ensure we have enough context after splitting
        const allMessages = await messageService.getRecentMessages(user.id, 20);

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
            makeModification: modificationService.makeModification.bind(modificationService),
            getWorkout: getWorkoutForToday,
            updateProfile: ProfileService.updateProfile,
          },
          onSendMessage,
        );

        // Call the chat agent service to generate a response
        const result = await chatAgentService.generateResponse(
          userWithProfile,
          message,
          context,
          tools
        );

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
        if (getEnvironmentSettings().isDevelopment) {
          console.error('Error details:', {
            userId: user.id,
            error: error instanceof Error ? error.stack : error
          });
        }

        // Return a helpful fallback message
        return ["Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!"];
      }
    },
  };
}
