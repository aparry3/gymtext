import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { generateDailyWorkout, DailyWorkoutContext } from '@/server/agents/fitnessPlan/workouts/generate/chain';
import { updateExisitngWorkout, type Modification } from '@/server/agents/fitnessPlan/workouts/update/chain';
import type { EnhancedWorkoutInstance } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/userModel';
import { UserService } from './userService';

interface SubstituteExerciseParams {
  userId: string;
  workoutDate: Date;
  exercises: string[];
  reason: string;
}

interface SubstituteExerciseResult {
  success: boolean;
  replacementExercise?: string;
  message?: string;
  error?: string;
}

interface ModifyWorkoutParams {
  userId: string;
  workoutDate: Date;
  constraints: string[];
  preferredEquipment?: string[];
  focusAreas?: string[];
}

interface ModifyWorkoutResult {
  success: boolean;
  workout?: EnhancedWorkoutInstance;
  message?: string;
  error?: string;
}

export class WorkoutInstanceService {
  private static instance: WorkoutInstanceService;
  private workoutRepo: WorkoutInstanceRepository;
  private microcycleRepo: MicrocycleRepository;
  private fitnessPlanRepo: FitnessPlanRepository;
  private userService: UserService;

  private constructor() {
    this.workoutRepo = new WorkoutInstanceRepository(postgresDb);
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
    this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
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
   * Substitute a specific exercise in a workout using the workout update agent
   */
  public async substituteExercise(params: SubstituteExerciseParams): Promise<SubstituteExerciseResult> {
    try {
      const { userId, workoutDate, exercises, reason } = params;

      // Get the workout for the specified date
      const workout = await this.workoutRepo.findByClientIdAndDate(userId, workoutDate);

      if (!workout) {
        return {
          success: false,
          error: 'No workout found for the specified date',
        };
      }

      // Get user with profile
      const user = await this.userService.getUserWithProfile(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Build modification object for the agent
      const modifications: Modification[] = exercises.map(exercise => ({
        exercise,
        reason,
        constraints: [],
      }));

      // Use the workout update agent to perform the substitution
      const updatedWorkout = await updateExisitngWorkout({
        workout,
        user,
        modifications,
      });

      // Update the workout in the database
      await this.workoutRepo.update(workout.id, {
        details: updatedWorkout as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });



      return {
        success: true,
        message: `Updated workout for ${workoutDate.toLocaleDateString()}`,
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
      const { userId, workoutDate, constraints, preferredEquipment } = params;

      // Get user with profile
      const user = await this.userService.getUserWithProfile(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Get the existing workout
      const existingWorkout = await this.workoutRepo.findByClientIdAndDate(userId, workoutDate);

      if (!existingWorkout) {
        return {
          success: false,
          error: 'No workout found for the specified date',
        };
      }

      // Get microcycle and fitness plan info
      if (!existingWorkout.microcycleId) {
        return {
          success: false,
          error: 'Workout has no associated microcycle',
        };
      }

      const microcycle = await this.microcycleRepo.getMicrocycleById(existingWorkout.microcycleId);
      const fitnessPlan = await this.fitnessPlanRepo.getCurrentPlan(userId);

      if (!microcycle || !fitnessPlan) {
        return {
          success: false,
          error: 'Could not find training plan information',
        };
      }

      // Find the day in the microcycle pattern
      const dayOfWeek = workoutDate.toLocaleDateString('en-US', { weekday: 'long' });
      const dayPlan = microcycle.pattern.days.find(d => d.day === dayOfWeek);

      if (!dayPlan) {
        return {
          success: false,
          error: 'Could not find day plan in microcycle',
        };
      }

      // Get the mesocycle from fitness plan
      const mesocycle = fitnessPlan.mesocycles[microcycle.mesocycleIndex];

      if (!mesocycle) {
        return {
          success: false,
          error: 'Could not find mesocycle information',
        };
      }

      if (!fitnessPlan.id) {
        return {
          success: false,
          error: 'Fitness plan has no ID',
        };
      }

      // Temporarily update user profile with constraints
      const modifiedUser = this.applyConstraintsToUser(user, constraints, preferredEquipment);

      // Generate a new workout with the constraints
      const context: DailyWorkoutContext = {
        user: modifiedUser,
        date: workoutDate,
        dayPlan,
        microcycle,
        mesocycle,
        fitnessPlan,
        recentWorkouts: await this.workoutRepo.getRecentWorkouts(userId, 5),
      };

      const newWorkout = await generateDailyWorkout(context);

      // Update the workout in the database
      await this.workoutRepo.update(existingWorkout.id, {
        details: newWorkout as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });

      return {
        success: true,
        workout: newWorkout,
        message: `Generated modified workout for ${workoutDate.toLocaleDateString()}`,
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
   * Apply constraints to a user profile temporarily (doesn't save to DB)
   */
  private applyConstraintsToUser(
    user: UserWithProfile,
    constraints: string[],
    preferredEquipment?: string[]
  ): UserWithProfile {
    const modifiedUser = { ...user };

    if (!modifiedUser.profile) {
      return modifiedUser;
    }

    // Update equipment access if specified
    if (preferredEquipment && preferredEquipment.length > 0) {
      modifiedUser.profile.equipmentAccess = {
        gymAccess: modifiedUser.profile.equipmentAccess?.gymAccess ?? false,
        summary: preferredEquipment.join(', '),
        gymType: modifiedUser.profile.equipmentAccess?.gymType,
        homeEquipment: preferredEquipment,
        limitations: modifiedUser.profile.equipmentAccess?.limitations,
      };
    }

    // Add constraints to the profile
    const constraintObjects = constraints.map((constraint, index) => ({
      id: `temp-${index}`,
      description: constraint,
      type: 'preference' as const,
      status: 'active' as const,
    }));

    modifiedUser.profile.constraints = [
      ...(modifiedUser.profile.constraints || []),
      ...constraintObjects,
    ];

    return modifiedUser;
  }
}

// Export singleton instance
export const workoutInstanceService = WorkoutInstanceService.getInstance();