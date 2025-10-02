import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { generateDailyWorkout, DailyWorkoutContext } from '@/server/agents/fitnessPlan/workouts/generate/chain';
import { generateMicrocyclePattern } from '@/server/agents/fitnessPlan/microcyclePattern/chain';
import type { EnhancedWorkoutInstance, WorkoutBlockItem } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/userModel';
import { UserService } from './userService';

interface SubstituteExerciseParams {
  userId: string;
  workoutDate: Date;
  exerciseToReplace: string;
  replacementExercise?: string;
  reason: string;
  blockName?: string;
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

interface ModifyWeekParams {
  userId: string;
  startDate: Date;
  modifications: Array<{
    day: string;
    change: string;
  }>;
  constraints: string[];
  reason: string;
}

interface ModifyWeekResult {
  success: boolean;
  modifiedDays?: number;
  message?: string;
  error?: string;
}

export class WorkoutModificationService {
  private static instance: WorkoutModificationService;
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

  public static getInstance(): WorkoutModificationService {
    if (!WorkoutModificationService.instance) {
      WorkoutModificationService.instance = new WorkoutModificationService();
    }
    return WorkoutModificationService.instance;
  }

  /**
   * Substitute a specific exercise in a workout
   */
  public async substituteExercise(params: SubstituteExerciseParams): Promise<SubstituteExerciseResult> {
    try {
      const { userId, workoutDate, exerciseToReplace, replacementExercise, reason, blockName } = params;

      // Get the workout for the specified date
      const workout = await this.workoutRepo.findByClientIdAndDate(userId, workoutDate);

      if (!workout) {
        return {
          success: false,
          error: 'No workout found for the specified date',
        };
      }

      // Parse the workout details
      const workoutDetails: EnhancedWorkoutInstance = typeof workout.details === 'string'
        ? JSON.parse(workout.details)
        : workout.details;

      if (!workoutDetails.blocks || workoutDetails.blocks.length === 0) {
        return {
          success: false,
          error: 'Workout has no blocks to modify',
        };
      }

      let exerciseFound = false;
      let actualReplacement = replacementExercise;

      // Find and replace the exercise
      for (const block of workoutDetails.blocks) {
        // If blockName is specified, only search in that block
        if (blockName && block.name !== blockName) {
          continue;
        }

        for (const item of block.items) {
          if (item.exercise.toLowerCase().includes(exerciseToReplace.toLowerCase())) {
            // If no replacement was specified, generate a similar one
            if (!actualReplacement) {
              actualReplacement = await this.suggestReplacement(item, reason);
            }

            item.exercise = actualReplacement;
            item.notes = `${item.notes || ''} (Substituted: ${reason})`.trim();
            exerciseFound = true;
          }
        }
      }

      if (!exerciseFound) {
        return {
          success: false,
          error: `Exercise "${exerciseToReplace}" not found in the workout${blockName ? ` block "${blockName}"` : ''}`,
        };
      }

      // Update the workout in the database
      await this.workoutRepo.update(workout.id, {
        details: workoutDetails as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });

      return {
        success: true,
        replacementExercise: actualReplacement,
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
   * Modify the weekly pattern and regenerate workouts
   */
  public async modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult> {
    try {
      const { userId, startDate, modifications, constraints, reason } = params;

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

      // Find the microcycle that contains this date
      const microcycles = await this.microcycleRepo.getAllMicrocycles(userId);
      const relevantMicrocycle = microcycles.find(m => {
        return m.startDate <= startDate && m.endDate >= startDate;
      });

      if (!relevantMicrocycle) {
        return {
          success: false,
          error: 'No microcycle found for the specified week',
        };
      }

      // Get the mesocycle
      const mesocycle = fitnessPlan.mesocycles[relevantMicrocycle.mesocycleIndex];
      if (!mesocycle) {
        return {
          success: false,
          error: 'Could not find mesocycle information',
        };
      }

      // Apply constraints to user temporarily
      const modifiedUser = this.applyConstraintsToUser(user, constraints, undefined);

      // Generate a new microcycle pattern with the modifications
      const modificationNotes = modifications.map(m => `${m.day}: ${m.change}`).join('; ');
      const allNotes = [modificationNotes, reason, ...constraints].filter(Boolean).join('; ');

      const newPattern = await generateMicrocyclePattern({
        mesocycle,
        weekNumber: relevantMicrocycle.weekNumber,
        programType: fitnessPlan.programType,
        notes: allNotes,
      });

      // Update the microcycle with the new pattern
      await this.microcycleRepo.updateMicrocycle(relevantMicrocycle.id, {
        pattern: newPattern,
      });

      // Regenerate workouts for the modified days
      let modifiedCount = 0;
      for (const mod of modifications) {
        const dayOfWeek = mod.day;
        const dayPlan = newPattern.days.find(d => d.day === dayOfWeek);

        if (!dayPlan) continue;

        // Find the date for this day
        const dayDate = this.findDateForDay(startDate, dayOfWeek);

        // Check if a workout exists for this date
        const existingWorkout = await this.workoutRepo.findByClientIdAndDate(userId, dayDate);

        // Generate new workout
        const context: DailyWorkoutContext = {
          user: modifiedUser,
          date: dayDate,
          dayPlan,
          microcycle: relevantMicrocycle,
          mesocycle,
          fitnessPlan,
          recentWorkouts: await this.workoutRepo.getRecentWorkouts(userId, 5),
        };

        const newWorkout = await generateDailyWorkout(context);

        if (existingWorkout) {
          // Update existing workout
          await this.workoutRepo.update(existingWorkout.id, {
            details: newWorkout as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          });
        } else {
          // Create new workout
          // Note: mesocycleId is set to empty string as MesocycleOverview doesn't have an id field
          await this.workoutRepo.create({
            clientId: userId,
            fitnessPlanId: fitnessPlan.id!,
            mesocycleId: '', // MesocycleOverview doesn't have an id, using empty string
            microcycleId: relevantMicrocycle.id,
            date: dayDate,
            sessionType: 'other',
            goal: dayPlan.theme,
            details: newWorkout as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          });
        }

        modifiedCount++;
      }

      return {
        success: true,
        modifiedDays: modifiedCount,
        message: `Updated ${modifiedCount} workouts for the week starting ${startDate.toLocaleDateString()}`,
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
   * Suggest a replacement exercise based on the original exercise and reason
   */
  private async suggestReplacement(item: WorkoutBlockItem, reason: string): Promise<string> {
    // Simple heuristic-based replacement suggestions
    // In a real implementation, this could use an LLM or a more sophisticated exercise database

    const exercise = item.exercise.toLowerCase();

    // Equipment-based substitutions
    if (reason.toLowerCase().includes('barbell')) {
      if (exercise.includes('bench press')) return 'Dumbbell Bench Press';
      if (exercise.includes('squat')) return 'Goblet Squat';
      if (exercise.includes('deadlift')) return 'Dumbbell Romanian Deadlift';
      if (exercise.includes('row')) return 'Dumbbell Row';
      if (exercise.includes('overhead press')) return 'Dumbbell Overhead Press';
    }

    if (reason.toLowerCase().includes('dumbbell')) {
      if (exercise.includes('bench')) return 'Push-ups';
      if (exercise.includes('squat')) return 'Bodyweight Squat';
      if (exercise.includes('row')) return 'Inverted Row';
    }

    // Bodyweight alternatives
    if (reason.toLowerCase().includes('no equipment') || reason.toLowerCase().includes('home')) {
      if (exercise.includes('bench press')) return 'Push-ups';
      if (exercise.includes('squat')) return 'Bodyweight Squat';
      if (exercise.includes('deadlift')) return 'Single Leg Deadlift';
      if (exercise.includes('row')) return 'Inverted Row';
      if (exercise.includes('overhead press')) return 'Pike Push-ups';
    }

    // Injury-based substitutions
    if (reason.toLowerCase().includes('shoulder')) {
      if (exercise.includes('overhead')) return 'Landmine Press';
      if (exercise.includes('bench press')) return 'Floor Press';
    }

    if (reason.toLowerCase().includes('knee')) {
      if (exercise.includes('squat')) return 'Box Squat';
      if (exercise.includes('lunge')) return 'Step-ups';
    }

    // Default: return a generic alternative based on exercise type
    if (item.type === 'compound') return 'Compound Movement (specify)';
    if (item.type === 'accessory') return 'Accessory Exercise (specify)';
    if (item.type === 'cardio') return 'Cardio Alternative';

    return `Alternative for ${item.exercise}`;
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
      type: 'preference' as const, // Use a valid constraint type
      status: 'active' as const, // Required field
    }));

    modifiedUser.profile.constraints = [
      ...(modifiedUser.profile.constraints || []),
      ...constraintObjects,
    ];

    return modifiedUser;
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
export const workoutModificationService = WorkoutModificationService.getInstance();
