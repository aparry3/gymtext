import { BaseRepository } from './baseRepository';
export class ProfileUpdateRepository extends BaseRepository {
    /**
     * Create a new profile update audit record
     */
    async create(update) {
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
    async getClientUpdates(clientId, limit = 10) {
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
    async getRecentUpdates(limit = 50) {
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
    async getUpdatesBySource(source, limit = 50) {
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
    async countClientUpdates(clientId) {
        const result = await this.db
            .selectFrom('profileUpdates')
            .where('clientId', '=', clientId)
            .select(this.db.fn.count('id').as('count'))
            .executeTakeFirstOrThrow();
        return Number(result.count);
    }
}
