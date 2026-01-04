import { v4 as uuidv4 } from 'uuid';
import { MicrocycleModel } from '@/server/models/microcycle';
/**
 * Repository for microcycle database operations
 *
 * Microcycles now use:
 * - absoluteWeek: Week number from plan start (1-indexed)
 * - days: Ordered array of day descriptions
 * - No mesocycleIndex or weekNumber
 */
export class MicrocycleRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async createMicrocycle(microcycle) {
        const result = await this.db
            .insertInto('microcycles')
            .values({
            id: uuidv4(),
            clientId: microcycle.clientId,
            absoluteWeek: microcycle.absoluteWeek,
            days: microcycle.days,
            description: microcycle.description,
            isDeload: microcycle.isDeload,
            message: microcycle.message,
            structured: microcycle.structured ? JSON.stringify(microcycle.structured) : null,
            startDate: microcycle.startDate,
            endDate: microcycle.endDate,
            isActive: microcycle.isActive,
        })
            .returningAll()
            .executeTakeFirstOrThrow();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return MicrocycleModel.fromDB(result);
    }
    async getActiveMicrocycle(clientId) {
        const result = await this.db
            .selectFrom('microcycles')
            .selectAll()
            .where('clientId', '=', clientId)
            .where('isActive', '=', true)
            .orderBy('createdAt', 'desc')
            .executeTakeFirst();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result ? MicrocycleModel.fromDB(result) : null;
    }
    /**
     * Get microcycle by absolute week number
     * Queries by clientId + absoluteWeek only (not fitnessPlanId)
     * Returns most recently updated if duplicates exist
     */
    async getMicrocycleByAbsoluteWeek(clientId, absoluteWeek) {
        const result = await this.db
            .selectFrom('microcycles')
            .selectAll()
            .where('clientId', '=', clientId)
            .where('absoluteWeek', '=', absoluteWeek)
            .orderBy('updatedAt', 'desc')
            .executeTakeFirst();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result ? MicrocycleModel.fromDB(result) : null;
    }
    async deactivatePreviousMicrocycles(clientId) {
        await this.db
            .updateTable('microcycles')
            .set({ isActive: false })
            .where('clientId', '=', clientId)
            .where('isActive', '=', true)
            .execute();
    }
    async updateMicrocycle(id, updates) {
        const updateData = {};
        if (updates.days !== undefined) {
            updateData.days = updates.days;
        }
        if (updates.description !== undefined) {
            updateData.description = updates.description;
        }
        if (updates.isDeload !== undefined) {
            updateData.isDeload = updates.isDeload;
        }
        if (updates.message !== undefined) {
            updateData.message = updates.message;
        }
        if (updates.structured !== undefined) {
            updateData.structured = updates.structured ? JSON.stringify(updates.structured) : null;
        }
        if (updates.isActive !== undefined) {
            updateData.isActive = updates.isActive;
        }
        if (updates.startDate !== undefined) {
            updateData.startDate = updates.startDate;
        }
        if (updates.endDate !== undefined) {
            updateData.endDate = updates.endDate;
        }
        if (updates.absoluteWeek !== undefined) {
            updateData.absoluteWeek = updates.absoluteWeek;
        }
        if (Object.keys(updateData).length === 0) {
            // No updates to perform
            return this.getMicrocycleById(id);
        }
        const result = await this.db
            .updateTable('microcycles')
            .set({
            ...updateData,
            updatedAt: new Date(),
        })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result ? MicrocycleModel.fromDB(result) : null;
    }
    async getMicrocycleById(id) {
        const result = await this.db
            .selectFrom('microcycles')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result ? MicrocycleModel.fromDB(result) : null;
    }
    async getRecentMicrocycles(clientId, limit = 5) {
        const results = await this.db
            .selectFrom('microcycles')
            .selectAll()
            .where('clientId', '=', clientId)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .execute();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return results.map((r) => MicrocycleModel.fromDB(r));
    }
    async deleteMicrocycle(id) {
        const result = await this.db
            .deleteFrom('microcycles')
            .where('id', '=', id)
            .executeTakeFirst();
        return result.numDeletedRows > 0;
    }
    /**
     * Get all microcycles for a client ordered by absolute week
     */
    async getAllMicrocycles(clientId) {
        const results = await this.db
            .selectFrom('microcycles')
            .selectAll()
            .where('clientId', '=', clientId)
            .orderBy('absoluteWeek', 'asc')
            .execute();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return results.map((r) => MicrocycleModel.fromDB(r));
    }
    /**
     * Get microcycle for a specific date
     * Used for date-based progress tracking - finds the microcycle that contains the target date
     * Queries by clientId + date range only (not fitnessPlanId)
     * Returns most recently updated if duplicates exist
     */
    async getMicrocycleByDate(clientId, targetDate) {
        const result = await this.db
            .selectFrom('microcycles')
            .selectAll()
            .where('clientId', '=', clientId)
            .where('startDate', '<=', targetDate)
            .where('endDate', '>=', targetDate)
            .orderBy('updatedAt', 'desc')
            .executeTakeFirst();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result ? MicrocycleModel.fromDB(result) : null;
    }
}
