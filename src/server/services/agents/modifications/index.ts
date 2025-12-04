import { workoutModificationService } from './workoutModificationService';
import { planModificationService } from './planModificationService';
import { createModificationTools } from './tools';
import { createModificationsAgent } from '@/server/agents/modifications';
import { userService } from '../../user/userService';
import { workoutInstanceService } from '../../training/workoutInstanceService';
import { messageService } from '../../messaging/messageService';
import { now, getWeekday, DAY_NAMES } from '@/shared/utils/date';
import type { ToolResult } from '../shared/types';

/**
 * ModificationService - Orchestration service for modifications agent
 *
 * Handles workout, schedule, and plan modifications via the modifications agent.
 * Fetches its own context and delegates to specialized sub-services.
 *
 * This is an ORCHESTRATION service - it coordinates agent calls.
 * For specific modification operations, use WorkoutModificationService or PlanModificationService.
 */
export class ModificationService {
  /**
   * Process a modification request from a user message
   *
   * Fetches context via entity services, calls the modifications agent,
   * and returns a standardized ToolResult.
   *
   * @param userId - The user's ID
   * @param message - The user's modification request message
   * @returns ToolResult with response summary and optional messages
   */
  static async makeModification(userId: string, message: string): Promise<ToolResult> {
    console.log('[MODIFICATION_SERVICE] Processing modification request:', {
      userId,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
    });

    try {
      // Fetch context via entity services
      const user = await userService.getUser(userId);
      if (!user) {
        console.warn('[MODIFICATION_SERVICE] User not found:', userId);
        return { response: 'User not found.' };
      }

      const today = now(user.timezone).toJSDate();
      const weekday = getWeekday(today, user.timezone);
      const targetDay = DAY_NAMES[weekday - 1];
      const currentWorkout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, today);
      const previousMessages = await messageService.getRecentMessages(userId, 5);

      console.log('[MODIFICATION_SERVICE] Context fetched:', {
        targetDay,
        workoutDate: today.toISOString(),
        hasWorkout: !!currentWorkout,
        messageCount: previousMessages.length,
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

      // Create the modifications agent with tools
      const agent = createModificationsAgent({ tools });

      // Invoke the agent
      const result = await agent.invoke({
        user,
        message,
        previousMessages,
        currentWorkout,
        workoutDate: today,
        targetDay,
      });

      console.log('[MODIFICATION_SERVICE] Agent returned:', {
        messageCount: result.messages?.length ?? 0,
        response: result.response,
      });

      return {
        response: result.response,
        messages: result.messages,
      };
    } catch (error) {
      console.error('[MODIFICATION_SERVICE] Error processing modification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      return {
        response: `Modification failed: ${errorMessage}`,
      };
    }
  }
}

// Re-export sub-services and types for convenience
export { WorkoutModificationService, workoutModificationService } from './workoutModificationService';
export type { ModifyWorkoutResult, ModifyWeekResult, ModifyWorkoutParams, ModifyWeekParams } from './workoutModificationService';
export { PlanModificationService, planModificationService } from './planModificationService';
export type { ModifyPlanResult, ModifyPlanParams } from './planModificationService';
export { createModificationTools } from './tools';
export type { ModificationToolContext, ModificationToolDeps } from './tools';
