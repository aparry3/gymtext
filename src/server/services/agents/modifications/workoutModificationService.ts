import { UserService } from '../../user/userService';
import { MicrocycleService } from '../../training/microcycleService';
import { WorkoutInstanceService } from '../../training/workoutInstanceService';
import { createModifyWorkoutAgent, type ModifyWorkoutOutput } from '@/server/agents/training/workouts';
import { createWorkoutGenerateAgent, type WorkoutGenerateInput, type WorkoutGenerateOutput } from '@/server/agents/training/workouts';
import { now, DayOfWeek, getDayOfWeek, DAY_NAMES } from '@/shared/utils/date';
import { DateTime } from 'luxon';
import { createModifyMicrocycleAgent } from '@/server/agents/training/microcycles';
import { ProgressService } from '../../training/progressService';
import { FitnessPlanService } from '../../training/fitnessPlanService';

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


      // Use the workout modification agent to modify the workout
      const result = await createModifyWorkoutAgent().invoke({
        workout: existingWorkout,
        user,
        date: existingWorkout.date as Date,
        changeRequest,
      });

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

      const {microcycle, absoluteWeek} = progress;

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

      // Use the microcycle modification agent to modify the pattern
      const modifyMicrocycleAgent = createModifyMicrocycleAgent();
      const modifyMicrocycleResult = await modifyMicrocycleAgent.invoke({
        currentMicrocycle: microcycle,
        user,
        changeRequest,
        currentDayOfWeek: todayDayOfWeek as DayOfWeek,
        weekNumber: absoluteWeek,
      });

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

          // Generate new workout for today
          const workoutGenerateAgent = createWorkoutGenerateAgent();
          const workoutInput: WorkoutGenerateInput = {
            user,
            date: today,
            dayOverview: newTodayOverview || '',
            isDeload: modifyMicrocycleResult.isDeload || false,
          };

          const workoutResult = await workoutGenerateAgent.invoke(workoutInput);

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
