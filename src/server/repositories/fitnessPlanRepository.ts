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
}