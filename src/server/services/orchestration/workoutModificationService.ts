import { UserService } from '../user/userService';
import { MicrocycleService } from '../training/microcycleService';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { createModifyWorkoutAgent } from '@/server/agents/training/workouts/operations/modify';
import { now, getWeekday, DayOfWeek, DAY_NAMES } from '@/shared/utils/date';
import { DateTime } from 'luxon';
import { WorkoutChainResult } from '@/server/agents/training/workouts/shared';
import { createModifyMicrocycleAgent } from '@/server/agents/training/microcycles/operations/modify/chain';
import { ProgressService } from '../training/progressService';
import { FitnessPlanService } from '../training/fitnessPlanService';

/**
 * WorkoutModificationService
 *
 * Orchestration service for all workout-related modifications.
 *
 * Responsibilities:
 * - Coordinate weekly pattern modifications across microcycle and workout services
 * - Orchestrate single workout modifications (substitutions and replacements)
 * - Handle AI agent interactions for workout modifications
 * - Ensure proper sequencing and state updates across multiple entities
 *
 * This service follows the orchestration pattern (like OnboardingService, DailyMessageService)
 * and eliminates circular dependencies between MicrocycleService and WorkoutInstanceService.
 */

export interface ModifyWorkoutParams {
  userId: string;
  workoutDate: Date;
  reason: string;
}

export interface ModifyWorkoutResult {
  success: boolean;
  workout?: WorkoutChainResult;
  modificationsApplied?: string[];
  message?: string;
  error?: string;
}

export interface ModifyWeekParams {
  userId: string;
  targetDay: string; // The day being modified (e.g., "Monday", "Tuesday")
  changeRequest: string; // What changes to make (e.g., ["Change chest to back workout", "Use dumbbells only", "Limit to 45 min"])
  reason: string; // Why the modification is needed
}

export interface ModifyWeekResult {
  success: boolean;
  workout?: WorkoutChainResult;
  modifiedDays?: number;
  modificationsApplied?: string[];
  message?: string;
  error?: string;
}

export class WorkoutModificationService {
  private static instance: WorkoutModificationService;
  private userService: UserService;
  private microcycleService: MicrocycleService;
  private workoutInstanceService: WorkoutInstanceService;
  private progressService: ProgressService;
  private fitnessPlanService: FitnessPlanService;
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


