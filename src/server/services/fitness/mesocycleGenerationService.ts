import { MesocycleRepository } from '@/server/data/repositories/mesocycleRepository';
import { MicrocycleRepository } from '@/server/data/repositories/microcycleRepository';
import { WorkoutInstanceRepository } from '@/server/data/repositories/workoutInstanceRepository';
import { breakdownMesocycle } from '@/server/agents/fitnessOutlineAgent';
import { 
  mesocycleDetailedToDb,
  microcycleToDb,
  workoutInstanceToDb,
  calculateMicrocycleDates,
  type NewMesocycle,
  type NewMicrocycle,
  type NewWorkoutInstance
} from '@/server/data/types/cycleTypes';
import type { MesocyclePlan, MesocycleDetailed } from '@/shared/types/cycles';
import type { UserWithProfile } from '@/shared/types/user';
import { postgresDb } from '@/server/core/database/postgres';
import type { Kysely } from 'kysely';
import type { DB } from '@/shared/types/generated';
import { v4 as uuidv4 } from 'uuid';

export class MesocycleGenerationService {
  constructor(
    private mesocycleRepo: MesocycleRepository,
    private microcycleRepo: MicrocycleRepository,
    private workoutInstanceRepo: WorkoutInstanceRepository,
    private db: Kysely<DB> = postgresDb
  ) {}

  /**
   * Generates a detailed mesocycle from a plan and stores it in the database
   */
  async generateAndStoreMesocycle(
    user: UserWithProfile,
    mesocyclePlan: MesocyclePlan,
    fitnessProgramId: string,
    macrocycleId: string,
    startDate: Date,
    programType: string,
    cycleOffset: number
  ): Promise<string> {
    try {
      // Step 1: Generate detailed mesocycle using AI
      const mesocycleDetailed = await breakdownMesocycle({
        userId: user.id,
        mesocyclePlan,
        programType,
        startDate
      });

      // Step 2: Store everything in a transaction
      const mesocycleId = await this.storeMesocycleData(
        mesocycleDetailed,
        fitnessProgramId,
        user.id,
        cycleOffset,
        startDate
      );

      return mesocycleId;
    } catch (error) {
      console.error(`Failed to generate and store mesocycle ${mesocyclePlan.id}:`, error);
      throw error;
    }
  }

  /**
   * Stores mesocycle data in the database within a transaction
   */
  private async storeMesocycleData(
    mesocycleDetailed: MesocycleDetailed,
    fitnessProgramId: string,
    clientId: string,
    cycleOffset: number,
    startDate: Date
  ): Promise<string> {
    return await this.db.transaction().execute(async (trx) => {
      // 1. Create mesocycle
      const mesocycleData = mesocycleDetailedToDb(
        mesocycleDetailed,
        fitnessProgramId,
        clientId,
        cycleOffset,
        startDate
      );

      const mesocycleResult = await trx
        .insertInto('mesocycles')
        .values(mesocycleData)
        .returning('id')
        .executeTakeFirstOrThrow();

      const mesocycleId = mesocycleResult.id;

      // 2. Create microcycles and workout instances
      const microcycleInserts: NewMicrocycle[] = [];
      const workoutInserts: NewWorkoutInstance[] = [];

      let currentMicrocycleOffset = cycleOffset;

      for (const microcycle of mesocycleDetailed.microcycles) {
        const { startDate: microcycleStart, endDate: microcycleEnd } = 
          calculateMicrocycleDates(startDate, microcycle.weekNumber);

        const microcycleData = microcycleToDb(
          microcycle,
          mesocycleId,
          fitnessProgramId,
          clientId,
          currentMicrocycleOffset,
          microcycleStart,
          microcycleEnd
        );

        // Generate a proper UUID for the microcycle
        const microcycleId = uuidv4();
        microcycleInserts.push({
          ...microcycleData,
          id: microcycleId
        });

        // Prepare workout instances
        for (const workout of microcycle.workouts) {
          const workoutData = workoutInstanceToDb(
            workout,
            microcycleId,
            mesocycleId,
            fitnessProgramId,
            clientId
          );
          workoutInserts.push(workoutData);
        }

        currentMicrocycleOffset++;
      }

      // 3. Batch insert microcycles
      if (microcycleInserts.length > 0) {
        await trx
          .insertInto('microcycles')
          .values(microcycleInserts)
          .execute();
      }

      // 4. Batch insert workout instances
      if (workoutInserts.length > 0) {
        await trx
          .insertInto('workoutInstances')
          .values(workoutInserts)
          .execute();
      }

      console.log(`Successfully stored mesocycle ${mesocycleId} with ${microcycleInserts.length} microcycles and ${workoutInserts.length} workouts`);

      return mesocycleId;
    });
  }

  /**
   * Generates all mesocycles for a fitness program
   */
  async generateAllMesocycles(
    user: UserWithProfile,
    fitnessProgramId: string,
    macrocycles: Array<{
      id: string;
      mesocycles: MesocyclePlan[];
      startDate?: string;
      lengthWeeks: number;
    }>,
    programStartDate: Date,
    programType: string
  ): Promise<string[]> {
    const mesocycleIds: string[] = [];
    let currentDate = new Date(programStartDate);
    let globalCycleOffset = 0;

    for (const macrocycle of macrocycles) {
      const macrocycleStartDate = macrocycle.startDate 
        ? new Date(macrocycle.startDate) 
        : currentDate;

      let macrocycleCurrentDate = new Date(macrocycleStartDate);

      for (const mesocyclePlan of macrocycle.mesocycles) {
        const mesocycleId = await this.generateAndStoreMesocycle(
          user,
          mesocyclePlan,
          fitnessProgramId,
          macrocycle.id,
          macrocycleCurrentDate,
          programType,
          globalCycleOffset
        );

        mesocycleIds.push(mesocycleId);

        // Advance dates
        macrocycleCurrentDate.setDate(
          macrocycleCurrentDate.getDate() + (mesocyclePlan.weeks * 7)
        );
        globalCycleOffset += mesocyclePlan.weeks;
      }

      // Update current date for next macrocycle
      currentDate = new Date(macrocycleCurrentDate);
    }

    return mesocycleIds;
  }

  /**
   * Retrieves a complete mesocycle with all its microcycles and workouts
   */
  async getCompleteMesocycle(mesocycleId: string): Promise<{
    mesocycle: any;
    microcycles: any[];
    workouts: any[];
  } | null> {
    const mesocycle = await this.mesocycleRepo.getMesocycleById(mesocycleId);
    if (!mesocycle) return null;

    const microcycles = await this.microcycleRepo.getMicrocyclesByMesocycleId(mesocycleId);
    
    const workouts: any[] = [];
    for (const microcycle of microcycles) {
      const microcycleWorkouts = await this.workoutInstanceRepo.getWorkoutsByMicrocycleId(microcycle.id);
      workouts.push(...microcycleWorkouts);
    }

    return {
      mesocycle,
      microcycles,
      workouts
    };
  }
}