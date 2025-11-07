import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { substituteExercises, type Modification } from '@/server/agents/fitnessPlan/workouts/substitute/chain';
import { replaceWorkout, type ReplaceWorkoutParams } from '@/server/agents/fitnessPlan/workouts/replace/chain';
import { createDailyWorkoutAgent } from '@/server/agents/fitnessPlan/workouts/generate/chain';
import type { WorkoutInstanceUpdate, NewWorkoutInstance, WorkoutInstance } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/userModel';
import { UserService } from '../user/userService';
import { FitnessPlanService } from './fitnessPlanService';
import { ProgressService } from './progressService';
import { shortLinkService } from '../links/shortLinkService';
import { DateTime } from 'luxon';

export interface SubstituteExerciseParams {
  userId: string;
  workoutDate: Date;
  exercises: string[];
  reason: string;
}

export interface SubstituteExerciseResult {
  success: boolean;
  workout?: import('@/server/agents/fitnessPlan/workouts/generate/types').DailyWorkoutOutput['workout'];
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
  workout?: import('@/server/agents/fitnessPlan/workouts/generate/types').DailyWorkoutOutput['workout'];
  modificationsApplied?: string[];
  message?: string;
  error?: string;
}

export class WorkoutInstanceService {
  private static instance: WorkoutInstanceService;
  private workoutRepo: WorkoutInstanceRepository;
  private userService: UserService;
  private fitnessPlanService: FitnessPlanService;
  private progressService: ProgressService;

  private constructor() {
    this.workoutRepo = new WorkoutInstanceRepository(postgresDb);
    this.userService = UserService.getInstance();
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.progressService = ProgressService.getInstance();
  }

  public static getInstance(): WorkoutInstanceService {
    if (!WorkoutInstanceService.instance) {
      WorkoutInstanceService.instance = new WorkoutInstanceService();
    }
    return WorkoutInstanceService.instance;
  }

  /**
   * Get recent workouts for a user
   */
  public async getRecentWorkouts(userId: string, limit: number = 10) {
    return await this.workoutRepo.getRecentWorkouts(userId, limit);
  }

