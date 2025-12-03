import { WorkoutModificationService } from './workoutModificationService';
import { PlanModificationService } from './planModificationService';
import { createModificationsAgent } from '@/server/agents/modifications';
import { userService } from '../user/userService';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { MessageService } from '../messaging/messageService';
import { now, getWeekday, DAY_NAMES } from '@/shared/utils/date';
import type { ToolResult } from '@/server/agents/base';

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
  private static instance: ModificationService;

  private workoutModificationService: WorkoutModificationService;
  private planModificationService: PlanModificationService;
  private workoutInstanceService: WorkoutInstanceService;
  private messageService: MessageService;

  private constructor() {
    this.workoutModificationService = WorkoutModificationService.getInstance();
    this.planModificationService = PlanModificationService.getInstance();
    this.workoutInstanceService = WorkoutInstanceService.getInstance();
    this.messageService = MessageService.getInstance();
  }

  public static getInstance(): ModificationService {
    if (!ModificationService.instance) {
      ModificationService.instance = new ModificationService();
    }
    return ModificationService.instance;
  }

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
  public async makeModification(userId: string, message: string): Promise<ToolResult> {
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
      const currentWorkout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, today);
      const previousMessages = await this.messageService.getRecentMessages(userId, 5);

      console.log('[MODIFICATION_SERVICE] Context fetched:', {
        targetDay,
        workoutDate: today.toISOString(),
        hasWorkout: !!currentWorkout,
        messageCount: previousMessages.length,
      });

      // Create the modifications agent with service dependencies
      // TODO: In a future refactor, create tools here instead of passing bound methods
      const agent = createModificationsAgent({
        modifyWorkout: this.workoutModificationService.modifyWorkout.bind(this.workoutModificationService),
        modifyWeek: this.workoutModificationService.modifyWeek.bind(this.workoutModificationService),
        modifyPlan: this.planModificationService.modifyPlan.bind(this.planModificationService),
      });

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

// Export singleton instance
export const modificationService = ModificationService.getInstance();
