import { Kysely, sql } from 'kysely';
import { v4 as uuidv4 } from 'uuid';
import { DB } from '@/server/models/_types';
import { Mesocycle, MesocycleModel } from '@/server/models/mesocycle';

export class MesocycleRepository {
  constructor(private db: Kysely<DB>) {}

  /**
   * Create a new mesocycle record
   */
  async createMesocycle(mesocycle: Omit<Mesocycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Mesocycle> {
    const result = await this.db
      .insertInto('mesocycles')
      .values({
        id: uuidv4(),
        userId: mesocycle.userId,
        fitnessPlanId: mesocycle.fitnessPlanId,
        mesocycleIndex: mesocycle.mesocycleIndex,
        description: mesocycle.description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        microcycles: sql`${mesocycle.microcycles}::text[]` as any,
        formatted: mesocycle.formatted,
        startWeek: mesocycle.startWeek,
        durationWeeks: mesocycle.durationWeeks,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return MesocycleModel.fromDB(result as any);
  }

  /**
   * Get all mesocycles for a fitness plan
   */
  async getMesocyclesByPlanId(fitnessPlanId: string): Promise<Mesocycle[]> {
    const results = await this.db
      .selectFrom('mesocycles')
      .selectAll()
      .where('fitnessPlanId', '=', fitnessPlanId)
      .orderBy('mesocycleIndex', 'asc')
      .execute();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map(result => MesocycleModel.fromDB(result as any));
  }

  /**
   * Get a specific mesocycle by plan ID and index
   */
  async getMesocycleByIndex(
    fitnessPlanId: string,
    mesocycleIndex: number
  ): Promise<Mesocycle | null> {
    const result = await this.db
      .selectFrom('mesocycles')
      .selectAll()
      .where('fitnessPlanId', '=', fitnessPlanId)
      .where('mesocycleIndex', '=', mesocycleIndex)
      .executeTakeFirst();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result ? MesocycleModel.fromDB(result as any) : null;
  }

  /**
   * Get all mesocycles for a user
   */
  async getMesocyclesByUserId(userId: string): Promise<Mesocycle[]> {
    const results = await this.db
      .selectFrom('mesocycles')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('createdAt', 'desc')
      .execute();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map(result => MesocycleModel.fromDB(result as any));
  }

  /**
   * Update a mesocycle
   */
  async updateMesocycle(
    id: string,
    updates: Partial<Omit<Mesocycle, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'fitnessPlanId' | 'mesocycleIndex'>>
  ): Promise<Mesocycle | null> {
    const updateData: Record<string, unknown> = {};

    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.microcycles !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateData.microcycles = sql`${updates.microcycles}::text[]` as any;
    }
    if (updates.formatted !== undefined) {
      updateData.formatted = updates.formatted;
    }
    if (updates.startWeek !== undefined) {
      updateData.startWeek = updates.startWeek;
    }
    if (updates.durationWeeks !== undefined) {
      updateData.durationWeeks = updates.durationWeeks;
    }

    if (Object.keys(updateData).length === 0) {
      // No updates to apply, return current record
      const result = await this.db
        .selectFrom('mesocycles')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result ? MesocycleModel.fromDB(result as any) : null;
    }

    const result = await this.db
      .updateTable('mesocycles')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result ? MesocycleModel.fromDB(result as any) : null;
  }

  /**
   * Delete a mesocycle
   */
  async deleteMesocycle(id: string): Promise<void> {
    await this.db
      .deleteFrom('mesocycles')
      .where('id', '=', id)
      .execute();
  }

  /**
   * Delete all mesocycles for a fitness plan
   */
  async deleteMesocyclesByPlanId(fitnessPlanId: string): Promise<void> {
    await this.db
      .deleteFrom('mesocycles')
      .where('fitnessPlanId', '=', fitnessPlanId)
      .execute();
  }
}