  /**
   * Get workouts by date range
   */
  public async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await this.workoutRepo.getWorkoutsByDateRange(userId, startDate, endDate);
  }

  /**
   * Get a specific workout by ID and verify it belongs to the user
   */
  public async getWorkoutById(workoutId: string, userId: string) {
    const workout = await this.workoutRepo.getWorkoutById(workoutId);

    if (!workout || workout.clientId !== userId) {
      return null;
    }

    return workout;
  }

  /**
   * Get a workout by user ID and date
   */
  public async getWorkoutByUserIdAndDate(userId: string, date: Date) {
    return await this.workoutRepo.findByClientIdAndDate(userId, date);
  }

  /**
   * Update the message for a workout
   */
  public async updateWorkoutMessage(workoutId: string, message: string) {
    return await this.workoutRepo.update(workoutId, { message });
  }

  /**
   * Create a new workout instance
   */
  public async createWorkout(workout: NewWorkoutInstance) {
    return await this.workoutRepo.create(workout);
  }

  /**
   * Update a workout with new details, description, reasoning, and message
   */
  public async updateWorkout(workoutId: string, updates: WorkoutInstanceUpdate) {
    return await this.workoutRepo.update(workoutId, updates);
  }

  /**
   * Generate a workout for a specific date using AI
   *
   * This is the core business logic for workout generation:
   * 1. Gets user's fitness plan and current progress
   * 2. Determines day pattern from microcycle
   * 3. Generates workout using AI agent
   * 4. Saves workout with pre-generated message
   * 5. Creates short link and appends to message
   *
   * @param user - User with profile
   * @param targetDate - Date to generate workout for
   * @returns Generated and saved workout instance
   */
  public async generateWorkoutForDate(
    user: UserWithProfile,
    targetDate: DateTime
  ): Promise<WorkoutInstance | null> {
    try {
      // Get fitness plan
      const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
      if (!plan) {
        console.log(`No fitness plan found for user ${user.id}`);
        return null;
      }

      // Ensure progress is up-to-date and get current microcycle
      const progress = await this.progressService.ensureUpToDateProgress(plan, user);
      if (!progress) {
        console.log(`No progress found for user ${user.id}`);
        return null;
      }

      // Extract what we need from progress
      const { microcycle, mesocycle } = progress;
      if (!microcycle) {
        console.log(`Could not get/create microcycle for user ${user.id}`);
        return null;
      }

      // Get the day's pattern from the microcycle
      const dayOfWeek = targetDate.toFormat('EEEE').toUpperCase(); // MONDAY, TUESDAY, etc.
      const dayPlan = microcycle.pattern.days.find(d => d.day === dayOfWeek);

      if (!dayPlan) {
        console.log(`No pattern found for ${dayOfWeek} in microcycle ${microcycle.id}`);
        return null;
      }

      // Get recent workouts for context (last 7 days)
      const recentWorkouts = await this.getRecentWorkouts(user.id, 7);

      // Use AI agent to generate workout with message
      const { workout: enhancedWorkout, message, description, reasoning } = await createDailyWorkoutAgent().invoke({
        user,
        date: targetDate.toJSDate(),
        dayPlan,
        microcycle,
        mesocycle,
        fitnessPlan: plan,
        recentWorkouts
      });

      // Convert enhanced workout to database format
      const workout: NewWorkoutInstance = {
        clientId: user.id,
        fitnessPlanId: microcycle.fitnessPlanId,
        mesocycleId: null,
        microcycleId: microcycle.id,
        date: targetDate.toJSDate(),
        sessionType: this.mapThemeToSessionType(dayPlan.theme),
        goal: `${dayPlan.theme}${dayPlan.notes ? ` - ${dayPlan.notes}` : ''}`,
        details: JSON.parse(JSON.stringify(enhancedWorkout)),
        description,
        reasoning,
        message,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save the workout to the database
      const savedWorkout = await this.createWorkout(workout);
      console.log(`Generated and saved workout for user ${user.id} on ${targetDate.toISODate()}`);

      // Generate short link for the workout
      try {
        const shortLink = await shortLinkService.createWorkoutLink(user.id, savedWorkout.id);
        const fullUrl = shortLinkService.getFullUrl(shortLink.code);
        console.log(`Created short link for workout ${savedWorkout.id}: ${fullUrl}`);

        // Append short link to message
        if (savedWorkout.message) {
          savedWorkout.message = `${savedWorkout.message}\n\nMore details: ${fullUrl}`;
          await this.updateWorkoutMessage(savedWorkout.id, savedWorkout.message);
        }
      } catch (error) {
        console.error(`Failed to create short link for workout ${savedWorkout.id}:`, error);
        // Continue without link - not critical
      }

      return savedWorkout;
    } catch (error) {
      console.error(`Error generating workout for user ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Maps theme to session type for database storage
   * Valid frontend types: run, lift, metcon, mobility, rest, other
   */
  private mapThemeToSessionType(theme: string): string {
    const themeLower = theme.toLowerCase();

    if (themeLower.includes('run') || themeLower.includes('running')) return 'run';
    if (themeLower.includes('metcon') || themeLower.includes('hiit') ||
        themeLower.includes('conditioning') || themeLower.includes('cardio')) return 'metcon';
    if (themeLower.includes('lift') || themeLower.includes('strength') ||
        themeLower.includes('upper') || themeLower.includes('lower') ||
        themeLower.includes('push') || themeLower.includes('pull')) return 'lift';
    if (themeLower.includes('mobility') || themeLower.includes('flexibility') ||
        themeLower.includes('stretch')) return 'mobility';
    if (themeLower.includes('rest') || themeLower.includes('recovery') ||
        themeLower.includes('deload')) return 'rest';

    return 'other';
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
      const workout = await this.workoutRepo.findByClientIdAndDate(userId, userLocalDate);

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

      // Extract the modifications applied (remove the date field before saving)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { modificationsApplied, date, ...workoutToSave } = result.workout;

      // Update the workout in the database
      await this.workoutRepo.update(workout.id, {
        details: workoutToSave as any, // eslint-disable-line @typescript-eslint/no-explicit-any
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
      const existingWorkout = await this.workoutRepo.findByClientIdAndDate(userId, userLocalDate);

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

      // Extract the modifications applied (remove the date field before saving)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { modificationsApplied, date, ...workoutToSave } = result.workout;

      // Update the workout in the database
      await this.workoutRepo.update(existingWorkout.id, {
        details: workoutToSave as any, // eslint-disable-line @typescript-eslint/no-explicit-any
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
   * Delete a workout instance
   */
  public async deleteWorkout(workoutId: string, userId: string): Promise<boolean> {
    // First verify the workout belongs to the user
    const workout = await this.workoutRepo.getWorkoutById(workoutId);

    if (!workout || workout.clientId !== userId) {
      return false;
    }

    // Delete the workout
    return await this.workoutRepo.delete(workoutId);
  }
}

// Export singleton instance
export const workoutInstanceService = WorkoutInstanceService.getInstance();