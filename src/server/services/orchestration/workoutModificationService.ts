import { UserService } from '../user/userService';
import { FitnessPlanService } from '../training/fitnessPlanService';
import { MicrocycleService } from '../training/microcycleService';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { ProgressService } from '../training/progressService';
import { substituteExercises, type Modification } from '@/server/agents/training/workouts/operations/substitute';
import { replaceWorkout, type ReplaceWorkoutParams } from '@/server/agents/training/workouts/operations/replace';
// import { updateMicrocyclePattern, type MicrocycleUpdateParams } from '@/server/agents/training/microcycles/operations/update/chain';
// import { createDailyWorkoutAgent } from '@/server/agents/training/workouts/operations/generate';
// import { DailyWorkoutInput } from '@/server/agents/training/workouts/operations/generate';
import { now, getWeekday } from '@/shared/utils/date';
import { DateTime } from 'luxon';

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

export interface SubstituteExerciseParams {
  userId: string;
  workoutDate: Date;
  exercises: string[];
  reason: string;
}

export interface SubstituteExerciseResult {
  success: boolean;
  workout?: import('@/server/agents/training/workouts/operations/generate').DailyWorkoutOutput['workout'];
  modificationsApplied?: string[];
  message?: string;
  error?: string;
}

export interface ModifyWorkoutParams {
  userId: string;
  workoutDate: Date;
  reason: string;
  constraints: string[];
  preferredEquipment?: string[];
  focusAreas?: string[];
}

export interface ModifyWorkoutResult {
  success: boolean;
  workout?: import('@/server/agents/training/workouts/operations/generate').DailyWorkoutOutput['workout'];
  modificationsApplied?: string[];
  message?: string;
  error?: string;
}

export interface ModifyWeekParams {
  userId: string;
  targetDay: string; // The day being modified (e.g., "Monday", "Tuesday")
  changes: string[]; // What changes to make (e.g., ["Change chest to back workout", "Use dumbbells only", "Limit to 45 min"])
  reason: string; // Why the modification is needed
}

export interface ModifyWeekResult {
  success: boolean;
  workout?: import('@/server/agents/training/workouts/operations/generate').DailyWorkoutOutput['workout'];
  modifiedDays?: number;
  modificationsApplied?: string[];
  message?: string;
  error?: string;
}

export class WorkoutModificationService {
  private static instance: WorkoutModificationService;
  private userService: UserService;
  private fitnessPlanService: FitnessPlanService;
  private microcycleService: MicrocycleService;
  private workoutInstanceService: WorkoutInstanceService;
  private progressService: ProgressService;

  private constructor() {
    this.userService = UserService.getInstance();
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.microcycleService = MicrocycleService.getInstance();
    this.workoutInstanceService = WorkoutInstanceService.getInstance();
    this.progressService = ProgressService.getInstance();
  }

  public static getInstance(): WorkoutModificationService {
    if (!WorkoutModificationService.instance) {
      WorkoutModificationService.instance = new WorkoutModificationService();
    }
    return WorkoutModificationService.instance;
  }

