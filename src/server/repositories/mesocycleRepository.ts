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

  // /**
  //  * Find a mesocycle by ID
  //  */
  // async findById(id: string): Promise<MesocycleRow | undefined> {
  //   return await this.db
  //     .selectFrom('mesocycles')
  //     .selectAll()
  //     .where('id', '=', id)
  //     .executeTakeFirst();
  // }

  // /**
  //  * Update a mesocycle
  //  */
  // async update(id: string, updates: Partial<MesocycleRow>): Promise<MesocycleRow> {
  //   return await this.db
  //     .updateTable('mesocycles')
  //     .set({
  //       ...updates,
  //       updatedAt: new Date()
  //     })
  //     .where('id', '=', id)
  //     .returningAll()
  //     .executeTakeFirstOrThrow();
  // }

  // /**
  //  * Delete a mesocycle
  //  */
  // async delete(id: string): Promise<void> {
  //   await this.db
  //     .deleteFrom('mesocycles')
  //     .where('id', '=', id)
  //     .execute();
  // }
  // /**
  //  * Create a new mesocycle
  //  */
  // async createMesocycle(data: NewMesocycle): Promise<string> {
  //   const result = await this.db
  //     .insertInto('mesocycles')
  //     .values(data)
  //     .returning('id')
  //     .executeTakeFirstOrThrow();
    
  //   return result.id;
  // }

  // /**
  //  * Create multiple mesocycles in a transaction
  //  */
  // async createMesocycles(mesocycles: NewMesocycle[]): Promise<string[]> {
  //   const results = await this.db
  //     .insertInto('mesocycles')
  //     .values(mesocycles)
  //     .returning('id')
  //     .execute();
    
  //   return results.map(r => r.id);
  // }

  // /**
  //  * Get a mesocycle by ID
  //  */
  // async getMesocycleById(id: string): Promise<MesocycleRow | null> {
  //   const result = await this.db
  //     .selectFrom('mesocycles')
  //     .where('id', '=', id)
  //     .selectAll()
  //     .executeTakeFirst();
    
  //   return result || null;
  // }

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

  // /**
  //  * Get all mesocycles for a client
  //  */
  // async getMesocyclesByClientId(clientId: string): Promise<MesocycleRow[]> {
  //   return await this.db
  //     .selectFrom('mesocycles')
  //     .where('clientId', '=', clientId)
  //     .orderBy('startDate', 'desc')
  //     .selectAll()
  //     .execute();
  // }

  // /**
  //  * Get the current mesocycle for a client based on date
  //  */
  // async getCurrentMesocycleByClientId(clientId: string): Promise<MesocycleRow | null> {
  //   const now = new Date();
    
  //   const result = await this.db
  //     .selectFrom('mesocycles')
  //     .where('clientId', '=', clientId)
  //     .where('startDate', '<=', now)
  //     .orderBy('startDate', 'desc')
  //     .selectAll()
  //     .executeTakeFirst();
    
  //   // Check if it's still within the mesocycle duration
  //   if (result) {
  //     const endDate = new Date(result.startDate);
  //     endDate.setDate(endDate.getDate() + (result.lengthWeeks * 7));
  //     if (now > endDate) {
  //       return null;
  //     }
  //   }
    
  //   return result || null;
  // }

  // /**
  //  * Update a mesocycle
  //  */
  // async updateMesocycle(id: string, data: MesocycleUpdate): Promise<void> {
  //   await this.db
  //     .updateTable('mesocycles')
  //     .set({
  //       ...data,
  //       updatedAt: new Date()
  //     })
  //     .where('id', '=', id)
  //     .execute();
  // }


  // /**
  //  * Delete a mesocycle (and cascade to microcycles and workout instances)
  //  */
  // async deleteMesocycle(id: string): Promise<void> {
  //   await this.db
  //     .deleteFrom('mesocycles')
  //     .where('id', '=', id)
  //     .execute();
  // }

}