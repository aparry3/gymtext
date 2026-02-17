import { Microcycles } from '@/server/models/_types';

// Re-export schema types from shared (used by downstream consumers)
export * from '@/shared/types/microcycle';

export interface Microcycle {
  id: string;
  clientId: string;
  planId?: string | null;
  content?: string | null;
  startDate: Date;
  createdAt: Date;
}

export class MicrocycleModel {
  static fromDB(row: Microcycles): Microcycle {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbRow = row as any;
    return {
      id: row.id as unknown as string,
      clientId: row.clientId as unknown as string,
      planId: dbRow.planId ?? null,
      content: dbRow.content ?? null,
      startDate: new Date(row.startDate as unknown as string | number | Date),
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
    };
  }
}
