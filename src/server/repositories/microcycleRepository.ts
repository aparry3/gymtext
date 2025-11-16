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
        mondayOverview: microcycle.mondayOverview,
        tuesdayOverview: microcycle.tuesdayOverview,
        wednesdayOverview: microcycle.wednesdayOverview,
        thursdayOverview: microcycle.thursdayOverview,
        fridayOverview: microcycle.fridayOverview,
        saturdayOverview: microcycle.saturdayOverview,
        sundayOverview: microcycle.sundayOverview,
        description: microcycle.description,
        isDeload: microcycle.isDeload,
        formatted: microcycle.formatted,
        message: microcycle.message,
        startDate: microcycle.startDate,
        endDate: microcycle.endDate,
        isActive: microcycle.isActive,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return MicrocycleModel.fromDB(result as any);
  }

  async getActiveMicrocycle(userId: string): Promise<Microcycle | null> {
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

    if (updates.mondayOverview !== undefined) {
      updateData.mondayOverview = updates.mondayOverview;
    }
    if (updates.tuesdayOverview !== undefined) {
      updateData.tuesdayOverview = updates.tuesdayOverview;
    }
    if (updates.wednesdayOverview !== undefined) {
      updateData.wednesdayOverview = updates.wednesdayOverview;
    }
    if (updates.thursdayOverview !== undefined) {
      updateData.thursdayOverview = updates.thursdayOverview;
    }
    if (updates.fridayOverview !== undefined) {
      updateData.fridayOverview = updates.fridayOverview;
    }
    if (updates.saturdayOverview !== undefined) {
      updateData.saturdayOverview = updates.saturdayOverview;
    }
    if (updates.sundayOverview !== undefined) {
      updateData.sundayOverview = updates.sundayOverview;
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.isDeload !== undefined) {
      updateData.isDeload = updates.isDeload;
    }
    if (updates.formatted !== undefined) {
      updateData.formatted = updates.formatted;
    }
    if (updates.message !== undefined) {
      updateData.message = updates.message;
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

  async getMicrocyclesByMesocycleIndex(userId: string, mesocycleIndex: number): Promise<Microcycle[]> {
    const results = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('userId', '=', userId)
      .where('mesocycleIndex', '=', mesocycleIndex)
      .orderBy('weekNumber', 'asc')
      .execute();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((r) => MicrocycleModel.fromDB(r as any));
  }

  async getAllMicrocycles(userId: string): Promise<Microcycle[]> {
    const results = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('mesocycleIndex', 'asc')
      .orderBy('weekNumber', 'asc')
      .execute();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((r) => MicrocycleModel.fromDB(r as any));
  }

  /**
   * Get microcycle for a specific date
   * Used for date-based progress tracking - finds the microcycle that contains the target date
   */
  async getMicrocycleByDate(
    userId: string,
    fitnessPlanId: string,
    targetDate: Date
  ): Promise<Microcycle | null> {
    const result = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('userId', '=', userId)
      .where('fitnessPlanId', '=', fitnessPlanId)
      .where('startDate', '<=', targetDate)
      .where('endDate', '>=', targetDate)
      .executeTakeFirst();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result ? MicrocycleModel.fromDB(result as any) : null;
  }
}