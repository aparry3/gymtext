import { Microcycles } from '@/server/models/_types';
import { MicrocyclePattern } from './schema';

// Re-export types
export type { MicrocyclePattern, UpdatedMicrocyclePattern } from './schema';

export interface Microcycle {
  id: string;
  userId: string;
  fitnessPlanId: string;
  mesocycleIndex: number;
  weekNumber: number;
  pattern: MicrocyclePattern;
  description?: string | null; // Long-form narrative description of the weekly microcycle
  reasoning?: string | null; // Explanation of how and why the week is structured
  message?: string | null; // SMS-formatted weekly check-in/breakdown message
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
      userId: row.userId as unknown as string,
      fitnessPlanId: row.fitnessPlanId as unknown as string,
      mesocycleIndex: row.mesocycleIndex,
      weekNumber: row.weekNumber,
      pattern: typeof row.pattern === 'string'
        ? JSON.parse(row.pattern)
        : row.pattern as unknown as MicrocyclePattern,
      description: (row.description as unknown as string | null) ?? null,
      reasoning: (row.reasoning as unknown as string | null) ?? null,
      message: (row.message as unknown as string | null) ?? null,
      startDate: new Date(row.startDate as unknown as string | number | Date),
      endDate: new Date(row.endDate as unknown as string | number | Date),
      isActive: (row.isActive as unknown as boolean) ?? true,
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
      updatedAt: new Date(row.updatedAt as unknown as string | number | Date),
    };
  }

  static toDB(microcycle: Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>): Omit<Microcycles, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      userId: microcycle.userId,
      fitnessPlanId: microcycle.fitnessPlanId,
      mesocycleIndex: microcycle.mesocycleIndex,
      weekNumber: microcycle.weekNumber,
      pattern: JSON.stringify(microcycle.pattern),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      description: microcycle.description as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reasoning: microcycle.reasoning as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: microcycle.message as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startDate: microcycle.startDate as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      endDate: microcycle.endDate as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isActive: microcycle.isActive as any,
    };
  }
}