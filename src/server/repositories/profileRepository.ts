import { BaseRepository } from './baseRepository';
import type { Profiles } from '../models/_types';
import type { Selectable, Insertable } from 'kysely';
import type { StructuredProfile } from '@/server/agents/profile';

export type Profile = Selectable<Profiles>;
export type NewProfile = Insertable<Profiles>;

/**
 * Profile with typed structured data
 * The database stores structured as JSONB, this interface casts it to the correct type
 */
export interface ProfileWithStructured extends Omit<Profile, 'structured'> {
  structured: StructuredProfile | null;
}

/**
 * ProfileRepository - Data access layer for Markdown-based fitness profiles
 *
 * This repository handles CRUD operations for the profiles table which stores
 * the history of user fitness profiles in Markdown format. Each update creates
 * a new row, providing full audit trail and versioning.
 */
export class ProfileRepository extends BaseRepository {
  /**
   * Get the current (most recent) profile for a user
   *
   * @param clientId - UUID of the user
   * @returns Most recent profile or undefined if no profiles exist
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
   *
   * @param clientId - UUID of the user
   * @returns Markdown profile text or null if no profiles exist
   */
  async getCurrentProfileText(clientId: string): Promise<string | null> {
    const profile = await this.getCurrentProfile(clientId);
    return profile?.profile ?? null;
  }

  /**
   * Create a new profile entry (appends to history)
   *
   * @param newProfile - Profile data to insert
   * @returns Created profile record
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
   * Convenience method for common use case
   *
   * @param clientId - UUID of the user
   * @param profileMarkdown - Markdown-formatted profile text
   * @returns Created profile record
   */
  async createProfileForUser(clientId: string, profileMarkdown: string): Promise<Profile> {
    return this.createProfile({
      clientId,
      profile: profileMarkdown,
    });
  }

  /**
   * Get profile history for a user
   *
   * @param clientId - UUID of the user
   * @param limit - Maximum number of historical profiles to retrieve (default: 10)
   * @returns Array of profile records, ordered by most recent first
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
   * Returns the most recent profile that was created before or at the given date
   *
   * @param clientId - UUID of the user
   * @param date - Date to retrieve profile for
   * @returns Profile record or undefined if no profiles exist before that date
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
   *
   * @param clientId - UUID of the user
   * @returns Number of profile updates in history
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
   *
   * @param clientId - UUID of the user
   * @returns Date of last update or null if no profiles exist
   */
  async getLastUpdateDate(clientId: string): Promise<Date | null> {
    const profile = await this.getCurrentProfile(clientId);
    return profile?.createdAt ?? null;
  }

  /**
   * Delete all profiles for a user (typically only for testing/cleanup)
   * WARNING: This removes all history
   *
   * @param clientId - UUID of the user
   * @returns Number of profiles deleted
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
   *
   * @returns Array of distinct client IDs
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
   *
   * @param clientId - UUID of the user
   * @returns True if user has at least one profile
   */
  async hasProfile(clientId: string): Promise<boolean> {
    const count = await this.countProfileUpdates(clientId);
    return count > 0;
  }

  // ============================================
  // Structured Profile Methods
  // ============================================

  /**
   * Create a new profile entry with structured data
   * Convenience method that handles JSONB serialization
   *
   * @param clientId - UUID of the user
   * @param profileMarkdown - Markdown-formatted profile text
   * @param structured - Structured profile data (or null)
   * @returns Created profile record
   */
  async createProfileWithStructured(
    clientId: string,
    profileMarkdown: string,
    structured: StructuredProfile | null
  ): Promise<Profile> {
    const result = await this.db
      .insertInto('profiles')
      .values({
        clientId,
        profile: profileMarkdown,
        structured: structured ? JSON.stringify(structured) : null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  /**
   * Get the current profile with typed structured data
   *
   * @param clientId - UUID of the user
   * @returns Most recent profile with typed structured field, or undefined
   */
  async getCurrentProfileWithStructured(clientId: string): Promise<ProfileWithStructured | undefined> {
    const profile = await this.getCurrentProfile(clientId);
    if (!profile) return undefined;

    return {
      ...profile,
      structured: profile.structured as StructuredProfile | null,
    };
  }

  /**
   * Get the current structured profile data only
   *
   * @param clientId - UUID of the user
   * @returns Structured profile data or null if not available
   */
  async getCurrentStructuredProfile(clientId: string): Promise<StructuredProfile | null> {
    const profile = await this.getCurrentProfileWithStructured(clientId);
    return profile?.structured ?? null;
  }
}
