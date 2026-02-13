/**
 * Modification Orchestration Service
 *
 * Routes modification requests to the appropriate sub-service based on type:
 * - workout: WorkoutModificationService.modifyWorkout (change today's workout + sync microcycle)
 * - week: WorkoutModificationService.modifyWeek (restructure weekly schedule, invalidate affected workouts)
 * - plan: PlanModificationService.modifyPlan (program-level changes)
 *
 * The chat agent determines the modification type via the `type` parameter on the
 * make_modification tool, eliminating the need for a separate LLM router agent.
 */
import { now } from '@/shared/utils/date';
import type { ToolResult } from '../agents/types/shared';
import type { Message } from '@/server/models/message';
import type { UserServiceInstance } from '../domain/user/userService';
import type { WorkoutModificationServiceInstance } from '../agents/modifications/workoutModificationService';
import type { PlanModificationServiceInstance } from '../agents/modifications/planModificationService';

/**
 * ModificationServiceInstance interface
 */
export interface ModificationServiceInstance {
  makeModification(userId: string, message: string, type: 'workout' | 'week' | 'plan', previousMessages?: Message[]): Promise<ToolResult>;
}

export interface ModificationServiceDeps {
  user: UserServiceInstance;
  workoutModification: WorkoutModificationServiceInstance;
  planModification: PlanModificationServiceInstance;
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
  const { user: userService, workoutModification: workoutModificationService, planModification: planModificationService } = deps;

  return {
    /**
     * Route a modification request to the appropriate sub-service based on type.
     *
     * The chat agent determines the modification type and passes it directly,
     * eliminating the need for a separate LLM router agent.
     *
     * @param userId - The user's ID
     * @param message - The user's modification request message
     * @param type - The modification type determined by the chat agent
     * @param previousMessages - Optional conversation history for context
     * @returns ToolResult with response summary and optional messages
     */
    async makeModification(userId: string, message: string, type: 'workout' | 'week' | 'plan', previousMessages?: Message[]): Promise<ToolResult> {
      console.log('[MODIFICATION_SERVICE] Processing modification request:', {
        userId,
        type,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      });

      try {
        const user = await userService.getUser(userId);
        if (!user) {
          console.warn('[MODIFICATION_SERVICE] User not found:', userId);
          return { toolType: 'action', response: 'User not found.' };
        }

        const today = now(user.timezone).toJSDate();

        let result: { success: boolean; messages?: string[]; error?: string; modifications?: string };

        switch (type) {
          case 'workout':
            result = await workoutModificationService.modifyWorkout({
              userId,
              workoutDate: today,
              changeRequest: message,
            });
            break;
          case 'week':
            result = await workoutModificationService.modifyWeek({
              userId,
              changeRequest: message,
            });
            break;
          case 'plan':
            result = await planModificationService.modifyPlan({
              userId,
              changeRequest: message,
            });
            break;
        }

        if (!result.success) {
          return {
            toolType: 'action',
            response: result.error || 'Modification failed.',
          };
        }

        return {
          toolType: 'action',
          response: result.modifications || 'Modification applied successfully.',
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
