import type { RepositoryContainer } from '../../../repositories/factory';
import type { ProgramEnrollment, NewProgramEnrollment, EnrollmentStatus } from '../../../models/programEnrollment';
import type { FitnessPlan } from '../../../models/fitnessPlan';

/**
 * Result of getEnrollmentWithVersion
 */
export interface EnrollmentWithVersion {
  enrollment: ProgramEnrollment;
  version: FitnessPlan | null;
}

/**
 * Enrollment Service Instance Interface
 */
export interface EnrollmentServiceInstance {
  /**
   * Enroll a client in a program
   */
  enrollClient(
    clientId: string,
    programId: string,
    options?: {
      cohortId?: string;
      cohortStartDate?: Date;
      startDate?: Date;
    }
  ): Promise<ProgramEnrollment>;

  /**
   * Get the active enrollment for a client
   */
  getActiveEnrollment(clientId: string): Promise<ProgramEnrollment | null>;

  /**
   * Get enrollment with its linked fitness plan version
   */
  getEnrollmentWithVersion(clientId: string): Promise<EnrollmentWithVersion | null>;

  /**
   * Link a fitness plan version to an enrollment
   */
  linkVersion(enrollmentId: string, versionId: string): Promise<ProgramEnrollment | null>;

  /**
   * Update the current week for an enrollment
   */
  updateCurrentWeek(enrollmentId: string, week: number): Promise<ProgramEnrollment | null>;

  /**
   * Get enrollment by ID
   */
  getById(id: string): Promise<ProgramEnrollment | null>;

  /**
   * Get all enrollments for a client
   */
  getByClientId(clientId: string): Promise<ProgramEnrollment[]>;

  /**
   * Get all enrollments for a program
   */
  getByProgramId(programId: string, status?: EnrollmentStatus): Promise<ProgramEnrollment[]>;

  /**
   * Cancel an enrollment
   */
  cancelEnrollment(enrollmentId: string): Promise<ProgramEnrollment | null>;

  /**
   * Pause an enrollment
   */
  pauseEnrollment(enrollmentId: string): Promise<ProgramEnrollment | null>;

  /**
   * Resume a paused enrollment
   */
  resumeEnrollment(enrollmentId: string): Promise<ProgramEnrollment | null>;

  /**
   * Count active enrollments for a program
   */
  countActiveEnrollments(programId: string): Promise<number>;
}

/**
 * Create an EnrollmentService instance
 */
export function createEnrollmentService(
  repos: RepositoryContainer
): EnrollmentServiceInstance {
  return {
    async enrollClient(
      clientId: string,
      programId: string,
      options = {}
    ): Promise<ProgramEnrollment> {
      // Check for existing enrollment
      const existing = await repos.programEnrollment.findByClientAndProgram(clientId, programId);
      if (existing && existing.status === 'active') {
        throw new Error('Client is already enrolled in this program');
      }

      // If there's a cancelled/paused enrollment, we could reactivate it
      // For now, we create a new enrollment
      const enrollmentData: NewProgramEnrollment = {
        clientId,
        programId,
        cohortId: options.cohortId ?? null,
        cohortStartDate: options.cohortStartDate ?? null,
        startDate: options.startDate ?? new Date(),
        currentWeek: 1,
        status: 'active',
      };

      return repos.programEnrollment.create(enrollmentData);
    },

    async getActiveEnrollment(clientId: string): Promise<ProgramEnrollment | null> {
      return repos.programEnrollment.findActiveByClientId(clientId);
    },

    async getEnrollmentWithVersion(clientId: string): Promise<EnrollmentWithVersion | null> {
      const enrollment = await repos.programEnrollment.findActiveByClientId(clientId);
      if (!enrollment) {
        return null;
      }

      let version: FitnessPlan | null = null;
      if (enrollment.versionId) {
        version = await repos.fitnessPlan.getFitnessPlan(enrollment.versionId);
      }

      return { enrollment, version };
    },

    async linkVersion(enrollmentId: string, versionId: string): Promise<ProgramEnrollment | null> {
      return repos.programEnrollment.updateVersionId(enrollmentId, versionId);
    },

    async updateCurrentWeek(enrollmentId: string, week: number): Promise<ProgramEnrollment | null> {
      return repos.programEnrollment.updateCurrentWeek(enrollmentId, week);
    },

    async getById(id: string): Promise<ProgramEnrollment | null> {
      return repos.programEnrollment.findById(id);
    },

    async getByClientId(clientId: string): Promise<ProgramEnrollment[]> {
      return repos.programEnrollment.findByClientId(clientId);
    },

    async getByProgramId(programId: string, status?: EnrollmentStatus): Promise<ProgramEnrollment[]> {
      return repos.programEnrollment.findByProgramId(programId, status);
    },

    async cancelEnrollment(enrollmentId: string): Promise<ProgramEnrollment | null> {
      return repos.programEnrollment.cancel(enrollmentId);
    },

    async pauseEnrollment(enrollmentId: string): Promise<ProgramEnrollment | null> {
      return repos.programEnrollment.pause(enrollmentId);
    },

    async resumeEnrollment(enrollmentId: string): Promise<ProgramEnrollment | null> {
      return repos.programEnrollment.resume(enrollmentId);
    },

    async countActiveEnrollments(programId: string): Promise<number> {
      return repos.programEnrollment.countActiveByProgramId(programId);
    },
  };
}
