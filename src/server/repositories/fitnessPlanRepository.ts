import { BaseRepository } from '@/server/repositories/baseRepository';
import { 
  FitnessPlanModel,
  type FitnessPlan,
} from '@/server/models/fitnessPlan';
import type { 
  FitnessPlanWithHierarchy, 
  MesocycleWithMicrocycles, 
  MicrocycleWithWorkouts,
  WorkoutInstanceWithDetails,
  WorkoutDetails 
} from '@/shared/types/admin';

export class FitnessPlanRepository extends BaseRepository {
  async insertFitnessPlan(
    fitnessPlan: FitnessPlan
  ): Promise<FitnessPlan> {    
    const result = await this.db
      .insertInto('fitnessPlans')
      .values({
        ...fitnessPlan,
        macrocycles: JSON.stringify(fitnessPlan.macrocycles),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return FitnessPlanModel.fromDB(result);
  }

  async findByClientId(clientId: string): Promise<FitnessPlan[]> {
    const results = await this.db
      .selectFrom('fitnessPlans')
      .where('clientId', '=', clientId)
      .orderBy('startDate', 'desc')
      .selectAll()
      .execute();
    
    return results.map(FitnessPlanModel.fromDB) as FitnessPlan[];
  }

  async findActiveByClientId(clientId: string): Promise<FitnessPlan | null> {
    // Find the most recent plan that has started but not ended
    const result = await this.db
      .selectFrom('fitnessPlans')
      .where('clientId', '=', clientId)
      .where('startDate', '<=', new Date())
      .orderBy('startDate', 'desc')
      .selectAll()
      .executeTakeFirst();
    
    if (!result) return null;
    
    return FitnessPlanModel.fromDB(result);
  }

  async findById(id: string): Promise<FitnessPlan | undefined> {
    const result = await this.db
      .selectFrom('fitnessPlans')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
    
    if (!result) return undefined;
    
    return FitnessPlanModel.fromDB(result);
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
      .orderBy('index', 'asc')
      .selectAll()
      .execute();

    // Get all microcycles for these mesocycles
    const mesocycleIds = mesocycles.map(m => m.id);
    const microcycles = mesocycleIds.length > 0 
      ? await this.db
          .selectFrom('microcycles')
          .where('mesocycleId', 'in', mesocycleIds)
          .orderBy('index', 'asc')
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

  async update(id: string, updates: Partial<FitnessPlan>): Promise<FitnessPlan> {
    const result = await this.db
      .updateTable('fitnessPlans')
      .set({
        ...updates,
        macrocycles: JSON.stringify(updates.macrocycles),
        updatedAt: new Date()
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return FitnessPlanModel.fromDB(result);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .deleteFrom('fitnessPlans')
      .where('id', '=', id)
      .execute();
  }
}