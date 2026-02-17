import type { FitnessPlans } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';

// Re-export schema types from shared (used by downstream consumers)
export * from '@/shared/types/plan';

export type FitnessPlanDB = Selectable<FitnessPlans>;
export type NewFitnessPlan = Insertable<FitnessPlans>;
export type FitnessPlanUpdate = Updateable<FitnessPlans>;

export interface FitnessPlan {
  id?: string;
  clientId: string;
  content?: string | null;
  description: string;
  startDate: Date;
  createdAt?: Date;
}

export class FitnessPlanModel {
  public static fromDB(row: FitnessPlanDB): FitnessPlan {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbRow = row as any;
    const clientId = row.clientId ?? dbRow.legacyClientId;
    if (!clientId) {
      throw new Error('FitnessPlan must have a clientId');
    }
    return {
      id: row.id,
      clientId,
      content: dbRow.content ?? null,
      description: row.description || '',
      startDate: new Date(row.startDate as unknown as string | number | Date),
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
    };
  }
}
