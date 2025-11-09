import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { updateMicrocyclePattern, type MicrocycleUpdateParams } from '@/server/agents/fitnessPlan/microcyclePattern/update/chain';
import { createDailyWorkoutAgent } from '@/server/agents/fitnessPlan/workouts/generate/chain';
import { UserService } from '../user/userService';
import { FitnessPlanService } from './fitnessPlanService';
import { ProgressService } from './progressService';
import { WorkoutInstanceService } from './workoutInstanceService';
import { DailyWorkoutInput } from '@/server/agents/fitnessPlan/workouts/generate/types';
import { now, startOfWeek, endOfWeek, getWeekday } from '@/shared/utils/date';
import { UserWithProfile, FitnessPlan } from '@/server/models';
import { Microcycle } from '@/server/models/microcycle';

export interface ModifyWeekParams {
  userId: string;
  targetDay: string; // The day being modified (e.g., "Monday", "Tuesday")
  changes: string[]; // What changes to make (e.g., ["Change chest to back workout", "Use dumbbells only", "Limit to 45 min"])
  reason: string; // Why the modification is needed
}

export interface ModifyWeekResult {
  success: boolean;
  workout?: import('@/server/agents/fitnessPlan/workouts/generate/types').DailyWorkoutOutput['workout'];
  modifiedDays?: number;
  modificationsApplied?: string[];
  message?: string;
  error?: string;
}

export class MicrocycleService {
  private static instance: MicrocycleService;
  private microcycleRepo: MicrocycleRepository;
  private fitnessPlanService: FitnessPlanService;
  private progressService: ProgressService;
  private _workoutInstanceService?: WorkoutInstanceService;
  private userService: UserService;

  private constructor() {
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.progressService = ProgressService.getInstance();
    this.userService = UserService.getInstance();
  }

  private get workoutInstanceService(): WorkoutInstanceService {
    if (!this._workoutInstanceService) {
      this._workoutInstanceService = WorkoutInstanceService.getInstance();
    }
    return this._workoutInstanceService;
  }

  public static getInstance(): MicrocycleService {
    if (!MicrocycleService.instance) {
      MicrocycleService.instance = new MicrocycleService();
    }
    return MicrocycleService.instance;
  }

  /**
   * Get the active microcycle for a user (the one flagged as active in DB)
   */
  public async getActiveMicrocycle(userId: string) {
    return await this.microcycleRepo.getActiveMicrocycle(userId);
  }

  /**
   * Check if the active microcycle encompasses the current week in the user's timezone
   */
  public async isActiveMicrocycleCurrent(userId: string, timezone: string = 'America/New_York'): Promise<boolean> {
    const activeMicrocycle = await this.microcycleRepo.getActiveMicrocycle(userId);
    if (!activeMicrocycle) {
      return false;
    }

    const { startDate: currentWeekStart } = this.calculateWeekDates(timezone);
    const normalizedCurrentWeekStart = new Date(currentWeekStart);
    normalizedCurrentWeekStart.setHours(0, 0, 0, 0);

    const activeMicrocycleStart = new Date(activeMicrocycle.startDate);
    activeMicrocycleStart.setHours(0, 0, 0, 0);

    const activeMicrocycleEnd = new Date(activeMicrocycle.endDate);
    activeMicrocycleEnd.setHours(0, 0, 0, 0);

    // Check if current week falls within active microcycle's date range
    return normalizedCurrentWeekStart >= activeMicrocycleStart && normalizedCurrentWeekStart <= activeMicrocycleEnd;
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
    const fitnessPlan = await this.fitnessPlanService.getCurrentPlan(userId);

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
      const fitnessPlan = await this.fitnessPlanService.getCurrentPlan(userId);
      if (!fitnessPlan) {
        return {
          success: false,
          error: 'No active fitness plan found',
        };
      }

      // Get the current active microcycle (the one for this week)
      const relevantMicrocycle = await this.microcycleRepo.getActiveMicrocycle(userId);

      if (!relevantMicrocycle) {
        console.error(`[MODIFY_WEEK] No active microcycle found for user ${userId}`);
        return {
          success: false,
          error: 'No active microcycle found. Please ensure you have an active fitness plan.',
        };
      }

      console.log(`[MODIFY_WEEK] Using active microcycle ${relevantMicrocycle.id} (${new Date(relevantMicrocycle.startDate).toLocaleDateString()} - ${new Date(relevantMicrocycle.endDate).toLocaleDateString()})`);

      // Get the mesocycle (cast to Mesocycle as we no longer use MesocycleOverview)
      const mesocycle = fitnessPlan.mesocycles[relevantMicrocycle.mesocycleIndex] as import('@/server/models/fitnessPlan').Mesocycle;
      if (!mesocycle) {
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
      let regeneratedWorkout: import('@/server/agents/fitnessPlan/workouts/generate/types').DailyWorkoutOutput['workout'] | undefined;
      let workoutMessage: string | undefined;

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
        const todayDate = today;

        // Generate new workout for today with context
        const context: DailyWorkoutInput = {
          user,
          date: todayDate,
          dayPlan: todayUpdatedPlan!,
          microcycle: relevantMicrocycle,
          mesocycle,
          fitnessPlan,
          recentWorkouts: await this.workoutInstanceService.getRecentWorkouts(userId, 5),
        };

        const result = await createDailyWorkoutAgent().invoke(context);

        console.log('[MODIFY_WEEK] Generated workout:', JSON.stringify(result, null, 2));
        // Check if a workout exists for today to update it, otherwise create it
        const existingWorkout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, todayDate);

        if (existingWorkout) {
          // Update existing workout
          await this.workoutInstanceService.updateWorkout(existingWorkout.id, {
            details: result.workout as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            description: result.description,
            reasoning: result.reasoning,
            message: result.message,
            goal: `${todayUpdatedPlan!.theme}${todayUpdatedPlan!.notes ? ` - ${todayUpdatedPlan!.notes}` : ''}`,
            sessionType: this.mapThemeToSessionType(todayUpdatedPlan!.theme),
          });
          console.log(`[MODIFY_WEEK] Regenerated and updated today's workout based on updated pattern`);
        } else {
          // Create new workout
          await this.workoutInstanceService.createWorkout({
            clientId: userId,
            fitnessPlanId: fitnessPlan.id!,
            mesocycleId: null, // No longer using mesocycles table
            microcycleId: relevantMicrocycle.id,
            date: todayDate,
            sessionType: this.mapThemeToSessionType(todayUpdatedPlan!.theme),
            goal: `${todayUpdatedPlan!.theme}${todayUpdatedPlan!.notes ? ` - ${todayUpdatedPlan!.notes}` : ''}`,
            details: result.workout as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            description: result.description,
            reasoning: result.reasoning,
            message: result.message,
          });

          console.log(`[MODIFY_WEEK] Created new workout with message for updated pattern`);
        }

        regeneratedWorkout = result.workout;
        workoutMessage = result.message;
        workoutRegenerated = true;
      } else {
        console.log(`[MODIFY_WEEK] Today's pattern unchanged - no need to regenerate workout`);
      }

