import { BaseRepository } from '@/server/repositories/baseRepository';
import type { Mesocycle, NewMesocycle } from '@/server/models/mesocycle';

export class MesocycleRepository extends BaseRepository {
  /**
   * Create a new mesocycle
   */
  async create(data: NewMesocycle): Promise<Mesocycle> {
    const result = await this.db
      .insertInto('mesocycles')
      .values(data as NewMesocycle)
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return result;
  }

  /**
   * Get all mesocycles for a fitness plan
   */
  async getMesocyclesByFitnessPlanId(fitnessPlanId: string): Promise<Mesocycle[]> {
    return await this.db
      .selectFrom('mesocycles')
      .where('fitnessPlanId', '=', fitnessPlanId)
      .orderBy('index', 'asc')
      .selectAll()
      .execute();
  }
}