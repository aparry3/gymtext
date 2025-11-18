import { Mesocycles } from '@/server/models/_types';
import { Insertable, Selectable, Updateable } from 'kysely';

export type MesocycleDB = Selectable<Mesocycles>;
export type NewMesocycle = Insertable<Mesocycles>;
export type MesocycleUpdate = Updateable<Mesocycles>;

/**
 * Mesocycle type for application use
 */
export interface Mesocycle {
  id: string;
  userId: string;
  fitnessPlanId: string;
  mesocycleIndex: number;
  description: string | null;
  microcycles: string[];
  formatted: string | null;
  startWeek: number;
  durationWeeks: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mesocycle model with database conversion methods
 */
export class MesocycleModel {
  /**
   * Convert database row to Mesocycle type
   */
  static fromDB(row: MesocycleDB): Mesocycle {
    return {
      id: row.id as unknown as string,
      userId: row.userId as unknown as string,
      fitnessPlanId: row.fitnessPlanId as unknown as string,
      mesocycleIndex: row.mesocycleIndex,
      description: (row.description as unknown as string | null) ?? null,
      microcycles: (row.microcycles as unknown as string[]) ?? [],
      formatted: (row.formatted as unknown as string | null) ?? null,
      startWeek: row.startWeek,
      durationWeeks: row.durationWeeks,
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
      updatedAt: new Date(row.updatedAt as unknown as string | number | Date),
    };
  }

  /**
   * Convert Mesocycle type to database format
   */
  static toDB(mesocycle: Omit<Mesocycle, 'id' | 'createdAt' | 'updatedAt'>): Omit<MesocycleDB, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      userId: mesocycle.userId,
      fitnessPlanId: mesocycle.fitnessPlanId,
      mesocycleIndex: mesocycle.mesocycleIndex,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      description: mesocycle.description as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      microcycles: mesocycle.microcycles as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatted: mesocycle.formatted as any,
      startWeek: mesocycle.startWeek,
      durationWeeks: mesocycle.durationWeeks,
    };
  }
}
