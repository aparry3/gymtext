import { FitnessPlanService } from '@/server/services/fitness/fitnessPlanService';
import { BaseRepository } from './baseRepository';
import { FitnessProgram, Macrocycle } from '@/shared/types/cycles';
import { FitnessPlanDB } from '@/shared/types/fitnessPlan';

export class FitnessPlanRepository extends BaseRepository {
  async createFromProgram(
    clientId: string,
    program: FitnessProgram,
    startDate: Date,
    goalStatement?: string
  ): Promise<FitnessPlanDB> {
    const newPlan = FitnessPlanService.transformProgramForDb(clientId, program, startDate, goalStatement);
    
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
}