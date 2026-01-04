import { Kysely } from 'kysely';
import { DB } from '@/server/models/_types';
import { Microcycle } from '@/server/models/microcycle';
/**
 * Repository for microcycle database operations
 *
 * Microcycles now use:
 * - absoluteWeek: Week number from plan start (1-indexed)
 * - days: Ordered array of day descriptions
 * - No mesocycleIndex or weekNumber
 */
export declare class MicrocycleRepository {
    private db;
    constructor(db: Kysely<DB>);
    createMicrocycle(microcycle: Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Microcycle>;
    getActiveMicrocycle(clientId: string): Promise<Microcycle | null>;
    /**
     * Get microcycle by absolute week number
     * Queries by clientId + absoluteWeek only (not fitnessPlanId)
     * Returns most recently updated if duplicates exist
     */
    getMicrocycleByAbsoluteWeek(clientId: string, absoluteWeek: number): Promise<Microcycle | null>;
    deactivatePreviousMicrocycles(clientId: string): Promise<void>;
    updateMicrocycle(id: string, updates: Partial<Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Microcycle | null>;
    getMicrocycleById(id: string): Promise<Microcycle | null>;
    getRecentMicrocycles(clientId: string, limit?: number): Promise<Microcycle[]>;
    deleteMicrocycle(id: string): Promise<boolean>;
    /**
     * Get all microcycles for a client ordered by absolute week
     */
    getAllMicrocycles(clientId: string): Promise<Microcycle[]>;
    /**
     * Get microcycle for a specific date
     * Used for date-based progress tracking - finds the microcycle that contains the target date
     * Queries by clientId + date range only (not fitnessPlanId)
     * Returns most recently updated if duplicates exist
     */
    getMicrocycleByDate(clientId: string, targetDate: Date): Promise<Microcycle | null>;
}
//# sourceMappingURL=microcycleRepository.d.ts.map