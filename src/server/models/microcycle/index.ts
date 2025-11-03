import { Microcycles } from '@/server/models/_types';
import { MicrocyclePattern } from './schema';


export interface Microcycle {
  id: string;
  userId: string;
  fitnessPlanId: string;
  mesocycleIndex: number;
  weekNumber: number;
  pattern: MicrocyclePattern;
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
      startDate: microcycle.startDate as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      endDate: microcycle.endDate as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isActive: microcycle.isActive as any,
    };
  }
}