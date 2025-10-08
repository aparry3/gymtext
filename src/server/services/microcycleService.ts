import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { updateMicrocyclePattern, type MicrocycleUpdateParams } from '@/server/agents/fitnessPlan/microcyclePattern/update/chain';
import { generateDailyWorkout, DailyWorkoutContext } from '@/server/agents/fitnessPlan/workouts/generate/chain';
import { UserService } from './userService';

interface ModifyWeekParams {
  userId: string;
  targetDay: string; // The day being modified (e.g., "Monday", "Tuesday")
  changes: string[]; // What changes to make (e.g., ["Change chest to back workout", "Use dumbbells only", "Limit to 45 min"])
  reason: string; // Why the modification is needed
}

interface ModifyWeekResult {
  success: boolean;
  modifiedDays?: number;
  modificationsApplied?: string[];
  message?: string;
  error?: string;
}

export class MicrocycleService {
  private static instance: MicrocycleService;
  private microcycleRepo: MicrocycleRepository;
  private fitnessPlanRepo: FitnessPlanRepository;
  private workoutRepo: WorkoutInstanceRepository;
  private userService: UserService;

  private constructor() {
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
    this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
    this.workoutRepo = new WorkoutInstanceRepository(postgresDb);
    this.userService = UserService.getInstance();
  }

  public static getInstance(): MicrocycleService {
    if (!MicrocycleService.instance) {
      MicrocycleService.instance = new MicrocycleService();
    }
    return MicrocycleService.instance;
  }

  /**
   * Get all microcycles for a user
   */
  public async getAllMicrocycles(userId: string) {
    return await this.microcycleRepo.getAllMicrocycles(userId);
  }

  /**
   * Get microcycles by mesocycle index
   */
  public async getMicrocyclesByMesocycleIndex(userId: string, mesocycleIndex: number) {
    return await this.microcycleRepo.getMicrocyclesByMesocycleIndex(userId, mesocycleIndex);
  }

  /**
   * Get a specific microcycle by mesocycle index and week number
   */
  public async getMicrocycleByWeek(userId: string, mesocycleIndex: number, weekNumber: number) {
    // First get the fitness plan to get the fitnessPlanId
    const fitnessPlan = await this.fitnessPlanRepo.getCurrentPlan(userId);

    if (!fitnessPlan || !fitnessPlan.id) {
      return null;
    }

    return await this.microcycleRepo.getMicrocycleByWeek(
      userId,
      fitnessPlan.id,
      mesocycleIndex,
      weekNumber
    );
  }

