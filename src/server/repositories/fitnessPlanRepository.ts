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
        mesocycles: JSON.stringify(fitnessPlan.mesocycles),
      })
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

  async updateProgress(
    userId: string,
    progress: {
      currentMesocycleIndex?: number;
      currentMicrocycleWeek?: number;
      cycleStartDate?: Date;
    }
  ): Promise<void> {
    await this.db
      .updateTable('fitnessPlans')
      .set({
        ...(progress.currentMesocycleIndex !== undefined && {
          currentMesocycleIndex: progress.currentMesocycleIndex
        }),
        ...(progress.currentMicrocycleWeek !== undefined && {
          currentMicrocycleWeek: progress.currentMicrocycleWeek
        }),
        ...(progress.cycleStartDate !== undefined && {
          cycleStartDate: progress.cycleStartDate
        }),
        updatedAt: new Date()
      })
      .where('clientId', '=', userId)
      .execute();
  }

  async getProgress(userId: string): Promise<{
    currentMesocycleIndex: number;
    currentMicrocycleWeek: number;
    cycleStartDate: Date | null;
  } | null> {
    const result = await this.db
      .selectFrom('fitnessPlans')
      .select([
        'currentMesocycleIndex',
        'currentMicrocycleWeek',
        'cycleStartDate'
      ])
      .where('clientId', '=', userId)
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();
    
    if (!result) return null;
    
    return {
      currentMesocycleIndex: result.currentMesocycleIndex || 0,
      currentMicrocycleWeek: result.currentMicrocycleWeek || 1,
      cycleStartDate: result.cycleStartDate
    };
  }
}