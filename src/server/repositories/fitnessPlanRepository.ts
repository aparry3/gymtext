import { BaseRepository } from './baseRepository';
import { FitnessProgram, Macrocycle } from '@/shared/types/cycles';
import { FitnessPlanDB, NewFitnessPlan } from '@/shared/types/fitnessPlan';
import type { 
  FitnessPlanWithHierarchy, 
  MesocycleWithMicrocycles, 
  MicrocycleWithWorkouts,
  WorkoutInstanceWithDetails,
  WorkoutDetails 
} from '@/shared/types/admin';

export class FitnessPlanRepository extends BaseRepository {
  async createFromProgram(
    clientId: string,
    program: FitnessProgram,
    startDate: Date,
    goalStatement?: string
  ): Promise<FitnessPlanDB> {
    const newPlan: NewFitnessPlan = {
      clientId,
      programType: program.programType,
      goalStatement: goalStatement ?? null,
      overview: program.overview,
      startDate,
      macrocycles: program.macrocycles,
    };
    
    const result = await this.db
      .insertInto('fitnessPlans')
      .values({
        ...newPlan,
        macrocycles: JSON.stringify(newPlan.macrocycles), // Convert to JSONB
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return {
      ...result,
      macrocycles: program.macrocycles, // Return typed version
    };
  }

  async findByClientId(clientId: string): Promise<FitnessPlanDB[]> {
    const results = await this.db
      .selectFrom('fitnessPlans')
      .where('clientId', '=', clientId)
      .orderBy('startDate', 'desc')
      .selectAll()
      .execute();
    
    return results.map(r => ({
      ...r,
      macrocycles: r.macrocycles as Macrocycle[],
    }));
  }

  async findActiveByClientId(clientId: string): Promise<FitnessPlanDB | null> {
    // Find the most recent plan that has started but not ended
    const result = await this.db
      .selectFrom('fitnessPlans')
      .where('clientId', '=', clientId)
      .where('startDate', '<=', new Date())
      .orderBy('startDate', 'desc')
      .selectAll()
      .executeTakeFirst();
    
    if (!result) return null;
    
    return {
      ...result,
      macrocycles: result.macrocycles as Macrocycle[],
    };
  }

  async findById(id: string): Promise<FitnessPlanDB | null> {
    const result = await this.db
      .selectFrom('fitnessPlans')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
    
    if (!result) return null;
    
    return {
      ...result,
      macrocycles: result.macrocycles as Macrocycle[],
    };
  }

  async getFitnessPlanWithFullHierarchy(planId: string): Promise<FitnessPlanWithHierarchy | null> {
    // Get the fitness plan
    const plan = await this.db
      .selectFrom('fitnessPlans')
      .where('id', '=', planId)
      .selectAll()
      .executeTakeFirst();

    if (!plan) return null;

    // Get all mesocycles for this plan
    const mesocycles = await this.db
      .selectFrom('mesocycles')
      .where('fitnessPlanId', '=', planId)
      .orderBy('cycleOffset', 'asc')
      .selectAll()
      .execute();

    // Get all microcycles for these mesocycles
    const mesocycleIds = mesocycles.map(m => m.id);
    const microcycles = mesocycleIds.length > 0 
      ? await this.db
          .selectFrom('microcycles')
          .where('mesocycleId', 'in', mesocycleIds)
          .orderBy('weekNumber', 'asc')
          .selectAll()
          .execute()
      : [];

    // Get all workout instances for these microcycles
    const microcycleIds = microcycles.map(m => m.id);
    const workouts = microcycleIds.length > 0
      ? await this.db
          .selectFrom('workoutInstances')
          .where('microcycleId', 'in', microcycleIds)
          .orderBy('date', 'asc')
          .selectAll()
          .execute()
      : [];

    // Build the hierarchical structure
    const mesocyclesWithData: MesocycleWithMicrocycles[] = mesocycles.map(mesocycle => {
      const mesocycleMicrocycles = microcycles.filter(m => m.mesocycleId === mesocycle.id);
      
      const microcyclesWithWorkouts: MicrocycleWithWorkouts[] = mesocycleMicrocycles.map(microcycle => {
        const microcycleWorkouts = workouts.filter(w => w.microcycleId === microcycle.id);
        
        const workoutsWithDetails: WorkoutInstanceWithDetails[] = microcycleWorkouts.map(workout => ({
          ...workout,
          details: workout.details as unknown as WorkoutDetails
        }));

        return {
          ...microcycle,
          workouts: workoutsWithDetails
        };
      });

      return {
        ...mesocycle,
        microcycles: microcyclesWithWorkouts
      };
    });

    return {
      ...plan,
      macrocycles: plan.macrocycles as Macrocycle[],
      mesocycles: mesocyclesWithData
    };
  }

  async getFitnessPlansByUserId(userId: string): Promise<FitnessPlanWithHierarchy[]> {
    // First get all fitness plans for the user (clientId is the userId)
    const plans = await this.db
      .selectFrom('fitnessPlans')
      .where('clientId', '=', userId)
      .orderBy('startDate', 'desc')
      .selectAll()
      .execute();

    // Get full hierarchy for each plan
    const plansWithHierarchy = await Promise.all(
      plans.map(async (plan) => {
        const fullPlan = await this.getFitnessPlanWithFullHierarchy(plan.id);
        return fullPlan!; // We know it exists since we just fetched it
      })
    );

    return plansWithHierarchy;
  }
}