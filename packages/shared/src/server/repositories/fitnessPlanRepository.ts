import { BaseRepository } from '@/server/repositories/baseRepository';
import type { FitnessPlan } from '@/server/models/fitnessPlan';

/**
 * Repository for fitness plan database operations
 *
 * Simplified dossier-based: plans are stored as plain text content
 */
export class FitnessPlanRepository extends BaseRepository {
  /**
   * Get the latest fitness plan for a user
   */
  async getLatest(userId: string): Promise<FitnessPlan | null> {
    const result = await this.db
      .selectFrom('fitnessPlans')
      .selectAll()
      .where('clientId', '=', userId)
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();

    if (!result) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = result as any;
    return {
      id: result.id,
      clientId: result.clientId,
      content: row.content ?? null,
      description: result.description || '',
      startDate: new Date(result.startDate as unknown as string | number | Date),
      createdAt: new Date(result.createdAt as unknown as string | number | Date),
    };
  }

  /**
   * Create a new fitness plan
   */
  async create(userId: string, content: string, startDate: Date, description?: string): Promise<FitnessPlan> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertValues: any = {
      clientId: userId,
      content,
      description: description ?? content,
      startDate,
    };

    const result = await this.db
      .insertInto('fitnessPlans')
      .values(insertValues)
      .returningAll()
      .executeTakeFirstOrThrow();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = result as any;
    return {
      id: result.id,
      clientId: result.clientId,
      content: row.content ?? null,
      description: result.description || '',
      startDate: new Date(result.startDate as unknown as string | number | Date),
      createdAt: new Date(result.createdAt as unknown as string | number | Date),
    };
  }

  /**
   * Get plan history for a user
   */
  async getHistory(userId: string, limit: number = 10): Promise<FitnessPlan[]> {
    const results = await this.db
      .selectFrom('fitnessPlans')
      .selectAll()
      .where('clientId', '=', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .execute();

    return results.map((result) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = result as any;
      return {
        id: result.id,
        clientId: result.clientId,
        content: row.content ?? null,
        description: result.description || '',
        startDate: new Date(result.startDate as unknown as string | number | Date),
        createdAt: new Date(result.createdAt as unknown as string | number | Date),
      };
    });
  }

  /**
   * Get a fitness plan by ID
   */
  async getById(id: string): Promise<FitnessPlan | null> {
    const result = await this.db
      .selectFrom('fitnessPlans')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!result) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = result as any;
    return {
      id: result.id,
      clientId: result.clientId,
      content: row.content ?? null,
      description: result.description || '',
      startDate: new Date(result.startDate as unknown as string | number | Date),
      createdAt: new Date(result.createdAt as unknown as string | number | Date),
    };
  }
}
