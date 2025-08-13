import { Kysely } from 'kysely';
import { v4 as uuidv4 } from 'uuid';
import { DB } from '@/server/models/_types';
import { Microcycle, MicrocycleModel } from '@/server/models/microcycle';

export class MicrocycleRepository {
  constructor(private db: Kysely<DB>) {}

  async createMicrocycle(microcycle: Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Microcycle> {
    const result = await this.db
      .insertInto('microcycles')
      .values({
        id: uuidv4(),
        userId: microcycle.userId,
        fitnessPlanId: microcycle.fitnessPlanId,
        mesocycleIndex: microcycle.mesocycleIndex,
        weekNumber: microcycle.weekNumber,
        pattern: JSON.stringify(microcycle.pattern),
        startDate: microcycle.startDate,
        endDate: microcycle.endDate,
        isActive: microcycle.isActive,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return MicrocycleModel.fromDB(result as any);
  }

  async getCurrentMicrocycle(userId: string): Promise<Microcycle | null> {
    const result = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('userId', '=', userId)
      .where('isActive', '=', true)
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result ? MicrocycleModel.fromDB(result as any) : null;
  }

  async getMicrocycleByWeek(
    userId: string, 
    fitnessPlanId: string,
    mesocycleIndex: number, 
    weekNumber: number
  ): Promise<Microcycle | null> {
    const result = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('userId', '=', userId)
      .where('fitnessPlanId', '=', fitnessPlanId)
      .where('mesocycleIndex', '=', mesocycleIndex)
      .where('weekNumber', '=', weekNumber)
      .executeTakeFirst();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result ? MicrocycleModel.fromDB(result as any) : null;
  }

  async deactivatePreviousMicrocycles(userId: string): Promise<void> {
    await this.db
      .updateTable('microcycles')
      .set({ isActive: false })
      .where('userId', '=', userId)
      .where('isActive', '=', true)
      .execute();
  }

  async updateMicrocycle(id: string, updates: Partial<Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Microcycle | null> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.pattern !== undefined) {
      updateData.pattern = JSON.stringify(updates.pattern);
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

  async getRecentMicrocycles(userId: string, limit: number = 5): Promise<Microcycle[]> {
    const results = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('userId', '=', userId)
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
}