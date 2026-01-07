import {
  createWorkoutAgentService,
  createMicrocycleAgentService,
  type WorkoutAgentService,
  type MicrocycleAgentService,
} from '../training';
import type { ModifyWorkoutOutput, WorkoutGenerateOutput } from '@/server/services/agents/types/workouts';
import { now, getDayOfWeek, DAY_NAMES } from '@/shared/utils/date';
import { DateTime } from 'luxon';
import type { UserServiceInstance } from '../../user/userService';
import type { MicrocycleServiceInstance } from '../../training/microcycleService';
import type { WorkoutInstanceServiceInstance } from '../../training/workoutInstanceService';
import type { ProgressServiceInstance } from '../../training/progressService';
import type { FitnessPlanServiceInstance } from '../../training/fitnessPlanService';
import type { ContextService } from '../../context/contextService';

export interface ModifyWorkoutParams {
  userId: string;
  workoutDate: Date;
  changeRequest: string;
}

export interface ModifyWorkoutResult {
  success: boolean;
  workout?: ModifyWorkoutOutput;
  modifications?: string;
  messages: string[];
  error?: string;
}

export interface ModifyWeekParams {
  userId: string;
  targetDay: string; // The day being modified (e.g., "Monday", "Tuesday")
  changeRequest: string; // What changes to make (e.g., ["Change chest to back workout", "Use dumbbells only", "Limit to 45 min"])
}

export interface ModifyWeekResult {
  success: boolean;
  workout?: WorkoutGenerateOutput;
  modifiedDays?: number;
  modifications?: string;
  messages: string[];
  error?: string;
}

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * WorkoutModificationServiceInstance interface
 */
export interface WorkoutModificationServiceInstance {
  modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult>;
  modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult>;
}

export interface WorkoutModificationServiceDeps {
  user: UserServiceInstance;
  microcycle: MicrocycleServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  progress: ProgressServiceInstance;
  fitnessPlan: FitnessPlanServiceInstance;
  contextService: ContextService;
}

/**
 * Create a WorkoutModificationService instance with injected dependencies
 */
