import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { substituteExercises, type Modification } from '@/server/agents/fitnessPlan/workouts/substitute/chain';
import { replaceWorkout, type ReplaceWorkoutParams } from '@/server/agents/fitnessPlan/workouts/replace/chain';
import type { EnhancedWorkoutInstance } from '@/server/models/workout';
import { UserService } from '../user/userService';
import { DateTime } from 'luxon';

export interface SubstituteExerciseParams {
  userId: string;
  workoutDate: Date;
  exercises: string[];
  reason: string;
}

export interface SubstituteExerciseResult {
  success: boolean;
  workout?: EnhancedWorkoutInstance;
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
  workout?: EnhancedWorkoutInstance;
  modificationsApplied?: string[];
  message?: string;
  error?: string;
}

export class WorkoutInstanceService {
  private static instance: WorkoutInstanceService;
  private workoutRepo: WorkoutInstanceRepository;
  private userService: UserService;

  private constructor() {
    this.workoutRepo = new WorkoutInstanceRepository(postgresDb);
    this.userService = UserService.getInstance();
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
  public async createWorkout(workout: import('@/server/models/workout').NewWorkoutInstance) {
    return await this.workoutRepo.create(workout);
  }

  /**
   * Update a workout with new details, description, reasoning, and message
   */
  public async updateWorkout(workoutId: string, updates: { details?: import('@/server/models/_types').JsonValue; description?: string; reasoning?: string; message?: string }) {
    return await this.workoutRepo.update(workoutId, updates);
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
}

// Export singleton instance
export const workoutInstanceService = WorkoutInstanceService.getInstance();