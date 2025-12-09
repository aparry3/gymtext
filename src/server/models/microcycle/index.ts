import { Microcycles } from '@/server/models/_types';
import type { MicrocycleStructure } from '@/server/agents/training/schemas';

// Re-export schema types
export type { MicrocyclePattern, UpdatedMicrocyclePattern } from './schema';

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
  fitnessPlanId: string;
  absoluteWeek: number;  // Week from plan start (1-indexed)
  days: string[];        // Ordered array of day overviews [day1, day2, ..., day7]
  description?: string | null;
  isDeload: boolean;
  formatted?: string | null;
  message?: string | null;
  structured?: MicrocycleStructure | null;  // Parsed structured microcycle data
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MicrocycleModel {
  static fromDB(row: Microcycles): Microcycle {
    return {
      id: row.id as unknown as string,
      clientId: row.clientId as unknown as string,
      fitnessPlanId: row.fitnessPlanId as unknown as string,
      absoluteWeek: row.absoluteWeek as unknown as number,
      days: (row.days as unknown as string[] | null) ?? [],
      description: (row.description as unknown as string | null) ?? null,
      isDeload: (row.isDeload as unknown as boolean) ?? false,
      formatted: (row.formatted as unknown as string | null) ?? null,
      message: (row.message as unknown as string | null) ?? null,
      structured: row.structured as MicrocycleStructure | null,
      startDate: new Date(row.startDate as unknown as string | number | Date),
      endDate: new Date(row.endDate as unknown as string | number | Date),
      isActive: (row.isActive as unknown as boolean) ?? true,
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
      updatedAt: new Date(row.updatedAt as unknown as string | number | Date),
    };
  }

  static toDB(microcycle: Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>): Omit<Microcycles, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      clientId: microcycle.clientId,
      fitnessPlanId: microcycle.fitnessPlanId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      absoluteWeek: microcycle.absoluteWeek as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      days: microcycle.days as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      description: microcycle.description as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isDeload: microcycle.isDeload as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatted: microcycle.formatted as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: microcycle.message as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      structured: microcycle.structured as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startDate: microcycle.startDate as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      endDate: microcycle.endDate as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isActive: microcycle.isActive as any,
    };
  }
}