      // Use the agent's message if a workout was generated, otherwise provide a generic message
      console.log(`[MODIFY_WEEK] Workout message: ${workoutMessage}`);
      const message = workoutMessage || `Updated weekly pattern for remaining days. Applied ${modificationsApplied.length} pattern modifications.`;

      return {
        success: true,
        workout: regeneratedWorkout,
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
   * Get or create microcycle for a specific date (date-based approach)
   * This is the main entry point for ensuring a user has a microcycle for any given week
   */
  public async getOrCreateMicrocycleForDate(
    userId: string,
    plan: FitnessPlan,
    targetDate: Date,
    timezone: string = 'America/New_York'
  ): Promise<{ microcycle: Microcycle; wasCreated: boolean }> {
    // Calculate progress for the target date
    const progress = this.progressService.getProgressForDate(plan, targetDate, timezone);
    if (!progress) {
      throw new Error(`Could not calculate progress for date ${targetDate}`);
    }

    // Check if microcycle exists for this date
    let microcycle = await this.microcycleRepo.getMicrocycleByDate(
      userId,
      plan.id!,
      targetDate
    );

    if (microcycle) {
      return { microcycle, wasCreated: false };
    }

    // Generate new pattern and message for the week using AI agent
    const { pattern, message } = await this.generateMicrocyclePattern(
      progress.mesocycle,
      progress.microcycleWeek,
      plan.programType,
      plan.notes
    );

    // Create new microcycle with pre-generated message
    microcycle = await this.microcycleRepo.createMicrocycle({
      userId,
      fitnessPlanId: plan.id!,
      mesocycleIndex: progress.mesocycleIndex,
      weekNumber: progress.microcycleWeek,
      pattern,
      message,
      startDate: progress.weekStartDate,
      endDate: progress.weekEndDate,
      isActive: false, // No longer using isActive flag - we query by dates instead
    });

    console.log(`Created new microcycle for user ${userId}, week ${progress.microcycleWeek} (${progress.weekStartDate.toISOString()} - ${progress.weekEndDate.toISOString()})`);
    return { microcycle, wasCreated: true };
  }

  /**
   * Get or create the active microcycle for a user (current week)
   * This is a convenience wrapper around getOrCreateMicrocycleForDate
   */
  public async getOrCreateActiveMicrocycle(
    user: UserWithProfile,
    plan: FitnessPlan
  ): Promise<{ microcycle: Microcycle; wasCreated: boolean }> {
    const currentDate = now(user.timezone).toJSDate();
    return this.getOrCreateMicrocycleForDate(user.id, plan, currentDate, user.timezone);
  }

  /**
   * Generate a microcycle pattern and message using AI agent
   */
  private async generateMicrocyclePattern(
    mesocycle: import('@/server/models/fitnessPlan').Mesocycle,
    weekIndex: number, // 0-based index
    programType: string,
    notes?: string | null
  ): Promise<{ pattern: import('@/server/models/microcycle/schema').MicrocyclePattern; message: string }> {
    try {
      // Use AI agent to generate pattern and message (weekIndex is 0-based)
      const { createMicrocyclePatternAgent } = await import('@/server/agents/fitnessPlan/microcyclePattern/chain');
      const agent = createMicrocyclePatternAgent();
      const result = await agent.invoke({
        mesocycle,
        weekIndex,
        programType,
        notes
      });

      console.log(`Generated AI pattern and message for week index ${weekIndex} (week ${weekIndex + 1}) of ${mesocycle.name}`);
      return result;
    } catch (error) {
      console.error('Failed to generate pattern with AI agent, using fallback:', error);
      throw error;
    }
  }

  /**
   * Calculate week dates in a specific timezone
   */
  private calculateWeekDates(timezone: string = 'America/New_York'): { startDate: Date; endDate: Date } {
    const currentDate = now(timezone).toJSDate();

    return {
      startDate: startOfWeek(currentDate, timezone),
      endDate: endOfWeek(currentDate, timezone),
    };
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
export const microcycleService = MicrocycleService.getInstance();