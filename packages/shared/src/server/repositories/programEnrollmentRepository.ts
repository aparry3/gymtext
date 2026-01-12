import { BaseRepository } from '@/server/repositories/baseRepository';
import {
  ProgramEnrollmentModel,
  type ProgramEnrollment,
  type NewProgramEnrollment,
  type ProgramEnrollmentUpdate,
  type EnrollmentStatus,
} from '@/server/models/programEnrollment';

/**
 * Repository for program enrollment database operations
 */
export class ProgramEnrollmentRepository extends BaseRepository {
  /**
   * Create a new enrollment
   */
  async create(data: NewProgramEnrollment): Promise<ProgramEnrollment> {
    const result = await this.db
      .insertInto('programEnrollments')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return ProgramEnrollmentModel.fromDB(result);
  }

  /**
   * Find an enrollment by ID
   */
  async findById(id: string): Promise<ProgramEnrollment | null> {
    const result = await this.db
      .selectFrom('programEnrollments')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? ProgramEnrollmentModel.fromDB(result) : null;
  }

  /**
   * Find the active enrollment for a client
   * Returns the first active enrollment (most users will have only one)
   */
  async findActiveByClientId(clientId: string): Promise<ProgramEnrollment | null> {
    const result = await this.db
      .selectFrom('programEnrollments')
      .selectAll()
      .where('clientId', '=', clientId)
      .where('status', '=', 'active')
      .executeTakeFirst();

    return result ? ProgramEnrollmentModel.fromDB(result) : null;
  }

  /**
   * Find an enrollment by client and program
   */
  async findByClientAndProgram(clientId: string, programId: string): Promise<ProgramEnrollment | null> {
    const result = await this.db
      .selectFrom('programEnrollments')
      .selectAll()
      .where('clientId', '=', clientId)
      .where('programId', '=', programId)
      .executeTakeFirst();

    return result ? ProgramEnrollmentModel.fromDB(result) : null;
  }

  /**
   * Find all enrollments for a program
   * Optionally filter by status
   */
  async findByProgramId(programId: string, status?: EnrollmentStatus): Promise<ProgramEnrollment[]> {
    let query = this.db
      .selectFrom('programEnrollments')
      .selectAll()
      .where('programId', '=', programId);

    if (status) {
      query = query.where('status', '=', status);
    }

    const results = await query.orderBy('enrolledAt', 'desc').execute();
    return results.map(ProgramEnrollmentModel.fromDB);
  }

  /**
   * Find all enrollments in a cohort
   */
  async findByCohort(programId: string, cohortId: string): Promise<ProgramEnrollment[]> {
    const results = await this.db
      .selectFrom('programEnrollments')
      .selectAll()
      .where('programId', '=', programId)
      .where('cohortId', '=', cohortId)
      .orderBy('enrolledAt', 'asc')
      .execute();

    return results.map(ProgramEnrollmentModel.fromDB);
  }

  /**
   * Find all enrollments for a client
   */
  async findByClientId(clientId: string): Promise<ProgramEnrollment[]> {
    const results = await this.db
      .selectFrom('programEnrollments')
      .selectAll()
      .where('clientId', '=', clientId)
      .orderBy('enrolledAt', 'desc')
      .execute();

    return results.map(ProgramEnrollmentModel.fromDB);
  }

  /**
   * Update an enrollment
   */
  async update(id: string, data: ProgramEnrollmentUpdate): Promise<ProgramEnrollment | null> {
    const result = await this.db
      .updateTable('programEnrollments')
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? ProgramEnrollmentModel.fromDB(result) : null;
  }

  /**
   * Update the version ID for an enrollment
   * Used to link an enrollment to a specific fitness plan version
   */
  async updateVersionId(id: string, versionId: string): Promise<ProgramEnrollment | null> {
    return this.update(id, { versionId });
  }

  /**
   * Update the current week for an enrollment
   */
  async updateCurrentWeek(id: string, currentWeek: number): Promise<ProgramEnrollment | null> {
    return this.update(id, { currentWeek });
  }

  /**
   * Cancel an enrollment
   */
  async cancel(id: string): Promise<ProgramEnrollment | null> {
    return this.update(id, { status: 'cancelled' });
  }

  /**
   * Pause an enrollment
   */
  async pause(id: string): Promise<ProgramEnrollment | null> {
    return this.update(id, { status: 'paused' });
  }

  /**
   * Resume a paused enrollment
   */
  async resume(id: string): Promise<ProgramEnrollment | null> {
    return this.update(id, { status: 'active' });
  }

  /**
   * Count active enrollments for a program
   */
  async countActiveByProgramId(programId: string): Promise<number> {
    const result = await this.db
      .selectFrom('programEnrollments')
      .select((eb) => eb.fn.count('id').as('count'))
      .where('programId', '=', programId)
      .where('status', '=', 'active')
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }
}
