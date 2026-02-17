import { BaseRepository } from './baseRepository';
import type { Profiles } from '../models/_types';
import type { Selectable, Insertable } from 'kysely';

export type Profile = Selectable<Profiles>;
export type NewProfile = Insertable<Profiles>;

/**
 * ProfileRepository - Data access layer for Markdown-based fitness profiles
 *
 * Handles CRUD operations for the profiles table which stores
 * the history of user fitness profiles in Markdown format. Each update creates
 * a new row, providing full audit trail and versioning.
 */
export class ProfileRepository extends BaseRepository {
  /**
   * Get the current (most recent) profile for a user
   */
  async getCurrentProfile(clientId: string): Promise<Profile | undefined> {
    const profile = await this.db
      .selectFrom('profiles')
      .where('clientId', '=', clientId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .selectAll()
      .executeTakeFirst();

    return profile;
  }

  /**
   * Get the current profile text (Markdown) for a user
   */
  async getCurrentProfileText(clientId: string): Promise<string | null> {
    const profile = await this.getCurrentProfile(clientId);
    return profile?.profile ?? null;
  }

  /**
   * Create a new profile entry (appends to history)
   */
  async createProfile(newProfile: NewProfile): Promise<Profile> {
    const result = await this.db
      .insertInto('profiles')
      .values(newProfile)
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  /**
   * Create a new profile entry with just clientId and profile text
   */
  async createProfileForUser(clientId: string, profileMarkdown: string): Promise<Profile> {
    return this.createProfile({
      clientId,
      profile: profileMarkdown,
    });
  }

  /**
   * Get profile history for a user
   */
  async getProfileHistory(clientId: string, limit: number = 10): Promise<Profile[]> {
    const profiles = await this.db
      .selectFrom('profiles')
      .where('clientId', '=', clientId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();

    return profiles;
  }

  /**
   * Get profile as of a specific date
   */
  async getProfileAtDate(clientId: string, date: Date): Promise<Profile | undefined> {
    const profile = await this.db
      .selectFrom('profiles')
      .where('clientId', '=', clientId)
      .where('createdAt', '<=', date)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .selectAll()
      .executeTakeFirst();

    return profile;
  }

  /**
   * Count total profile updates for a user
   */
  async countProfileUpdates(clientId: string): Promise<number> {
    const result = await this.db
      .selectFrom('profiles')
      .where('clientId', '=', clientId)
      .select(this.db.fn.count('id').as('count'))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  }

  /**
   * Get the date of the last profile update
   */
  async getLastUpdateDate(clientId: string): Promise<Date | null> {
    const profile = await this.getCurrentProfile(clientId);
    return profile?.createdAt ?? null;
  }

  /**
   * Delete all profiles for a user (typically only for testing/cleanup)
   */
  async deleteAllProfilesForUser(clientId: string): Promise<number> {
    const result = await this.db
      .deleteFrom('profiles')
      .where('clientId', '=', clientId)
      .executeTakeFirst();

    return Number(result.numDeletedRows);
  }

  /**
   * Get all users who have profiles
   */
  async getAllUsersWithProfiles(): Promise<string[]> {
    const results = await this.db
      .selectFrom('profiles')
      .select('clientId')
      .distinct()
      .execute();

    return results.map(r => r.clientId);
  }

  /**
   * Check if a user has any profiles
   */
  async hasProfile(clientId: string): Promise<boolean> {
    const count = await this.countProfileUpdates(clientId);
    return count > 0;
  }

}