  /**
   * Modify the weekly pattern for remaining days and regenerate a single workout
   */
  public async modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult> {
    try {
      const { userId, targetDay, changes, reason } = params;

      // Get user with profile
      const user = await this.userService.getUserWithProfile(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Get the current fitness plan
      const fitnessPlan = await this.fitnessPlanRepo.getCurrentPlan(userId);
      if (!fitnessPlan) {
        return {
          success: false,
          error: 'No active fitness plan found',
        };
      }

      // Get the current active microcycle (the one for this week)
      const relevantMicrocycle = await this.microcycleRepo.getCurrentMicrocycle(userId);

      if (!relevantMicrocycle) {
        console.error(`[MODIFY_WEEK] No active microcycle found for user ${userId}`);
        return {
          success: false,
          error: 'No active microcycle found. Please ensure you have an active fitness plan.',
        };
      }

      console.log(`[MODIFY_WEEK] Using active microcycle ${relevantMicrocycle.id} (${new Date(relevantMicrocycle.startDate).toLocaleDateString()} - ${new Date(relevantMicrocycle.endDate).toLocaleDateString()})`);

      // Get the mesocycle
      const mesocycle = fitnessPlan.mesocycles[relevantMicrocycle.mesocycleIndex];
      if (!mesocycle) {
        return {
          success: false,
          error: 'Could not find mesocycle information',
        };
      }

      // Calculate remaining days (today and future days only) in user's timezone
      const { DateTime } = await import('luxon');
      const todayInUserTz = DateTime.now().setZone(user.timezone);

      const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      // Luxon weekday is 1-7 (Mon-Sun), JS getDay() is 0-6 (Sun-Sat)
      // Convert Luxon weekday to JS day: Sunday = 7 -> 0, Monday = 1 -> 1, etc.
      const todayDayIndex = todayInUserTz.weekday === 7 ? 0 : todayInUserTz.weekday;
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

      // Capture the original pattern BEFORE updating
      const originalPattern = relevantMicrocycle.pattern;

      // Build microcycle update params for the agent
      const updateParams: MicrocycleUpdateParams = {
        targetDay,
        changes,
        reason,
        remainingDays,
      };

      // Use the microcycle update agent to modify the pattern
      const updatedPattern = await updateMicrocyclePattern({
        currentPattern: originalPattern,
        params: updateParams,
        mesocycle,
        programType: fitnessPlan.programType,
      });

      // Extract the modifications applied (remove before saving)
      const { modificationsApplied, ...patternToSave } = updatedPattern;

      // Update the microcycle with the new pattern
      await this.microcycleRepo.updateMicrocycle(relevantMicrocycle.id, {
        pattern: patternToSave,
      });

      // Check if today's pattern changed - if so, regenerate today's workout
      // This handles cases where modifying a future day causes today's workout to be reshuffled
      let workoutRegenerated = false;

      const todayOriginalPlan = originalPattern.days.find(d => d.day === todayDayOfWeek);
      const todayUpdatedPlan = patternToSave.days.find(d => d.day === todayDayOfWeek);

      // Check if today's plan actually changed (theme or load)
      const todayPlanChanged = todayOriginalPlan && todayUpdatedPlan && (
        todayOriginalPlan.theme !== todayUpdatedPlan.theme ||
        todayOriginalPlan.load !== todayUpdatedPlan.load
      );

      if (todayPlanChanged) {
        console.log(`[MODIFY_WEEK] Today's pattern changed from "${todayOriginalPlan?.theme}" to "${todayUpdatedPlan?.theme}" - regenerating workout`);

        // Use today's date in user's timezone (start of day)
        const todayDate = todayInUserTz.startOf('day').toJSDate();

        // Check if a workout exists for today
        const existingWorkout = await this.workoutRepo.findByClientIdAndDate(userId, todayDate);

        if (existingWorkout) {
          // Generate new workout for today
          const context: DailyWorkoutContext = {
            user,
            date: todayDate,
            dayPlan: todayUpdatedPlan!,
            microcycle: relevantMicrocycle,
            mesocycle,
            fitnessPlan,
            recentWorkouts: await this.workoutRepo.getRecentWorkouts(userId, 5),
          };

          const newWorkout = await generateDailyWorkout(context);

          // Update existing workout
          await this.workoutRepo.update(existingWorkout.id, {
            details: newWorkout as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          });

          workoutRegenerated = true;
          console.log(`[MODIFY_WEEK] Regenerated today's workout based on updated pattern`);
        } else {
          console.log(`[MODIFY_WEEK] No existing workout for today - will be generated during daily message with new pattern`);
        }
      } else {
        console.log(`[MODIFY_WEEK] Today's pattern unchanged - no need to regenerate workout`);
      }

      const message = workoutRegenerated
        ? `Updated weekly pattern for remaining days and regenerated today's workout (pattern changed). Applied ${modificationsApplied.length} pattern modifications.`
        : `Updated weekly pattern for remaining days. Applied ${modificationsApplied.length} pattern modifications.`;

      return {
        success: true,
        modifiedDays: workoutRegenerated ? 1 : 0,
        modificationsApplied,
        message,
      };
    } catch (error) {
      console.error('Error modifying week:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Find the date for a specific day of the week within a week starting from startDate
   */
  private findDateForDay(startDate: Date, dayOfWeek: string): Date {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);

    if (targetDayIndex === -1) {
      throw new Error(`Invalid day of week: ${dayOfWeek}`);
    }

    const startDayIndex = startDate.getDay();
    let daysToAdd = targetDayIndex - startDayIndex;

    // If the target day is before the start day, add 7 days to go to next week
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }

    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + daysToAdd);

    return targetDate;
  }
}

// Export singleton instance
export const microcycleService = MicrocycleService.getInstance();