export function createWorkoutModificationService(
  deps: WorkoutModificationServiceDeps
): WorkoutModificationServiceInstance {
  const { user: userService, microcycle: microcycleService, workoutInstance: workoutInstanceService, progress: progressService, fitnessPlan: fitnessPlanService, contextService } = deps;

  let workoutAgent: WorkoutAgentService | null = null;
  let microcycleAgent: MicrocycleAgentService | null = null;

  const getWorkoutAgent = (): WorkoutAgentService => {
    if (!workoutAgent) workoutAgent = createWorkoutAgentService(contextService);
    return workoutAgent;
  };

  const getMicrocycleAgent = (): MicrocycleAgentService => {
    if (!microcycleAgent) microcycleAgent = createMicrocycleAgentService(contextService);
    return microcycleAgent;
  };

  const getWorkoutTypeFromTheme = (theme: string): string => {
    const themeLower = theme.toLowerCase();
    if (themeLower.includes('run') || themeLower.includes('cardio') || themeLower.includes('hiit') || themeLower.includes('metcon') || themeLower.includes('conditioning')) return 'cardio';
    if (themeLower.includes('lift') || themeLower.includes('strength') || themeLower.includes('upper') || themeLower.includes('lower') || themeLower.includes('push') || themeLower.includes('pull')) return 'strength';
    if (themeLower.includes('mobility') || themeLower.includes('flexibility') || themeLower.includes('stretch')) return 'mobility';
    if (themeLower.includes('rest') || themeLower.includes('recovery')) return 'recovery';
    if (themeLower.includes('assessment') || themeLower.includes('test')) return 'assessment';
    if (themeLower.includes('deload')) return 'deload';
    return 'strength';
  };

  return {
    async modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult> {
      try {
        const { userId, workoutDate, changeRequest } = params;
        console.log('Modifying workout', params);

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        const today = now(user.timezone);
        const workoutDateTime = DateTime.fromJSDate(workoutDate, { zone: user.timezone });
        const workout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, workoutDateTime.toJSDate());
        if (!workout) return { success: false, messages: [], error: 'No workout found for that date' };

        const modifiedWorkout = await getWorkoutAgent().modifyWorkout(user, workout, changeRequest);
        const updated = await workoutInstanceService.updateWorkout(workout.id, {
          description: modifiedWorkout.response,
          structured: modifiedWorkout.structure,
          message: modifiedWorkout.message,
        });
        if (!updated) return { success: false, messages: [], error: 'Failed to update workout' };

        const messages: string[] = [];
        if (workoutDateTime.hasSame(today, 'day')) messages.push(modifiedWorkout.message);

        return { success: true, workout: modifiedWorkout, modifications: modifiedWorkout.modifications, messages };
      } catch (error) {
        console.error('Error modifying workout:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },

    async modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult> {
      try {
        const { userId, targetDay, changeRequest } = params;
        console.log('[MODIFY_WEEK] Starting week modification', { userId, targetDay, changeRequest });

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        const today = now(user.timezone);
        const plan = await fitnessPlanService.getCurrentPlan(userId);
        if (!plan) return { success: false, messages: [], error: 'No fitness plan found. Please create a plan first.' };

        const { microcycle } = await progressService.getOrCreateMicrocycleForDate(userId, plan, today.toJSDate(), user.timezone);
        if (!microcycle) return { success: false, messages: [], error: 'Could not find or create microcycle for current week' };

        console.log('[MODIFY_WEEK] Modifying microcycle', { microcycleId: microcycle.id, absoluteWeek: microcycle.absoluteWeek });
        const modifiedMicrocycle = await getMicrocycleAgent().modifyMicrocycle(user, microcycle, changeRequest, targetDay);

        const updatedMicrocycle = await microcycleService.updateMicrocycle(microcycle.id, {
          days: modifiedMicrocycle.days,
          description: modifiedMicrocycle.overview,
          isDeload: modifiedMicrocycle.isDeload,
          structured: modifiedMicrocycle.structure,
        });
        if (!updatedMicrocycle) return { success: false, messages: [], error: 'Failed to update microcycle' };

        console.log('[MODIFY_WEEK] Generating new workout for target day');
        const targetDayIndex = DAY_NAMES.indexOf(targetDay);
        const dayOverview = modifiedMicrocycle.days[targetDayIndex] || 'Rest or active recovery';

        const targetDate = today.startOf('week').plus({ days: targetDayIndex });
        let workout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, targetDate.toJSDate());

        const activityType = modifiedMicrocycle.structure?.days?.[targetDayIndex]?.activityType as 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST' | undefined;

        if (!workout) {
          console.log('[MODIFY_WEEK] No existing workout found, generating new one');
          workout = await workoutInstanceService.generateWorkoutForDate(user, targetDate, dayOverview, modifiedMicrocycle.isDeload, activityType);
        } else {
          console.log('[MODIFY_WEEK] Regenerating existing workout');
          const workoutResult = await getWorkoutAgent().generateWorkout(user, dayOverview, modifiedMicrocycle.isDeload, activityType);
          await workoutInstanceService.updateWorkout(workout.id, {
            goal: dayOverview,
            description: workoutResult.response,
            structured: workoutResult.structure,
            message: workoutResult.message,
            workoutType: getWorkoutTypeFromTheme(dayOverview),
          });
        }

        const messages: string[] = [];
        const currentDayOfWeek = getDayOfWeek(today.toJSDate(), user.timezone);
        if (targetDay === currentDayOfWeek && workout?.message) messages.push(workout.message);

        console.log('[MODIFY_WEEK] Week modification complete');
        return { success: true, modifiedDays: 1, modifications: modifiedMicrocycle.modifications, messages };
      } catch (error) {
        console.error('[MODIFY_WEEK] Error modifying week:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },
  };
}

// =============================================================================
// DEPRECATED: Singleton pattern for backward compatibility
// Remove after all consumers migrate to factory pattern
// =============================================================================

import { UserService } from '../../user/userService';
import { MicrocycleService } from '../../training/microcycleService';
import { WorkoutInstanceService } from '../../training/workoutInstanceService';
import { ProgressService } from '../../training/progressService';
import { FitnessPlanService } from '../../training/fitnessPlanService';
import { createContextService } from '../../context';

/**
 * @deprecated Use createWorkoutModificationService(deps) instead
 */
export class WorkoutModificationService {
  private static instance: WorkoutModificationService;
  private userService: UserService;
  private microcycleService: MicrocycleService;
  private workoutInstanceService: WorkoutInstanceService;
  private progressService: ProgressService;
  private fitnessPlanService: FitnessPlanService;
  private _workoutAgent: WorkoutAgentService | null = null;
  private _microcycleAgent: MicrocycleAgentService | null = null;

  private constructor() {
    this.userService = UserService.getInstance();
    this.microcycleService = MicrocycleService.getInstance();
    this.workoutInstanceService = WorkoutInstanceService.getInstance();
    this.progressService = ProgressService.getInstance();
    this.fitnessPlanService = FitnessPlanService.getInstance();
  }

  public static getInstance(): WorkoutModificationService {
    if (!WorkoutModificationService.instance) {
      WorkoutModificationService.instance = new WorkoutModificationService();
    }
    return WorkoutModificationService.instance;
  }

  private getContextService() {
    // Use require to avoid circular dependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const services = require('@/server/services');
    return createContextService({
      fitnessPlanService: services.fitnessPlanService,
      workoutInstanceService: services.workoutInstanceService,
      microcycleService: services.microcycleService,
      fitnessProfileService: services.fitnessProfileService,
    });
  }

  private get workoutAgentService(): WorkoutAgentService {
    if (!this._workoutAgent) {
      this._workoutAgent = createWorkoutAgentService(this.getContextService());
    }
    return this._workoutAgent;
  }

  private get microcycleAgentService(): MicrocycleAgentService {
    if (!this._microcycleAgent) {
      this._microcycleAgent = createMicrocycleAgentService(this.getContextService());
    }
    return this._microcycleAgent;
  }


  /**
   * Modify an entire workout based on constraints
   */
  public async modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult> {
    try {
      const { userId, workoutDate, changeRequest } = params;

      console.log('Modifying workout', params);
      // Get user with profile first to determine timezone
      const user = await this.userService.getUser(userId);
      if (!user) {
        return {
          success: false,
          messages: [],
          error: 'User not found',
        };
      }

      // Convert the workout date to the user's timezone
      // If the date came as an ISO string like "2024-10-08", it was parsed as UTC midnight
      // We need to interpret it as a calendar date in the user's timezone instead
      const dateStr = workoutDate.toISOString().split('T')[0]; // Get YYYY-MM-DD
      const userLocalDate = DateTime.fromISO(dateStr, { zone: user.timezone }).startOf('day').toJSDate();

      // Get the existing workout
      const existingWorkout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, userLocalDate);

      if (!existingWorkout) {
        return {
          success: false,
          messages: [],
          error: 'No workout found for the specified date',
        };
      }


      // Use the workout agent service to modify the workout
      const result = await this.workoutAgentService.modifyWorkout(
        user,
        existingWorkout,
        changeRequest
      );

      // Extract theme from structured data or use default
      const theme = result.structure?.title || 'Workout';

      // Store theme in details
      const details = {
        theme,  // Keep theme for quick access
      };

      // Update the workout in the database
      await this.workoutInstanceService.updateWorkout(existingWorkout.id, {
        description: result.response.overview,
        message: result.message,
        structured: result.structure,
        details,
      });

      return {
        success: true,
        workout: result,
        modifications: result.response.modifications,
        messages: result.message ? [result.message] : [],
      };
    } catch (error) {
      console.error('Error modifying workout:', error);
      return {
        success: false,
        messages: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Modify the weekly pattern for remaining days and regenerate a single workout
   */
  public async modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult> {
    try {
      const { userId, changeRequest } = params;
      // const reason = params.reason; // Not currently used
      // targetDay is not currently used - we use the current day of week instead

      // Get user with profile
      const user = await this.userService.getUser(userId);
      if (!user) {
        return {
          success: false,
          messages: [],
          error: 'User not found',
        };
      }

      const plan = await this.fitnessPlanService.getCurrentPlan(userId);
      if (!plan) {
        return {
          success: false,
          messages: [],
          error: 'No fitness plan found',
        };
      }
      const progress = await this.progressService.getCurrentProgress(plan, user.timezone);
      if (!progress) {
        return {
          success: false,
          messages: [],
          error: 'No progress found',
        };
      }

      const { microcycle } = progress;

      if (!microcycle) {
        return {
          success: false,
          messages: [],
          error: 'No microcycle found',
        };
      }

      console.log(`[MODIFY_WEEK] Using active microcycle ${microcycle.id} (${new Date(microcycle.startDate).toLocaleDateString()} - ${new Date(microcycle.endDate).toLocaleDateString()})`);

      // Get current date in user's timezone (needed for workout operations below)
      const today = now(user.timezone).toJSDate();

      // Get today's day of week and index for microcycle days array (0-6, Mon-Sun)
      const todayDayOfWeek = getDayOfWeek(undefined, user.timezone);
      const todayDayIndex = DAY_NAMES.indexOf(todayDayOfWeek);
      const originalTodayOverview = microcycle.days[todayDayIndex] || null;

      // Use the microcycle agent service to modify the pattern
      const modifyMicrocycleResult = await this.microcycleAgentService.modifyMicrocycle(
        user,
        microcycle,
        changeRequest
      );

      console.log(`[MODIFY_WEEK] Microcycle modification result:`, modifyMicrocycleResult);
      // Check if the microcycle was actually modified
      if (modifyMicrocycleResult.wasModified) {
        console.log(`[MODIFY_WEEK] Microcycle was modified - updating database`);

        // Generate specialized "updated week" message using remaining days
        // const updatedMicrocycleMessageAgent = createUpdatedMicrocycleMessageAgent();
        // const microcycleUpdateMessage = await updatedMicrocycleMessageAgent.invoke({
        //   modifiedMicrocycle: {
        //     overview: modifyMicrocycleResult.description,
        //     isDeload: modifyMicrocycleResult.isDeload || false,
        //     days: modifyMicrocycleResult.days,
        //   },
        //   modifications: modifyMicrocycleResult.modifications || 'Updated weekly pattern based on your request',
        //   currentWeekday: todayDayOfWeek as DayOfWeek,
        //   user,
        // });

        // Update the microcycle with the new pattern (days array from the result)
        await this.microcycleService.updateMicrocycle(
          microcycle.id,
          {
            days: modifyMicrocycleResult.days,
            description: modifyMicrocycleResult.description,
            isDeload: modifyMicrocycleResult.isDeload,
            structured: modifyMicrocycleResult.structure,
            // message: microcycleUpdateMessage
          }
        );

        // Check if today's overview changed - if so, regenerate today's workout
        const newTodayOverview = modifyMicrocycleResult.days[todayDayIndex] || null;

        if (originalTodayOverview !== newTodayOverview) {
          // Get activity type from modified microcycle structure
          const structuredDay = modifyMicrocycleResult.structure?.days?.[todayDayIndex];
          const activityType = structuredDay?.activityType as 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST' | undefined;

          // Generate new workout for today using workout agent service
          const workoutResult = await this.workoutAgentService.generateWorkout(
            user,
            newTodayOverview || '',
            modifyMicrocycleResult.isDeload || false,
            activityType
          );

          // Extract theme from structured data or use default
          const theme = workoutResult.structure?.title || 'Workout';

          // Store theme in details
          const details = {
            theme,
          };

          // Check if a workout exists for today
          const existingWorkout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, today);

          if (existingWorkout) {
            // Update existing workout
            await this.workoutInstanceService.updateWorkout(existingWorkout.id, {
              details,
              description: workoutResult.response,
              message: workoutResult.message,
              structured: workoutResult.structure,
              goal: theme,
              sessionType: this.mapThemeToSessionType(theme),
            });
            console.log(`[MODIFY_WEEK] Updated today's workout`);
          } else {
            // Create new workout
            await this.workoutInstanceService.createWorkout({
              clientId: userId,
              microcycleId: microcycle.id,
              date: today,
              sessionType: this.mapThemeToSessionType(theme),
              goal: theme,
              details,
              description: workoutResult.response,
              message: workoutResult.message,
              structured: workoutResult.structure,
            });
            console.log(`[MODIFY_WEEK] Created new workout for today`);
          }

          // Return with both microcycle and workout messages
          const messages: string[] = [];
          if (workoutResult.message) {
            messages.push(workoutResult.message);
          }

          return {
            success: true,
            workout: workoutResult,
            messages,
            modifications: modifyMicrocycleResult.modifications,
          };
        }

        // Return success with the modified microcycle message and modifications
        return {
          success: true,
          messages: [],
          modifications: modifyMicrocycleResult.modifications,
        };
      } else {
        console.log(`[MODIFY_WEEK] No modifications needed - current plan already satisfies the request`);

        // Return success without database update
        // Empty messages - conversation agent will use modifications field to craft response
        return {
          success: true,
          messages: [],
          modifications: 'No changes needed - your current plan already matches your request',
        };
      }
    } catch (error) {
      console.error('Error modifying week:', error);
      return {
        success: false,
        messages: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Map workout theme to session type for database storage
   */
  private mapThemeToSessionType(theme: string): string {
    const themeLower = theme.toLowerCase();
    // Valid types: strength, cardio, mobility, recovery, assessment, deload
    if (themeLower.includes('run') || themeLower.includes('cardio') ||
        themeLower.includes('hiit') || themeLower.includes('metcon') ||
        themeLower.includes('conditioning')) return 'cardio';
    if (themeLower.includes('lift') || themeLower.includes('strength') ||
        themeLower.includes('upper') || themeLower.includes('lower') ||
        themeLower.includes('push') || themeLower.includes('pull')) return 'strength';
    if (themeLower.includes('mobility') || themeLower.includes('flexibility') ||
        themeLower.includes('stretch')) return 'mobility';
    if (themeLower.includes('rest') || themeLower.includes('recovery')) return 'recovery';
    if (themeLower.includes('assessment') || themeLower.includes('test')) return 'assessment';
    if (themeLower.includes('deload')) return 'deload';
    // Default to strength for hybrid/unknown workouts
    return 'strength';
  }
}

// Export singleton instance
export const workoutModificationService = WorkoutModificationService.getInstance();
