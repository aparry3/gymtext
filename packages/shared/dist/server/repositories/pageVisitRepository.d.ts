import { BaseRepository } from './baseRepository';
import type { NewPageVisit, PageVisit } from '@/server/models/pageVisit';
export declare class PageVisitRepository extends BaseRepository {
    /**
     * Record a new page visit
     */
    record(visit: NewPageVisit): Promise<PageVisit>;
    /**
     * Get visits within a date range
     */
    getVisitsByDateRange(startDate: Date, endDate: Date, options?: {
        source?: string;
        limit?: number;
    }): Promise<PageVisit[]>;
    /**
     * Get aggregated visit counts by source
     */
    getVisitCountsBySource(startDate: Date, endDate: Date): Promise<{
        source: string | null;
        count: number;
    }[]>;
    /**
     * Get total visit count for a date range
     */
    getTotalVisits(startDate: Date, endDate: Date): Promise<number>;
}
//# sourceMappingURL=pageVisitRepository.d.ts.map