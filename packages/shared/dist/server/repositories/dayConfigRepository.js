import { BaseRepository } from './baseRepository';
/**
 * Repository for managing day configurations
 * Handles storage and retrieval of day-specific settings
 */
export class DayConfigRepository extends BaseRepository {
    /**
     * Get config for a specific date (global scope)
     */
    async getByDate(date) {
        const result = await this.db
            .selectFrom('dayConfigs')
            .selectAll()
            .where('date', '=', date)
            .where('scopeType', '=', 'global')
            .where('scopeId', 'is', null)
            .executeTakeFirst();
        if (!result)
            return null;
        return {
            ...result,
            config: (result.config || {}),
        };
    }
    /**
     * Get configs for a date range (for calendar view)
     */
    async getByDateRange(startDate, endDate) {
        const results = await this.db
            .selectFrom('dayConfigs')
            .selectAll()
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .where('scopeType', '=', 'global')
            .where('scopeId', 'is', null)
            .orderBy('date', 'asc')
            .execute();
        return results.map((result) => ({
            ...result,
            config: (result.config || {}),
        }));
    }
    /**
     * Create a new day config
     */
    async create(data) {
        const result = await this.db
            .insertInto('dayConfigs')
            .values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }
    /**
     * Update an existing day config
     */
    async update(id, data) {
        const result = await this.db
            .updateTable('dayConfigs')
            .set({
            ...data,
            updatedAt: new Date(),
        })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }
    /**
     * Upsert a day config (create or update)
     * For global scope, merges config with existing if present
     */
    async upsert(date, config, scopeType = 'global', scopeId = null) {
        // Check if exists
        const existing = await this.db
            .selectFrom('dayConfigs')
            .selectAll()
            .where('date', '=', date)
            .where('scopeType', '=', scopeType)
            .where('scopeId', scopeId === null ? 'is' : '=', scopeId)
            .executeTakeFirst();
        if (existing) {
            // Merge config with existing
            const existingConfig = (existing.config || {});
            const mergedConfig = { ...existingConfig, ...config };
            const result = await this.db
                .updateTable('dayConfigs')
                .set({
                config: JSON.stringify(mergedConfig),
                updatedAt: new Date(),
            })
                .where('id', '=', existing.id)
                .returningAll()
                .executeTakeFirstOrThrow();
            return {
                ...result,
                config: mergedConfig,
            };
        }
        // Create new
        const result = await this.db
            .insertInto('dayConfigs')
            .values({
            date,
            scopeType,
            scopeId,
            config: JSON.stringify(config),
            createdAt: new Date(),
            updatedAt: new Date(),
        })
            .returningAll()
            .executeTakeFirstOrThrow();
        return {
            ...result,
            config: config,
        };
    }
    /**
     * Delete config for a date
     */
    async deleteByDate(date, scopeType = 'global', scopeId = null) {
        await this.db
            .deleteFrom('dayConfigs')
            .where('date', '=', date)
            .where('scopeType', '=', scopeType)
            .where('scopeId', scopeId === null ? 'is' : '=', scopeId)
            .execute();
    }
    /**
     * Delete config by ID
     */
    async deleteById(id) {
        await this.db.deleteFrom('dayConfigs').where('id', '=', id).execute();
    }
}
