/**
 * Modification Orchestration Service
 *
 * Orchestrates modification requests by coordinating between:
 * - User service (fetching user context)
 * - Workout instance service (fetching current workout)
 * - Modification agent (determining what to modify)
 * - Sub-services (workoutModification, planModification)
 *
 * This is an ORCHESTRATION service - it coordinates agent calls.
 * For specific modification operations, use WorkoutModificationService or PlanModificationService.
 */
import { createModificationTools } from '../agents/modifications/tools';
import { createAgent, AGENTS, type Message as AgentMessage } from '@/server/agents';
import { now, getWeekday, DAY_NAMES } from '@/shared/utils/date';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';
import { buildModificationsUserMessage } from '../agents/prompts/modifications';
import type { ToolResult } from '../agents/types/shared';
import type { Message } from '@/server/models/message';
import type { UserServiceInstance } from '../domain/user/userService';
import type { WorkoutInstanceServiceInstance } from '../domain/training/workoutInstanceService';
import type { WorkoutModificationServiceInstance } from '../agents/modifications/workoutModificationService';
import type { PlanModificationServiceInstance } from '../agents/modifications/planModificationService';
import type { AgentDefinitionServiceInstance } from '../domain/agents/agentDefinitionService';

/**
 * ModificationServiceInstance interface
 */
export interface ModificationServiceInstance {
  makeModification(userId: string, message: string, previousMessages?: Message[]): Promise<ToolResult>;
}

export interface ModificationServiceDeps {
  user: UserServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  workoutModification: WorkoutModificationServiceInstance;
  planModification: PlanModificationServiceInstance;
  agentDefinition: AgentDefinitionServiceInstance;
}

/**
 * Create a ModificationService instance with injected dependencies
 *
 * ModificationService - Orchestration service for modifications agent
 *
 * Handles workout, schedule, and plan modifications via the modifications agent.
 * Fetches its own context and delegates to specialized sub-services.
 */
export function createModificationService(deps: ModificationServiceDeps): ModificationServiceInstance {
  const { user: userService, workoutInstance: workoutInstanceService, workoutModification: workoutModificationService, planModification: planModificationService, agentDefinition: agentDefinitionService } = deps;

  return {
    /**
     * Process a modification request from a user message
     *
     * Fetches context via entity services, calls the modifications agent,
     * and returns a standardized ToolResult.
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
        const currentWorkout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, today);

        console.log('[MODIFICATION_SERVICE] Context fetched:', {
          targetDay,
          workoutDate: today.toISOString(),
          hasWorkout: !!currentWorkout,
          messageCount: previousMessages?.length ?? 0,
        });

        // Create modification tools with context and service dependencies
        const tools = createModificationTools(
          {
            userId,
            message,
            workoutDate: today,
            targetDay,
          },
          {
            modifyWorkout: workoutModificationService.modifyWorkout.bind(workoutModificationService),
            modifyWeek: workoutModificationService.modifyWeek.bind(workoutModificationService),
            modifyPlan: planModificationService.modifyPlan.bind(planModificationService),
          }
        );

        // Convert previous messages to Message format for the configurable agent
        const previousMsgs: AgentMessage[] = ConversationFlowBuilder.toMessageArray(previousMessages || [])
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

        // Build user message
        const userMessage = buildModificationsUserMessage({ user, message });

        // Get resolved definition and create modifications agent
        const definition = await agentDefinitionService.getDefinition(AGENTS.MODIFICATIONS_ROUTER, {
          tools,
        });

        const agent = createAgent(definition);

        // Invoke the agent with runtime params - tool execution is handled by createAgent
        const result = await agent.invoke({
          message: userMessage,
          previousMessages: previousMsgs,
        });

        console.log('[MODIFICATION_SERVICE] Agent returned:', {
          messageCount: result.messages?.length ?? 0,
          response: result.response.substring(0, 100) + (result.response.length > 100 ? '...' : ''),
        });

        return {
          toolType: 'action',
          response: result.response,
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
