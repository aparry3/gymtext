import { BaseRepository } from '@/server/repositories/baseRepository';
import { 
  FitnessPlanModel,
  type FitnessPlan,
} from '@/server/models/fitnessPlan';


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
}