  /**
   * Modify an entire workout based on constraints
   */
  public async modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult> {
    try {
      const { userId, workoutDate, reason } = params;

      console.log('Modifying workout', params);
      // Get user with profile first to determine timezone
      const user = await this.userService.getUserWithProfile(userId);
      if (!user) {
        return {
          success: false,
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
          error: 'No workout found for the specified date',
        };
      }


      // Use the workout modification agent to modify the workout
      const result = await createModifyWorkoutAgent().invoke({
        workout: existingWorkout,
        user,
        date: existingWorkout.date as Date,
        changeRequest: reason,
      });

      // Extract theme from markdown title (first # line) or use default
      const themeMatch = result.formatted.match(/^#\s+(.+)$/m);
      const theme = themeMatch ? themeMatch[1].trim() : 'Workout';

      // Extract modifications applied section from markdown if present
      const modificationsMatch = result.formatted.match(/##\s+Modifications Applied\s+([\s\S]+?)(?=\n##|\n---|\n$)/i);
      const modificationsApplied = modificationsMatch
        ? modificationsMatch[1].trim().split('\n').map(line => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
        : [];

      // Store formatted text in details.formatted
      const details = {
        formatted: result.formatted,  // Store the formatted markdown text
        theme,                       // Keep theme for quick access
      };

      // Update the workout in the database
      await this.workoutInstanceService.updateWorkout(existingWorkout.id, {
        description: result.description,
        message: result.message,
        details,
      });

      return {
        success: true,
        workout: result,
        modificationsApplied,
        message: result.message,
      };
    } catch (error) {
      console.error('Error modifying workout:', error);
      return {
        success: false,
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
      const user = await this.userService.getUserWithProfile(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const plan = await this.fitnessPlanService.getCurrentPlan(userId);
      if (!plan) {
        return {
          success: false,
          error: 'No fitness plan found',
        };
      }
      const progress = await this.progressService.getCurrentProgress(plan, user.timezone);
      if (!progress) {
        return {
          success: false,
          error: 'No progress found',
        };
      }

      const {microcycle, absoluteWeek} = progress;

      if (!microcycle) {
        return {
          success: false,
          error: 'No microcycle found',
        };
      }

      console.log(`[MODIFY_WEEK] Using active microcycle ${microcycle.id} (${new Date(microcycle.startDate).toLocaleDateString()} - ${new Date(microcycle.endDate).toLocaleDateString()})`);

      // Calculate remaining days (today and future days only) in user's timezone
      const today = now(user.timezone).toJSDate();

      // getWeekday returns 1-7 (Mon-Sun), convert to 0-6 (Sun-Sat) for array indexing
      const weekday = getWeekday(today, user.timezone);
      const todayDayOfWeek = DAY_NAMES[weekday - 1];


      // Use the microcycle modification agent to modify the pattern
      const modifyMicrocycleAgent = createModifyMicrocycleAgent();
      const modifyMicrocycleResult = await modifyMicrocycleAgent.invoke({
        currentMicrocycle: microcycle,
        user,
        changeRequest,
        currentDayOfWeek: todayDayOfWeek as DayOfWeek,
        weekNumber: absoluteWeek,
      });

      // Check if the microcycle was actually modified
      if (modifyMicrocycleResult.wasModified) {
        console.log(`[MODIFY_WEEK] Microcycle was modified - updating database`);

        // Update the microcycle with the new pattern (dayOverviews from the result)
        await this.microcycleService.updateMicrocycle(
          microcycle.id,
          {
            ...modifyMicrocycleResult.dayOverviews,
            description: modifyMicrocycleResult.description,
            isDeload: modifyMicrocycleResult.isDeload,
            formatted: modifyMicrocycleResult.formatted,
            message: modifyMicrocycleResult.message
          }
        );

        // Return success with the modified microcycle message
        return {
          success: true,
          message: modifyMicrocycleResult.message || 'Weekly pattern modified successfully',
        };
      } else {
        console.log(`[MODIFY_WEEK] No modifications needed - current plan already satisfies the request`);

        // Return success without database update
        return {
          success: true,
          message: 'Your current weekly plan already matches your request. No changes were needed.',
        };
      }

      // // Check if today's pattern changed - if so, regenerate today's workout
      // // This handles cases where modifying a future day causes today's workout to be reshuffled
      // let workoutRegenerated = false;
      // let regeneratedWorkout: Da | undefined;
      // let workoutMessage: string | undefined;

      // const todayOriginalPlan = originalPattern.days.find(d => d.day === todayDayOfWeek);
      // const todayUpdatedPlan = patternToSave.days.find(d => d.day === todayDayOfWeek);

      // // Check if today's plan actually changed (theme or load)
      // const todayPlanChanged = todayOriginalPlan && todayUpdatedPlan && (
      //   todayOriginalPlan.theme !== todayUpdatedPlan.theme ||
      //   todayOriginalPlan.load !== todayUpdatedPlan.load
      // );

      // if (todayPlanChanged) {
      //   console.log(`[MODIFY_WEEK] Today's pattern changed from "${todayOriginalPlan?.theme}" to "${todayUpdatedPlan?.theme}" - regenerating workout`);

      //   // Use today's date in user's timezone (start of day)
      //   const todayDate = today;

      //   // Generate new workout for today with context
      //   const context: DailyWorkoutInput = {
      //     user,
      //     date: todayDate,
      //     dayPlan: todayUpdatedPlan!,
      //     microcycle: relevantMicrocycle,
      //     mesocycle,
      //     fitnessPlan,
      //     recentWorkouts: await this.workoutInstanceService.getRecentWorkouts(userId, 5),
      //   };

      //   const result = await createDailyWorkoutAgent().invoke(context);

      //   // Extract formatted text and theme for storage
      //   const { formatted, theme } = result.workout;
      //   const details = {
      //     formatted,  // New: formatted markdown text
      //     theme,      // Keep theme for quick access
      //   };

      //   console.log('[MODIFY_WEEK] Generated workout with formatted text');
      //   // Check if a workout exists for today to update it, otherwise create it
      //   const existingWorkout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, todayDate);

      //   if (existingWorkout) {
      //     // Update existing workout
      //     await this.workoutInstanceService.updateWorkout(existingWorkout.id, {
      //       details: details as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      //       description: result.description,
      //       reasoning: result.reasoning,
      //       message: result.message,
      //       goal: `${todayUpdatedPlan!.theme}${todayUpdatedPlan!.notes ? ` - ${todayUpdatedPlan!.notes}` : ''}`,
      //       sessionType: this.mapThemeToSessionType(todayUpdatedPlan!.theme),
      //     });
      //     console.log(`[MODIFY_WEEK] Regenerated and updated today's workout based on updated pattern`);
      //   } else {
      //     // Create new workout
      //     await this.workoutInstanceService.createWorkout({
      //       clientId: userId,
      //       fitnessPlanId: fitnessPlan.id!,
      //       mesocycleId: null, // No longer using mesocycles table
      //       microcycleId: relevantMicrocycle.id,
      //       date: todayDate,
      //       sessionType: this.mapThemeToSessionType(todayUpdatedPlan!.theme),
      //       goal: `${todayUpdatedPlan!.theme}${todayUpdatedPlan!.notes ? ` - ${todayUpdatedPlan!.notes}` : ''}`,
      //       details: details as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      //       description: result.description,
      //       reasoning: result.reasoning,
      //       message: result.message,
      //     });

      //     console.log(`[MODIFY_WEEK] Created new workout with message for updated pattern`);
      //   }

      //   regeneratedWorkout = result.workout;
      //   workoutMessage = result.message;
      //   workoutRegenerated = true;
      // } else {
      //   console.log(`[MODIFY_WEEK] Today's pattern unchanged - no need to regenerate workout`);
      // }

      // // Use the agent's message if a workout was generated, otherwise provide a generic message
      // console.log(`[MODIFY_WEEK] Workout message: ${workoutMessage}`);
      // const message = workoutMessage || `Updated weekly pattern for remaining days. Applied ${modificationsApplied.length} pattern modifications.`;

      // return {
      //   success: true,
      //   workout: regeneratedWorkout,
      //   modifiedDays: workoutRegenerated ? 1 : 0,
      //   modificationsApplied,
      //   message,
      // };
    } catch (error) {
      console.error('Error modifying week:', error);
      return {
        success: false,
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