  /**
   * Substitute a specific exercise in a workout using the workout update agent
   */
  public async substituteExercise(params: SubstituteExerciseParams): Promise<SubstituteExerciseResult> {
    try {
      const { userId, workoutDate, exercises, reason } = params;

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

      // Get the workout for the specified date
      const workout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, userLocalDate);

      if (!workout) {
        return {
          success: false,
          error: 'No workout found for the specified date',
        };
      }

      // Build modification object for the agent
      const modifications: Modification[] = exercises.map(exercise => ({
        exercise,
        reason,
        constraints: [],
      }));

      // Use the substitute exercises agent to perform the substitution
      const result = await substituteExercises({
        workout,
        user,
        modifications,
      });

      // Extract formatted text and theme for storage
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { modificationsApplied, date, formatted, theme } = result.workout;

      // Store formatted text in details.formatted for backward compatibility
      const details = {
        formatted,  // New: formatted markdown text
        theme,      // Keep theme for quick access
      };

      // Update the workout in the database
      await this.workoutInstanceService.updateWorkout(workout.id, {
        details: details as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        description: result.description,
        reasoning: result.reasoning,
        message: result.message,
      });

      return {
        success: true,
        workout: result.workout,
        modificationsApplied,
        message: result.message,
      };
    } catch (error) {
      console.error('Error substituting exercise:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Modify an entire workout based on constraints
   */
  public async modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult> {
    try {
      const { userId, workoutDate, reason, constraints, preferredEquipment, focusAreas } = params;

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

      // Build replace workout params for the agent
      const replaceParams: ReplaceWorkoutParams = {
        reason,
        constraints,
        preferredEquipment,
        focusAreas,
      };

      // Use the replace workout agent to modify the workout
      const result = await replaceWorkout({
        workout: existingWorkout,
        user,
        params: replaceParams,
      });

      // Extract formatted text and theme for storage
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { modificationsApplied, date, formatted, theme } = result.workout;

      // Store formatted text in details.formatted for backward compatibility
      const details = {
        formatted,  // New: formatted markdown text
        theme,      // Keep theme for quick access
      };

      // Update the workout in the database
      await this.workoutInstanceService.updateWorkout(existingWorkout.id, {
        details: details as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        description: result.description,
        reasoning: result.reasoning,
        message: result.message,
      });

      return {
        success: true,
        workout: result.workout,
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
      const { userId, targetDay, changes } = params;
      // const reason = params.reason; // Not currently used

      // Get user with profile
      const user = await this.userService.getUserWithProfile(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Get the current fitness plan
      const fitnessPlan = await this.fitnessPlanService.getCurrentPlan(userId);
      if (!fitnessPlan) {
        return {
          success: false,
          error: 'No active fitness plan found',
        };
      }

      // Get the current active microcycle (the one for this week)
      const relevantMicrocycle = await this.microcycleService.getActiveMicrocycle(userId);

      if (!relevantMicrocycle) {
        console.error(`[MODIFY_WEEK] No active microcycle found for user ${userId}`);
        return {
          success: false,
          error: 'No active microcycle found. Please ensure you have an active fitness plan.',
        };
      }

      console.log(`[MODIFY_WEEK] Using active microcycle ${relevantMicrocycle.id} (${new Date(relevantMicrocycle.startDate).toLocaleDateString()} - ${new Date(relevantMicrocycle.endDate).toLocaleDateString()})`);

      // Note: Mesocycles are now stored as simple strings in fitness_plans.mesocycles
      // Full mesocycle data is in the mesocycles table if needed
      // For now, we'll just use the mesocycle overview string from the fitness plan
      const mesocycleOverview = fitnessPlan.mesocycles[relevantMicrocycle.mesocycleIndex];
      if (!mesocycleOverview) {
        return {
          success: false,
          error: 'Could not find mesocycle information',
        };
      }

      // Calculate remaining days (today and future days only) in user's timezone
      const today = now(user.timezone).toJSDate();

      const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      // getWeekday returns 1-7 (Mon-Sun), convert to 0-6 (Sun-Sat) for array indexing
      const weekday = getWeekday(today, user.timezone);
      const todayDayIndex = weekday === 7 ? 0 : weekday;
      const todayDayOfWeek = daysOfWeek[todayDayIndex];

      // Find today's index
      const todayIndex = daysOfWeek.indexOf(todayDayOfWeek);

      // Get remaining days (today and after)
      const remainingDays = daysOfWeek.slice(todayIndex);

      console.log(`[MODIFY_WEEK] Today is ${todayDayOfWeek}, remaining days: ${remainingDays.join(', ')}`);

      // Check if the target day is in the remaining days
      const remainingDaysSet = new Set(remainingDays);
      const targetDayUpper = targetDay.toUpperCase();

      if (!remainingDaysSet.has(targetDayUpper)) {
        console.log(`[MODIFY_WEEK] Target day ${targetDay} has already passed`);
        return {
          success: false,
          error: `Cannot modify ${targetDay} - this day has already passed. Today is ${todayDayOfWeek}.`,
        };
      }

      console.log(`[MODIFY_WEEK] Target day: ${targetDay}, changes: ${changes.join('; ')}`);

      // TODO: Microcycle pattern modification needs to be refactored for new architecture
      // The new microcycle model doesn't store patterns, only day overviews
      // This service will need to be updated to work with the new structure
      return {
        success: false,
        error: 'Week modification not yet supported with new architecture - requires refactoring',
      };

      // // Capture the original pattern BEFORE updating
      // const originalPattern = relevantMicrocycle.pattern;

      // // Build microcycle update params for the agent
      // const updateParams: MicrocycleUpdateParams = {
      //   targetDay,
      //   changes,
      //   reason,
      //   remainingDays,
      // };

      // // Use the microcycle update agent to modify the pattern
      // const updatedPattern = await updateMicrocyclePattern({
      //   currentPattern: originalPattern,
      //   params: updateParams,
      //   mesocycle,
      //   programType: fitnessPlan.programType,
      // });

      // // Extract the modifications applied (remove before saving)
      // const { modificationsApplied, ...patternToSave } = updatedPattern;

      // // Update the microcycle with the new pattern
      // await this.microcycleService.updateMicrocyclePattern(relevantMicrocycle.id, patternToSave);

      // // Check if today's pattern changed - if so, regenerate today's workout
      // // This handles cases where modifying a future day causes today's workout to be reshuffled
      // let workoutRegenerated = false;
      // let regeneratedWorkout: import('@/server/agents/training/workouts/operations/generate').DailyWorkoutOutput['workout'] | undefined;
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
