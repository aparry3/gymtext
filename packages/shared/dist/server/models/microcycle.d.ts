import { Microcycles } from '@/server/models/_types';
export * from '@/shared/types/microcycle';
import type { MicrocycleStructure } from '@/shared/types/microcycle';
/**
 * Simplified Microcycle interface
 *
 * Changes from previous version:
 * - Uses `days` array instead of 7 separate day columns
 * - Uses `absoluteWeek` instead of mesocycleIndex + weekNumber
 * - No mesocycle dependency
 */
export interface Microcycle {
    id: string;
    clientId: string;
    absoluteWeek: number;
    days: string[];
    description?: string | null;
    isDeload: boolean;
    message?: string | null;
    structured?: MicrocycleStructure | null;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class MicrocycleModel {
    static fromDB(row: Microcycles): Microcycle;
    static toDB(microcycle: Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>): Omit<Microcycles, 'id' | 'createdAt' | 'updatedAt'>;
}
//# sourceMappingURL=microcycle.d.ts.map