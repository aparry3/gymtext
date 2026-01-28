import type { Insertable, Selectable, Updateable } from 'kysely';
import type { Programs } from './_types';

export type ProgramDB = Selectable<Programs>;
export type NewProgram = Insertable<Programs>;
export type ProgramUpdate = Updateable<Programs>;

export type SchedulingMode = 'rolling_start' | 'cohort';
export type Cadence = 'calendar_days' | 'training_days_only';
export type LateJoinerPolicy = 'start_from_beginning' | 'join_current_week';
export type BillingModel = 'subscription' | 'one_time' | 'free';

export interface Program {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  schedulingMode: SchedulingMode;
  cadence: Cadence;
  lateJoinerPolicy: LateJoinerPolicy | null;
  billingModel: BillingModel | null;
  revenueSplitPercent: number | null;
  /** ID of the currently published version */
  publishedVersionId: string | null;
  /** ID of the cover image for this program */
  coverImageId: string | null;
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProgramModel {
  static fromDB(row: ProgramDB): Program {
    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      description: row.description,
      schedulingMode: row.schedulingMode as SchedulingMode,
      cadence: row.cadence as Cadence,
      lateJoinerPolicy: row.lateJoinerPolicy as LateJoinerPolicy | null,
      billingModel: row.billingModel as BillingModel | null,
      revenueSplitPercent: row.revenueSplitPercent,
      publishedVersionId: row.publishedVersionId,
      coverImageId: row.coverImageId ?? null,
      isActive: row.isActive,
      isPublic: row.isPublic,
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
      updatedAt: new Date(row.updatedAt as unknown as string | number | Date),
    };
  }
}
