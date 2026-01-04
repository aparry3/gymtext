import { BaseRepository } from '@/server/repositories/baseRepository';
export class WorkoutInstanceRepository extends BaseRepository {
    /**
     * Create a new workout instance
     */
    async create(data) {
        // Ensure details and structured fields are properly serialized for JSONB columns
        const serializedData = {
            ...data,
            details: typeof data.details === 'string'
                ? data.details
                : JSON.stringify(data.details),
            structured: data.structured
                ? (typeof data.structured === 'string' ? data.structured : JSON.stringify(data.structured))
                : null
        };
        const result = await this.db
            .insertInto('workoutInstances')
            .values(serializedData)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }
    /**
     * Find workout instances for a client within a date range
     */
    async findByClientIdAndDateRange(clientId, startDate, endDate) {
        const results = await this.db
            .selectFrom('workoutInstances')
            .where('clientId', '=', clientId)
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .orderBy('date', 'asc')
            .selectAll()
            .execute();
        return results;
    }
    /**
     * Find a single workout instance by client ID and date
     */
    async findByClientIdAndDate(clientId, date) {
        // The incoming date is already midnight in the user's timezone (as a UTC timestamp)
        // We need to find workouts within the next 24 hours from that point
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
        const result = await this.db
            .selectFrom('workoutInstances')
            .where('clientId', '=', clientId)
            .where('date', '>=', startOfDay)
            .where('date', '<', endOfDay)
            .selectAll()
            .executeTakeFirst();
        return result;
    }
    /**
     * Get recent workouts for a user
     * @param userId The user's ID
     * @param limit Number of workouts to return (default 10)
     */
    async getRecentWorkouts(userId, limit = 10) {
        const results = await this.db
            .selectFrom('workoutInstances')
            .leftJoin('microcycles', 'workoutInstances.microcycleId', 'microcycles.id')
            .select([
            'workoutInstances.id',
            'workoutInstances.clientId',
            'workoutInstances.microcycleId',
            'workoutInstances.date',
            'workoutInstances.sessionType',
            'workoutInstances.goal',
            'workoutInstances.details',
            'workoutInstances.structured',
            'workoutInstances.description',
            'workoutInstances.message',
            'workoutInstances.completedAt',
            'workoutInstances.createdAt',
            'workoutInstances.updatedAt',
            'microcycles.absoluteWeek'
        ])
            .where('workoutInstances.clientId', '=', userId)
            .orderBy('workoutInstances.date', 'desc')
            .limit(limit)
            .execute();
        return results;
    }
    /**
     * Get recent workouts for a user by date range
     * @param userId The user's ID
     * @param days Number of days to look back
     */
    async getRecentWorkoutsByDays(userId, days = 7) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const results = await this.db
            .selectFrom('workoutInstances')
            .where('clientId', '=', userId)
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .orderBy('date', 'desc')
            .selectAll()
            .execute();
        return results;
    }
    /**
     * Get workout by specific date
     * @param userId The user's ID
     * @param date The specific date
     */
    async getWorkoutByDate(userId, date) {
        return this.findByClientIdAndDate(userId, date);
    }
    /**
     * Update workout instance
     * @param id The workout ID
     * @param data The update data
     */
    async update(id, data) {
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        if (data.details) {
            updateData.details = typeof data.details === 'string'
                ? data.details
                : JSON.stringify(data.details);
        }
        if (data.structured !== undefined) {
            updateData.structured = data.structured
                ? (typeof data.structured === 'string' ? data.structured : JSON.stringify(data.structured))
                : null;
        }
        const result = await this.db
            .updateTable('workoutInstances')
            .set(updateData)
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst();
        return result;
    }
    /**
     * Delete old workout instances (cleanup)
     * @param daysToKeep Number of days to keep
     */
    async deleteOldWorkouts(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await this.db
            .deleteFrom('workoutInstances')
            .where('date', '<', cutoffDate)
            .executeTakeFirst();
        return Number(result.numDeletedRows);
    }
    /**
     * Get a workout by its ID
     * @param workoutId The workout's ID
     */
    async getWorkoutById(workoutId) {
        const result = await this.db
            .selectFrom('workoutInstances')
            .selectAll()
            .where('id', '=', workoutId)
            .executeTakeFirst();
        return result;
    }
    /**
     * Get workouts by microcycle
     * @param userId The user's ID
     * @param microcycleId The microcycle ID
     */
    async getWorkoutsByMicrocycle(userId, microcycleId) {
        const results = await this.db
            .selectFrom('workoutInstances')
            .where('clientId', '=', userId)
            .where('microcycleId', '=', microcycleId)
            .orderBy('date', 'asc')
            .selectAll()
            .execute();
        return results;
    }
    /**
     * Get workouts by date range for microcycle week view
     * @param userId The user's ID
     * @param startDate Start date of the week
     * @param endDate End date of the week
     */
    async getWorkoutsByDateRange(userId, startDate, endDate) {
        const results = await this.db
            .selectFrom('workoutInstances')
            .leftJoin('microcycles', 'workoutInstances.microcycleId', 'microcycles.id')
            .select([
            'workoutInstances.id',
            'workoutInstances.clientId',
            'workoutInstances.microcycleId',
            'workoutInstances.date',
            'workoutInstances.sessionType',
            'workoutInstances.goal',
            'workoutInstances.details',
            'workoutInstances.structured',
            'workoutInstances.description',
            'workoutInstances.message',
            'workoutInstances.completedAt',
            'workoutInstances.createdAt',
            'workoutInstances.updatedAt',
            'microcycles.absoluteWeek'
        ])
            .where('workoutInstances.clientId', '=', userId)
            .where('workoutInstances.date', '>=', startDate)
            .where('workoutInstances.date', '<=', endDate)
            .orderBy('workoutInstances.date', 'asc')
            .execute();
        return results;
    }
    /**
     * Delete a workout instance by ID
     * @param workoutId The workout's ID
     */
    async delete(workoutId) {
        const result = await this.db
            .deleteFrom('workoutInstances')
            .where('id', '=', workoutId)
            .executeTakeFirst();
        return Number(result.numDeletedRows) > 0;
    }
    /**
     * Find which users already have workouts for their respective "today"
     * Used for catch-up logic to avoid sending duplicate daily messages
     * @param userDatePairs Array of user IDs with their timezone-specific date ranges
     * @returns Set of user IDs that already have workouts
     */
    async findUserIdsWithWorkoutsForUserDates(userDatePairs) {
        if (userDatePairs.length === 0) {
            return new Set();
        }
        // Build OR conditions for each user/date pair
        const results = await this.db
            .selectFrom('workoutInstances')
            .select('clientId')
            .where((eb) => {
            const conditions = userDatePairs.map(({ userId, startOfDay, endOfDay }) => eb.and([
                eb('clientId', '=', userId),
                eb('date', '>=', startOfDay),
                eb('date', '<', endOfDay)
            ]));
            return eb.or(conditions);
        })
            .execute();
        return new Set(results.map(r => r.clientId));
    }
}
