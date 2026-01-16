import type { RepositoryContainer } from '../../../repositories/factory';
import type { ProgramEnrollment, NewProgramEnrollment, EnrollmentStatus } from '../../../models/programEnrollment';
import type { FitnessPlan } from '../../../models/fitnessPlan';
import type { ProgramVersion } from '../../../models/programVersion';

/**
 * Result of getEnrollmentWithVersion
 * @deprecated Use getEnrollmentWithProgramVersion instead
 */
export interface EnrollmentWithVersion {
  enrollment: ProgramEnrollment;
  version: FitnessPlan | null;
}

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
      programVersionId?: string;
    }
  ): Promise<ProgramEnrollment>;

  /**
   * Get the active enrollment for a client
   */
  getActiveEnrollment(clientId: string): Promise<ProgramEnrollment | null>;

  /**
   * Get enrollment with its linked fitness plan version
   * @deprecated Use getEnrollmentWithProgramVersion instead
   */
  getEnrollmentWithVersion(clientId: string): Promise<EnrollmentWithVersion | null>;

  /**
   * Get enrollment with its program version and current plan instance
   */
  getEnrollmentWithProgramVersion(clientId: string): Promise<EnrollmentWithProgramVersion | null>;

  /**
   * Link a fitness plan version to an enrollment
   * @deprecated Use linkProgramVersion instead
   */
  linkVersion(enrollmentId: string, versionId: string): Promise<ProgramEnrollment | null>;

  /**
   * Link a program version to an enrollment
   */
  linkProgramVersion(enrollmentId: string, programVersionId: string): Promise<ProgramEnrollment | null>;

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
   * Get all enrollments for a program version
   */
  getByProgramVersionId(programVersionId: string): Promise<ProgramEnrollment[]>;

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
   * Count active enrollments for a program version
   */
  countActiveEnrollmentsByVersion(programVersionId: string): Promise<number>;

  /**
   * Count unique fitness plan versions for a program
   * @deprecated Use countActiveEnrollmentsByVersion instead
   */
  countVersions(programId: string): Promise<number>;

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
        programVersionId: options.programVersionId ?? null,
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

    async getEnrollmentWithProgramVersion(clientId: string): Promise<EnrollmentWithProgramVersion | null> {
      const enrollment = await repos.programEnrollment.findActiveByClientId(clientId);
      if (!enrollment) {
        return null;
      }

      let programVersion: ProgramVersion | null = null;
      if (enrollment.programVersionId) {
        programVersion = await repos.programVersion.findById(enrollment.programVersionId);
      }

      // Get the current plan instance for this user
      const currentPlanInstance = await repos.fitnessPlan.getCurrentPlan(clientId);

      return { enrollment, programVersion, currentPlanInstance };
    },

    async linkVersion(enrollmentId: string, versionId: string): Promise<ProgramEnrollment | null> {
      return repos.programEnrollment.updateVersionId(enrollmentId, versionId);
    },

    async linkProgramVersion(enrollmentId: string, programVersionId: string): Promise<ProgramEnrollment | null> {
      return repos.programEnrollment.updateProgramVersionId(enrollmentId, programVersionId);
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

    async getByProgramVersionId(programVersionId: string): Promise<ProgramEnrollment[]> {
      return repos.programEnrollment.findByProgramVersionId(programVersionId);
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

    async countActiveEnrollmentsByVersion(programVersionId: string): Promise<number> {
      return repos.programEnrollment.countActiveByProgramVersionId(programVersionId);
    },

    async countVersions(programId: string): Promise<number> {
      return repos.programEnrollment.countVersionsByProgramId(programId);
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
