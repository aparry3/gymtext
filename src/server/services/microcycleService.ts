import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { generateMicrocyclePattern } from '@/server/agents/fitnessPlan/microcyclePattern/chain';
import { generateDailyWorkout, DailyWorkoutContext } from '@/server/agents/fitnessPlan/workouts/generate/chain';
import type { UserWithProfile } from '@/server/models/userModel';
import { UserService } from './userService';

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