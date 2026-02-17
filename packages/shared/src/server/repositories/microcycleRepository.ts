import { Kysely } from 'kysely';
import { v4 as uuidv4 } from 'uuid';
import { DB } from '@/server/models/_types';
import { Microcycle } from '@/server/models/microcycle';

/**
 * Repository for microcycle database operations
 *
 * Simplified dossier-based: microcycles are stored as plain text content
 */
export class MicrocycleRepository {
  constructor(private db: Kysely<DB>) {}

  /**
   * Get the latest microcycle for a user
   */
  async getLatest(clientId: string): Promise<Microcycle | null> {
    const result = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('clientId', '=', clientId)
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();

    if (!result) return null;
    return this.toMicrocycle(result);
  }

  /**
   * Get microcycle for a specific date
   * Returns the most recent microcycle with start_date <= targetDate
   */
  async getByDate(clientId: string, targetDate: Date): Promise<Microcycle | null> {
    const result = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('clientId', '=', clientId)
      .where('startDate', '<=', targetDate)
      .orderBy('startDate', 'desc')
      .executeTakeFirst();

    if (!result) return null;
    return this.toMicrocycle(result);
  }

  /**
   * Create a new microcycle
   */
  async create(clientId: string, planId: string, content: string, startDate: Date): Promise<Microcycle> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertValues: any = {
      id: uuidv4(),
      clientId,
      planId,
      content,
      startDate,
    };

    const result = await this.db
      .insertInto('microcycles')
      .values(insertValues)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.toMicrocycle(result);
  }

  /**
   * Get microcycle history for a user
   */
  async getHistory(clientId: string, limit: number = 10): Promise<Microcycle[]> {
    const results = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('clientId', '=', clientId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .execute();

    return results.map(r => this.toMicrocycle(r));
  }

  /**
   * Get a microcycle by ID
   */
  async getById(id: string): Promise<Microcycle | null> {
    const result = await this.db
      .selectFrom('microcycles')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!result) return null;
    return this.toMicrocycle(result);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toMicrocycle(row: any): Microcycle {
    return {
      id: row.id as string,
      clientId: row.clientId as string,
      planId: row.planId ?? null,
      content: row.content ?? null,
      startDate: new Date(row.startDate),
      createdAt: new Date(row.createdAt),
    };
  }
}
