import type { Insertable, Selectable, Updateable } from 'kysely';
import type { ProgramEnrollments } from './_types';

export type ProgramEnrollmentDB = Selectable<ProgramEnrollments>;
export type NewProgramEnrollment = Insertable<ProgramEnrollments>;
export type ProgramEnrollmentUpdate = Updateable<ProgramEnrollments>;

export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface ProgramEnrollment {
  id: string;
  clientId: string;
  programId: string;
  /** The program version the user is enrolled in */
  programVersionId: string | null;
  cohortId: string | null;
  cohortStartDate: Date | null;
  startDate: Date;
  currentWeek: number;
  status: EnrollmentStatus;
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ProgramEnrollmentModel {
  static fromDB(row: ProgramEnrollmentDB): ProgramEnrollment {
    return {
      id: row.id,
      clientId: row.clientId,
      programId: row.programId,
      programVersionId: row.programVersionId,
      cohortId: row.cohortId,
      cohortStartDate: row.cohortStartDate ? new Date(row.cohortStartDate as unknown as string | number | Date) : null,
      startDate: new Date(row.startDate as unknown as string | number | Date),
      currentWeek: row.currentWeek,
      status: row.status as EnrollmentStatus,
      enrolledAt: new Date(row.enrolledAt as unknown as string | number | Date),
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
      updatedAt: new Date(row.updatedAt as unknown as string | number | Date),
    };
  }
}
