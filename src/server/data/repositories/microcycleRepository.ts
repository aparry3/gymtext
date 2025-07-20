import { BaseRepository } from './baseRepository';
import type { 
  MicrocycleRow, 
  NewMicrocycle, 
  MicrocycleUpdate 
} from '../types/cycleTypes';

export class MicrocycleRepository extends BaseRepository {
  /**
   * Create a new microcycle
   */
  async createMicrocycle(data: NewMicrocycle): Promise<string> {
    const result = await this.db
      .insertInto('microcycles')
      .values(data)
      .returning('id')
      .executeTakeFirstOrThrow();
    
    return result.id;
  }

  /**
   * Create multiple microcycles in a batch
   */
  async createMicrocycles(microcycles: NewMicrocycle[]): Promise<string[]> {
    const results = await this.db
      .insertInto('microcycles')
      .values(microcycles)
      .returning('id')
      .execute();
    
    return results.map(r => r.id);
  }

  /**
   * Get a microcycle by ID
   */
  async getMicrocycleById(id: string): Promise<MicrocycleRow | null> {
    const result = await this.db
      .selectFrom('microcycles')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
    
    return result || null;
  }

  /**
   * Get all microcycles for a mesocycle
   */
  async getMicrocyclesByMesocycleId(mesocycleId: string): Promise<MicrocycleRow[]> {
    return await this.db
      .selectFrom('microcycles')
      .where('mesocycleId', '=', mesocycleId)
      .orderBy('weekNumber', 'asc')
      .selectAll()
      .execute();
  }

  /**
   * Get all microcycles for a fitness plan
   */
  async getMicrocyclesByPlanId(fitnessPlanId: string): Promise<MicrocycleRow[]> {
    return await this.db
      .selectFrom('microcycles')
      .where('fitnessPlanId', '=', fitnessPlanId)
      .orderBy('cycleOffset', 'asc')
      .selectAll()
      .execute();
  }

  /**
   * Get the current microcycle for a client based on date
   */
  async getCurrentMicrocycleByClientId(clientId: string): Promise<MicrocycleRow | null> {
    const now = new Date();
    
    const result = await this.db
      .selectFrom('microcycles')
      .where('clientId', '=', clientId)
      .where('startDate', '<=', now)
      .where('endDate', '>=', now)
      .selectAll()
      .executeTakeFirst();
    
    return result || null;
  }

  /**
   * Update a microcycle
   */
  async updateMicrocycle(id: string, data: MicrocycleUpdate): Promise<void> {
    await this.db
      .updateTable('microcycles')
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where('id', '=', id)
      .execute();
  }


  /**
   * Delete a microcycle (and cascade to workout instances)
   */
  async deleteMicrocycle(id: string): Promise<void> {
    await this.db
      .deleteFrom('microcycles')
      .where('id', '=', id)
      .execute();
  }


  /**
   * Get upcoming microcycles for a client within a date range
   */
  async getUpcomingMicrocycles(
    clientId: string, 
    daysAhead: number = 7
  ): Promise<MicrocycleRow[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return await this.db
      .selectFrom('microcycles')
      .where('clientId', '=', clientId)
      .where('startDate', '>=', now)
      .where('startDate', '<=', futureDate)
      .orderBy('startDate', 'asc')
      .selectAll()
      .execute();
  }
}