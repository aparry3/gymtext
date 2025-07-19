import { BaseRepository } from './baseRepository';
import type { 
  MesocycleRow, 
  NewMesocycle, 
  MesocycleUpdate 
} from '../types/cycleTypes';

export class MesocycleRepository extends BaseRepository {
  /**
   * Create a new mesocycle
   */
  async createMesocycle(data: NewMesocycle): Promise<string> {
    const result = await this.db
      .insertInto('mesocycles')
      .values(data)
      .returning('id')
      .executeTakeFirstOrThrow();
    
    return result.id;
  }

  /**
   * Create multiple mesocycles in a transaction
   */
  async createMesocycles(mesocycles: NewMesocycle[]): Promise<string[]> {
    const results = await this.db
      .insertInto('mesocycles')
      .values(mesocycles)
      .returning('id')
      .execute();
    
    return results.map(r => r.id);
  }

  /**
   * Get a mesocycle by ID
   */
  async getMesocycleById(id: string): Promise<MesocycleRow | null> {
    const result = await this.db
      .selectFrom('mesocycles')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
    
    return result || null;
  }

  /**
   * Get all mesocycles for a fitness plan
   */
  async getMesocyclesByProgramId(fitnessPlanId: string): Promise<MesocycleRow[]> {
    return await this.db
      .selectFrom('mesocycles')
      .where('fitnessPlanId', '=', fitnessPlanId)
      .orderBy('cycleOffset', 'asc')
      .selectAll()
      .execute();
  }

  /**
   * Get all mesocycles for a client
   */
  async getMesocyclesByClientId(clientId: string): Promise<MesocycleRow[]> {
    return await this.db
      .selectFrom('mesocycles')
      .where('clientId', '=', clientId)
      .orderBy('startDate', 'desc')
      .selectAll()
      .execute();
  }

  /**
   * Get the active mesocycle for a client
   */
  async getActiveMesocycleByClientId(clientId: string): Promise<MesocycleRow | null> {
    const now = new Date();
    
    const result = await this.db
      .selectFrom('mesocycles')
      .where('clientId', '=', clientId)
      .where('startDate', '<=', now)
      .where('status', '=', 'active')
      .orderBy('startDate', 'desc')
      .selectAll()
      .executeTakeFirst();
    
    return result || null;
  }

  /**
   * Update a mesocycle
   */
  async updateMesocycle(id: string, data: MesocycleUpdate): Promise<void> {
    await this.db
      .updateTable('mesocycles')
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where('id', '=', id)
      .execute();
  }

  /**
   * Update mesocycle status
   */
  async updateMesocycleStatus(id: string, status: string): Promise<void> {
    await this.updateMesocycle(id, { status });
  }

  /**
   * Delete a mesocycle (and cascade to microcycles and workout instances)
   */
  async deleteMesocycle(id: string): Promise<void> {
    await this.db
      .deleteFrom('mesocycles')
      .where('id', '=', id)
      .execute();
  }

  /**
   * Get mesocycles that should be activated based on start date
   */
  async getMesocyclesToActivate(): Promise<MesocycleRow[]> {
    const now = new Date();
    
    return await this.db
      .selectFrom('mesocycles')
      .where('status', '=', 'pending')
      .where('startDate', '<=', now)
      .selectAll()
      .execute();
  }

  /**
   * Get mesocycles that should be completed based on calculated end date
   * Note: This is a simplified version - you may want to add an endDate column
   * to the mesocycles table for more accurate date calculations
   */
  async getMesocyclesToComplete(): Promise<MesocycleRow[]> {
    const now = new Date();
    
    // Get all active mesocycles and filter in application code
    const activeMesocycles = await this.db
      .selectFrom('mesocycles')
      .where('status', '=', 'active')
      .selectAll()
      .execute();
    
    // Filter mesocycles where start date + weeks has passed
    return activeMesocycles.filter(mesocycle => {
      const endDate = new Date(mesocycle.startDate);
      endDate.setDate(endDate.getDate() + (mesocycle.lengthWeeks * 7));
      return endDate < now;
    });
  }
}