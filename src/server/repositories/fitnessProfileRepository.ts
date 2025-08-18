import { Kysely } from 'kysely';
import { DB } from '../models/_types';
import { BaseRepository } from './baseRepository';
import { FitnessProfile } from '../models/fitnessProfile';

export class FitnessProfileRepository extends BaseRepository {
  constructor(db: Kysely<DB>) {
    super(db);
  }

  /**
   * Get profile by user ID
   */
  async getByUserId(userId: string) {
    return await this.db
      .selectFrom('fitnessProfiles')
      .selectAll()
      .where('userId', '=', userId)
      .executeTakeFirst();
  }

  /**
   * Get profile JSON by user ID
   */
  async getProfile(userId: string): Promise<FitnessProfile> {
    const row = await this.getByUserId(userId);
    if (!row) {
      return {}; // Return empty profile if not found
    }
    
    // Parse JSON profile or construct from legacy fields
    if (row.profile && typeof row.profile === 'object') {
      return row.profile as FitnessProfile;
    }
    
    // Fallback: construct from legacy fields
    return {
      primaryGoal: row.fitnessGoals,
      experienceLevel: row.skillLevel,
      availability: {
        daysPerWeek: this.parseFrequency(row.exerciseFrequency),
      },
      identity: {
        age: row.age,
        gender: row.gender,
      },
      version: 1,
    };
  }

  /**
   * Apply profile patch (deep merge)
   */
  async applyProfilePatch(
    userId: string,
    patch: Partial<FitnessProfile>,
    meta?: { source?: string; reason?: string }
  ): Promise<FitnessProfile> {
    // Get current profile
    const current = await this.getProfile(userId);
    
    // Deep merge patch into current
    const merged = this.deepMerge(current, patch);
    
    // Update database
    await this.db
      .updateTable('fitnessProfiles')
      .set({
        profile: JSON.stringify(merged),
        updatedAt: new Date(),
      })
      .where('userId', '=', userId)
      .execute();
    
    // Record in ledger
    if (meta) {
      await this.recordUpdate(userId, patch, null, meta.source || 'api', meta.reason);
    }
    
    return merged as FitnessProfile;
  }

  /**
   * Create or update profile
   */
  async upsertProfile(
    userId: string,
    profile: Partial<FitnessProfile>,
    legacyFields?: {
      age?: number;
      gender?: string;
      skillLevel?: string;
      fitnessGoals?: string;
      exerciseFrequency?: string;
    }
  ): Promise<void> {
    const existing = await this.getByUserId(userId);
    
    if (existing) {
      // Update existing profile
      await this.db
        .updateTable('fitnessProfiles')
        .set({
          profile: JSON.stringify(profile),
          ...(legacyFields || {}),
          updatedAt: new Date(),
        })
        .where('userId', '=', userId)
        .execute();
    } else {
      // Create new profile
      await this.db
        .insertInto('fitnessProfiles')
        .values({
          userId,
          profile: JSON.stringify(profile),
          age: legacyFields?.age || 0,
          gender: legacyFields?.gender || '',
          skillLevel: legacyFields?.skillLevel || '',
          fitnessGoals: legacyFields?.fitnessGoals || '',
          exerciseFrequency: legacyFields?.exerciseFrequency || '',
        })
        .execute();
    }
  }

  /**
   * Record update in ledger
   */
  private async recordUpdate(
    userId: string,
    patch: unknown,
    path: string | null,
    source: string,
    reason?: string
  ): Promise<void> {
    await this.db
      .insertInto('profileUpdates')
      .values({
        userId,
        patch: JSON.stringify(patch),
        path,
        source,
        reason,
        createdAt: new Date(),
      })
      .execute();
  }

  /**
   * Get profile update history
   */
  async getUpdateHistory(userId: string, limit = 50): Promise<unknown[]> {
    const updates = await this.db
      .selectFrom('profileUpdates')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .execute();
    
    return updates.map(u => ({
      ...u,
      patch: typeof u.patch === 'string' ? JSON.parse(u.patch) : u.patch,
    }));
  }

  /**
   * Deep merge helper
   */
  private deepMerge(target: unknown, source: unknown): unknown {
    if (typeof target !== 'object' || target === null) {
      return source;
    }
    if (typeof source !== 'object' || source === null) {
      return target;
    }
    
    const result = { ...(target as Record<string, unknown>) };
    
    const sourceObj = source as Record<string, unknown>;
    for (const key in sourceObj) {
      if (sourceObj[key] === null || sourceObj[key] === undefined) {
        continue;
      }
      
      if (typeof sourceObj[key] === 'object' && !Array.isArray(sourceObj[key])) {
        // Nested object - recurse
        result[key] = this.deepMerge(result[key] || {}, sourceObj[key]);
      } else {
        // Primitive or array - replace
        result[key] = sourceObj[key];
      }
    }
    
    return result;
  }

  /**
   * Parse exercise frequency to days per week
   */
  private parseFrequency(frequency: string): number {
    switch (frequency.toLowerCase()) {
      case 'daily':
        return 7;
      case '5-6 times a week':
        return 6;
      case '3-4 times a week':
        return 4;
      case '1-2 times a week':
        return 2;
      default:
        return 3;
    }
  }
}