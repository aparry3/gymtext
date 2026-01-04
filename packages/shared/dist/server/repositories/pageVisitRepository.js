import { BaseRepository } from './baseRepository';
export class PageVisitRepository extends BaseRepository {
    /**
     * Record a new page visit
     */
    async record(visit) {
        const result = await this.db
            .insertInto('pageVisits')
            .values(visit)
            .returningAll()
            .executeTakeFirstOrThrow();
        return result;
    }
    /**
     * Get visits within a date range
     */
    async getVisitsByDateRange(startDate, endDate, options) {
        let query = this.db
            .selectFrom('pageVisits')
            .selectAll()
            .where('createdAt', '>=', startDate)
            .where('createdAt', '<=', endDate)
            .orderBy('createdAt', 'desc');
        if (options?.source) {
            query = query.where('source', '=', options.source);
        }
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        return query.execute();
    }
    /**
     * Get aggregated visit counts by source
     */
    async getVisitCountsBySource(startDate, endDate) {
        const results = await this.db
            .selectFrom('pageVisits')
            .select(['source'])
            .select((eb) => eb.fn.count('id').as('count'))
            .where('createdAt', '>=', startDate)
            .where('createdAt', '<=', endDate)
            .groupBy('source')
            .orderBy('count', 'desc')
            .execute();
        return results.map((r) => ({
            source: r.source,
            count: Number(r.count),
        }));
    }
    /**
     * Get total visit count for a date range
     */
    async getTotalVisits(startDate, endDate) {
        const result = await this.db
            .selectFrom('pageVisits')
            .select((eb) => eb.fn.count('id').as('count'))
            .where('createdAt', '>=', startDate)
            .where('createdAt', '<=', endDate)
            .executeTakeFirst();
        return Number(result?.count ?? 0);
    }
}
