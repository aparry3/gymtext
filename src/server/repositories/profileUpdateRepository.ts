import { BaseRepository } from './baseRepository';
import type { ProfileUpdates } from '../models/_types';
import type { Selectable, Insertable } from 'kysely';

export type ProfileUpdate = Selectable<ProfileUpdates>;
export type NewProfileUpdate = Insertable<ProfileUpdates>;

export class ProfileUpdateRepository extends BaseRepository {
  /**
   * Create a new profile update audit record
   */
  async create(update: NewProfileUpdate): Promise<ProfileUpdate> {
    const result = await this.db
      .insertInto('profileUpdates')
      .values(update)
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  /**
   * Get profile updates for a specific client
   */
  async getClientUpdates(
    clientId: string,
    limit: number = 10
  ): Promise<ProfileUpdate[]> {
    const updates = await this.db
      .selectFrom('profileUpdates')
      .where('clientId', '=', clientId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();

    return updates;
  }

  /**
   * Get recent profile updates across all users (for monitoring)
   */
  async getRecentUpdates(limit: number = 50): Promise<ProfileUpdate[]> {
    const updates = await this.db
      .selectFrom('profileUpdates')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();

    return updates;
  }

  /**
   * Get profile updates by source (e.g., 'chat', 'admin', 'api')
   */
  async getUpdatesBySource(
    source: string,
    limit: number = 50
  ): Promise<ProfileUpdate[]> {
    const updates = await this.db
      .selectFrom('profileUpdates')
      .where('source', '=', source)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();

    return updates;
  }

  /**
   * Count profile updates for a client
   */
  async countClientUpdates(clientId: string): Promise<number> {
    const result = await this.db
      .selectFrom('profileUpdates')
      .where('clientId', '=', clientId)
      .select(this.db.fn.count('id').as('count'))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  }
}