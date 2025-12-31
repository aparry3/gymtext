import { Kysely } from 'kysely';
import { v4 as uuidv4 } from 'uuid';
import { DB } from '@/server/models/_types';
import { Microcycle, MicrocycleModel } from '@/server/models/microcycle';

/**
 * Repository for microcycle database operations
 *
 * Microcycles now use:
 * - absoluteWeek: Week number from plan start (1-indexed)
 * - days: Ordered array of day descriptions
 * - No mesocycleIndex or weekNumber
 */
export class MicrocycleRepository {
  constructor(private db: Kysely<DB>) {}

  async createMicrocycle(microcycle: Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Microcycle> {
    const result = await this.db
      .insertInto('microcycles')
      .values({
        id: uuidv4(),
        clientId: microcycle.clientId,
        absoluteWeek: microcycle.absoluteWeek,
        days: microcycle.days,
        description: microcycle.description,
        isDeload: microcycle.isDeload,
        message: microcycle.message,
        structured: microcycle.structured ? JSON.stringify(microcycle.structured) : null,
        startDate: microcycle.startDate,
        endDate: microcycle.endDate,
        isActive: microcycle.isActive,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return MicrocycleModel.fromDB(result as any);
  }

  async getActiveMicrocycle(clientId: string): Promise<Microcycle | null> {
    const result = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('clientId', '=', clientId)
      .where('isActive', '=', true)
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result ? MicrocycleModel.fromDB(result as any) : null;
  }

  /**
   * Get microcycle by absolute week number
   * Queries by clientId + absoluteWeek only (not fitnessPlanId)
   * Returns most recently updated if duplicates exist
   */
  async getMicrocycleByAbsoluteWeek(
    clientId: string,
    absoluteWeek: number
  ): Promise<Microcycle | null> {
    const result = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('clientId', '=', clientId)
      .where('absoluteWeek', '=', absoluteWeek)
      .orderBy('updatedAt', 'desc')
      .executeTakeFirst();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result ? MicrocycleModel.fromDB(result as any) : null;
  }

  async deactivatePreviousMicrocycles(clientId: string): Promise<void> {
    await this.db
      .updateTable('microcycles')
      .set({ isActive: false })
      .where('clientId', '=', clientId)
      .where('isActive', '=', true)
      .execute();
  }

  async updateMicrocycle(id: string, updates: Partial<Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Microcycle | null> {
    const updateData: Record<string, unknown> = {};

    if (updates.days !== undefined) {
      updateData.days = updates.days;
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.isDeload !== undefined) {
      updateData.isDeload = updates.isDeload;
    }
    if (updates.message !== undefined) {
      updateData.message = updates.message;
    }
    if (updates.structured !== undefined) {
      updateData.structured = updates.structured ? JSON.stringify(updates.structured) : null;
    }
    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
    }
    if (updates.startDate !== undefined) {
      updateData.startDate = updates.startDate;
    }
    if (updates.endDate !== undefined) {
      updateData.endDate = updates.endDate;
    }
    if (updates.absoluteWeek !== undefined) {
      updateData.absoluteWeek = updates.absoluteWeek;
    }

    if (Object.keys(updateData).length === 0) {
      // No updates to perform
      return this.getMicrocycleById(id);
    }

    const result = await this.db
      .updateTable('microcycles')
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result ? MicrocycleModel.fromDB(result as any) : null;
  }

  async getMicrocycleById(id: string): Promise<Microcycle | null> {
    const result = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result ? MicrocycleModel.fromDB(result as any) : null;
  }

  async getRecentMicrocycles(clientId: string, limit: number = 5): Promise<Microcycle[]> {
    const results = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('clientId', '=', clientId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .execute();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((r) => MicrocycleModel.fromDB(r as any));
  }

  async deleteMicrocycle(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('microcycles')
      .where('id', '=', id)
      .executeTakeFirst();

    return result.numDeletedRows > 0;
  }

  /**
   * Get all microcycles for a client ordered by absolute week
   */
  async getAllMicrocycles(clientId: string): Promise<Microcycle[]> {
    const results = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('clientId', '=', clientId)
      .orderBy('absoluteWeek', 'asc')
      .execute();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((r) => MicrocycleModel.fromDB(r as any));
  }

  /**
   * Get microcycle for a specific date
   * Used for date-based progress tracking - finds the microcycle that contains the target date
   * Queries by clientId + date range only (not fitnessPlanId)
   * Returns most recently updated if duplicates exist
   */
  async getMicrocycleByDate(
    clientId: string,
    targetDate: Date
  ): Promise<Microcycle | null> {
    const result = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('clientId', '=', clientId)
      .where('startDate', '<=', targetDate)
      .where('endDate', '>=', targetDate)
      .orderBy('updatedAt', 'desc')
      .executeTakeFirst();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result ? MicrocycleModel.fromDB(result as any) : null;
  }

}
