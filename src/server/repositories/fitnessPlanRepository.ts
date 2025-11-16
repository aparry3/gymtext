import { BaseRepository } from '@/server/repositories/baseRepository';
import {
  FitnessPlanModel,
  type FitnessPlan,
} from '@/server/models/fitnessPlan';
import { Json } from '@/server/models/_types';


export class FitnessPlanRepository extends BaseRepository {
  async insertFitnessPlan(
    fitnessPlan: FitnessPlan
  ): Promise<FitnessPlan> {
    // Convert mesocycles to JSON for database storage
    const dbValues = {
      ...fitnessPlan,
      mesocycles: JSON.stringify(fitnessPlan.mesocycles) as unknown as Json,
    };

    const result = await this.db
      .insertInto('fitnessPlans')
      .values(dbValues)
      .returningAll()
      .executeTakeFirstOrThrow();

    return FitnessPlanModel.fromDB(result);
  }

  async getFitnessPlan(id: string): Promise<FitnessPlan | null> {
    const result = await this.db
      .selectFrom('fitnessPlans')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!result) return null;
    return FitnessPlanModel.fromDB(result);
  }

  async getCurrentPlan(userId: string): Promise<FitnessPlan | null> {
    const result = await this.db
      .selectFrom('fitnessPlans')
      .selectAll()
      .where('clientId', '=', userId)
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();

    if (!result) return null;
    return FitnessPlanModel.fromDB(result);
  }

}