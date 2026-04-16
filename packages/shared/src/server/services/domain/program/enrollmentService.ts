import type { RepositoryContainer } from '../../../repositories/factory';
import type { ProgramEnrollment, NewProgramEnrollment, EnrollmentStatus } from '../../../models/programEnrollment';
import type { FitnessPlan } from '../../../models/fitnessPlan';
import type { ProgramVersion } from '../../../models/programVersion';

/**
 * Result of getEnrollmentWithProgramVersion
 */
export interface EnrollmentWithProgramVersion {
  enrollment: ProgramEnrollment;
  programVersion: ProgramVersion | null;
  currentPlanInstance: FitnessPlan | null;
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
   * Get enrollment with its latest published program version and current plan instance
   */
  getEnrollmentWithProgramVersion(clientId: string): Promise<EnrollmentWithProgramVersion | null>;

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

  /**
   * List all enrollments for a program
   */
  listByProgram(programId: string): Promise<ProgramEnrollment[]>;

  /**
   * Update enrollment status
   */
  updateStatus(enrollmentId: string, status: EnrollmentStatus): Promise<ProgramEnrollment | null>;

  /**
   * Generic update for enrollment fields
   */
  update(enrollmentId: string, data: Partial<ProgramEnrollment>): Promise<ProgramEnrollment | null>;
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

    async getEnrollmentWithProgramVersion(clientId: string): Promise<EnrollmentWithProgramVersion | null> {
      const enrollment = await repos.programEnrollment.findActiveByClientId(clientId);
      if (!enrollment) {
        return null;
      }

      const programVersion: ProgramVersion | null = await repos.programVersion.findLatestPublished(enrollment.programId);

      // Get the current plan instance for this user
      const currentPlanInstance = await repos.fitnessPlan.getLatest(clientId);

      return { enrollment, programVersion, currentPlanInstance };
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

    async listByProgram(programId: string): Promise<ProgramEnrollment[]> {
      return repos.programEnrollment.findByProgramId(programId);
    },

    async updateStatus(enrollmentId: string, status: EnrollmentStatus): Promise<ProgramEnrollment | null> {
      return repos.programEnrollment.updateStatus(enrollmentId, status);
    },

    async update(enrollmentId: string, data: Partial<ProgramEnrollment>): Promise<ProgramEnrollment | null> {
      return repos.programEnrollment.update(enrollmentId, data);
    },
  };
}
