/**
 * Modification Orchestration Service
 *
 * Orchestrates modification requests by coordinating between:
 * - User service (fetching user context)
 * - Workout instance service (fetching current workout)
 * - AgentRunner (modifications:router agent with tools from DB config)
 *
 * This is an ORCHESTRATION service - it coordinates agent calls.
 * For specific modification operations, use WorkoutModificationService or PlanModificationService.
 *
 * Tools (modify_workout, modify_week, modify_plan) and their wiring to
 * sub-services are handled declaratively by the AgentRunner from DB config.
 */
import { now, getWeekday, DAY_NAMES } from '@/shared/utils/date';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';
import { buildModificationsUserMessage } from '../agents/prompts/modifications';
import type { ToolResult } from '../agents/types/shared';
import type { Message } from '@/server/models/message';
import type { UserServiceInstance } from '../domain/user/userService';
import type { WorkoutInstanceServiceInstance } from '../domain/training/workoutInstanceService';
import type { AgentRunnerInstance } from '@/server/agents/runner';

/**
 * ModificationServiceInstance interface
 */
export interface ModificationServiceInstance {
  makeModification(userId: string, message: string, previousMessages?: Message[]): Promise<ToolResult>;
}

export interface ModificationServiceDeps {
  user: UserServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  agentRunner: AgentRunnerInstance;
}

/**
 * Create a ModificationService instance with injected dependencies
 *
 * ModificationService - Orchestration service for modifications agent
 *
 * Handles workout, schedule, and plan modifications via the modifications agent.
 * Fetches its own context and delegates to specialized sub-services via AgentRunner tools.
 */
export function createModificationService(deps: ModificationServiceDeps): ModificationServiceInstance {
  const { user: userService, workoutInstance: workoutInstanceService, agentRunner } = deps;

  return {
    /**
     * Process a modification request from a user message
     *
     * Fetches context via entity services, invokes the modifications:router agent
     * via AgentRunner, and returns a standardized ToolResult.
     *
     * @param userId - The user's ID
     * @param message - The user's modification request message
     * @param previousMessages - Optional conversation history for context
     * @returns ToolResult with response summary and optional messages
     */
    async makeModification(userId: string, message: string, previousMessages?: Message[]): Promise<ToolResult> {
      console.log('[MODIFICATION_SERVICE] Processing modification request:', {
        userId,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      });

      try {
        // Fetch context via entity services
        const user = await userService.getUser(userId);
        if (!user) {
          console.warn('[MODIFICATION_SERVICE] User not found:', userId);
          return { toolType: 'action', response: 'User not found.' };
        }

        const today = now(user.timezone).toJSDate();
        const weekday = getWeekday(today, user.timezone);
        const targetDay = DAY_NAMES[weekday - 1];

        console.log('[MODIFICATION_SERVICE] Context fetched:', {
          targetDay,
          workoutDate: today.toISOString(),
          messageCount: previousMessages?.length ?? 0,
        });

        // Convert previous messages to agent format
        const previousMsgs = ConversationFlowBuilder.toMessageArray(previousMessages || [])
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

        // Build user message with context
        const userMessage = buildModificationsUserMessage({ user, message });

        // Invoke modifications:router via AgentRunner
        // Tools (modify_workout, modify_week, modify_plan) are resolved from DB config
        const result = await agentRunner.invoke('modifications:router', {
          input: userMessage,
          params: { user, workoutDate: today, targetDay },
          previousMessages: previousMsgs,
        });

        console.log('[MODIFICATION_SERVICE] Agent returned:', {
          messageCount: result.messages?.length ?? 0,
          response: typeof result.response === 'string'
            ? result.response.substring(0, 100) + (result.response.length > 100 ? '...' : '')
            : String(result.response).substring(0, 100),
        });

        return {
          toolType: 'action',
          response: result.response as string,
          messages: result.messages,
        };
      } catch (error) {
        console.error('[MODIFICATION_SERVICE] Error processing modification:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return {
          toolType: 'action',
          response: `Modification failed: ${errorMessage}`,
        };
      }
    },
  };
}
