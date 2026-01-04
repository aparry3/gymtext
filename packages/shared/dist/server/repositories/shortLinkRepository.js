import { BaseRepository } from './baseRepository';
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
    generateUniqueCode() {
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
    async createShortLink(link) {
        const result = await this.db
            .insertInto('shortLinks')
            .values({
            code: link.code,
            targetPath: link.targetPath,
            clientId: link.clientId,
            expiresAt: link.expiresAt,
            createdAt: new Date(),
            accessCount: 0,
        })
            .onConflict((oc) => oc.column('code').doUpdateSet({
            targetPath: link.targetPath,
            clientId: link.clientId,
            expiresAt: link.expiresAt,
            createdAt: new Date(),
            accessCount: 0,
            lastAccessedAt: null,
        }))
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }
    /**
     * Find a short link by code
     * Returns the link if found, null otherwise
     */
    async findByCode(code) {
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
    async incrementAccessCount(id) {
        await this.db
            .updateTable('shortLinks')
            .set({
            accessCount: sql `access_count + 1`,
            lastAccessedAt: new Date(),
        })
            .where('id', '=', id)
            .execute();
    }
    /**
     * Delete expired short links
     * Should be run periodically to clean up the database
     */
    async deleteExpiredLinks() {
        const result = await this.db
            .deleteFrom('shortLinks')
            .where('expiresAt', '<', new Date())
            .where('expiresAt', 'is not', null)
            .executeTakeFirst();
        return Number(result.numDeletedRows || 0);
    }
    /**
     * Delete all short links for a client
     * Useful for cleanup when a client is deleted
     */
    async deleteByClientId(clientId) {
        const result = await this.db
            .deleteFrom('shortLinks')
            .where('clientId', '=', clientId)
            .executeTakeFirst();
        return Number(result.numDeletedRows || 0);
    }
    /**
     * Find all short links for a client
     * Useful for admin views or user dashboards
     */
    async findByClientId(clientId) {
        return await this.db
            .selectFrom('shortLinks')
            .selectAll()
            .where('clientId', '=', clientId)
            .orderBy('createdAt', 'desc')
            .execute();
    }
}
