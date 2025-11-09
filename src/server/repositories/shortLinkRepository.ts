import { BaseRepository } from './baseRepository';
import { ShortLink, NewShortLink } from '../models/shortLink';
import { sql } from 'kysely';

/**
 * Repository for managing short links
 * Handles storage, retrieval, and cleanup of short link mappings
 */
export class ShortLinkRepository extends BaseRepository {
  /**
   * Generate a random 5-character alphanumeric code
   * Uses uppercase, lowercase, and numbers (62 possible characters)
   */
  generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new short link
   * Uses upsert strategy: if code already exists, overwrites with new link
   */
  async createShortLink(link: NewShortLink): Promise<ShortLink> {
    const result = await this.db
      .insertInto('shortLinks')
      .values({
        code: link.code,
        targetPath: link.targetPath,
        userId: link.userId,
        expiresAt: link.expiresAt,
        createdAt: new Date(),
        accessCount: 0,
      })
      .onConflict((oc) =>
        oc.column('code').doUpdateSet({
          targetPath: link.targetPath,
          userId: link.userId,
          expiresAt: link.expiresAt,
          createdAt: new Date(),
          accessCount: 0,
          lastAccessedAt: null,
        })
      )
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  /**
   * Find a short link by code
   * Returns the link if found, null otherwise
   */
  async findByCode(code: string): Promise<ShortLink | null> {
    const result = await this.db
      .selectFrom('shortLinks')
      .selectAll()
      .where('code', '=', code)
      .executeTakeFirst();

    return result || null;
  }

  /**
   * Increment access count and update last accessed time
   * Called when a short link is resolved
   */
  async incrementAccessCount(id: string): Promise<void> {
    await this.db
      .updateTable('shortLinks')
      .set({
        accessCount: sql`access_count + 1`,
        lastAccessedAt: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  /**
   * Delete expired short links
   * Should be run periodically to clean up the database
   */
  async deleteExpiredLinks(): Promise<number> {
    const result = await this.db
      .deleteFrom('shortLinks')
      .where('expiresAt', '<', new Date())
      .where('expiresAt', 'is not', null)
      .executeTakeFirst();

    return Number(result.numDeletedRows || 0);
  }

  /**
   * Delete all short links for a user
   * Useful for cleanup when a user is deleted
   */
  async deleteByUserId(userId: string): Promise<number> {
    const result = await this.db
      .deleteFrom('shortLinks')
      .where('userId', '=', userId)
      .executeTakeFirst();

    return Number(result.numDeletedRows || 0);
  }

  /**
   * Find all short links for a user
   * Useful for admin views or user dashboards
   */
  async findByUserId(userId: string): Promise<ShortLink[]> {
    return await this.db
      .selectFrom('shortLinks')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('createdAt', 'desc')
      .execute();
  }
}
