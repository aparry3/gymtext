import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEnrollmentService } from '../domain/program/enrollmentService';
import type { EnrollmentServiceInstance } from '../domain/program/enrollmentService';

function makeEnrollment(overrides: Record<string, any> = {}) {
  return {
    id: 'enr-1',
    clientId: 'user-1',
    programId: 'prog-1',
    programVersionId: null,
    cohortId: null,
    cohortStartDate: null,
    startDate: new Date('2026-03-01'),
    currentWeek: 1,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    programEnrollment: {
      findByClientAndProgram: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(makeEnrollment()),
      findActiveByClientId: vi.fn().mockResolvedValue(makeEnrollment()),
      findById: vi.fn().mockResolvedValue(makeEnrollment()),
      findByClientId: vi.fn().mockResolvedValue([makeEnrollment()]),
      findByProgramId: vi.fn().mockResolvedValue([makeEnrollment()]),
      findByProgramVersionId: vi.fn().mockResolvedValue([makeEnrollment()]),
      updateProgramVersionId: vi.fn().mockResolvedValue(makeEnrollment({ programVersionId: 'pv-1' })),
      updateCurrentWeek: vi.fn().mockResolvedValue(makeEnrollment({ currentWeek: 3 })),
      cancel: vi.fn().mockResolvedValue(makeEnrollment({ status: 'cancelled' })),
      pause: vi.fn().mockResolvedValue(makeEnrollment({ status: 'paused' })),
      resume: vi.fn().mockResolvedValue(makeEnrollment({ status: 'active' })),
      countActiveByProgramId: vi.fn().mockResolvedValue(42),
      countActiveByProgramVersionId: vi.fn().mockResolvedValue(15),
      updateStatus: vi.fn().mockResolvedValue(makeEnrollment({ status: 'completed' })),
      update: vi.fn().mockResolvedValue(makeEnrollment({ currentWeek: 5 })),
    },
    programVersion: {
      findById: vi.fn().mockResolvedValue({ id: 'pv-1', name: 'v1.0' }),
    },
    fitnessPlan: {
      getLatest: vi.fn().mockResolvedValue({ id: 'plan-1', content: 'Test plan' }),
    },
  } as any;
}

describe('EnrollmentService', () => {
  let service: EnrollmentServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createEnrollmentService(repos);
  });

  describe('enrollClient', () => {
    it('should create a new enrollment', async () => {
      const result = await service.enrollClient('user-1', 'prog-1');

      expect(repos.programEnrollment.findByClientAndProgram).toHaveBeenCalledWith('user-1', 'prog-1');
      expect(repos.programEnrollment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'user-1',
          programId: 'prog-1',
          status: 'active',
          currentWeek: 1,
        })
      );
      expect(result).toEqual(expect.objectContaining({ id: 'enr-1' }));
    });

    it('should throw if client is already actively enrolled', async () => {
      repos.programEnrollment.findByClientAndProgram.mockResolvedValueOnce(makeEnrollment());

      await expect(service.enrollClient('user-1', 'prog-1')).rejects.toThrow(
        'Client is already enrolled in this program'
      );
      expect(repos.programEnrollment.create).not.toHaveBeenCalled();
    });

    it('should allow enrollment if existing is cancelled', async () => {
      repos.programEnrollment.findByClientAndProgram.mockResolvedValueOnce(
        makeEnrollment({ status: 'cancelled' })
      );

      await service.enrollClient('user-1', 'prog-1');
      expect(repos.programEnrollment.create).toHaveBeenCalled();
    });

    it('should pass through options', async () => {
      await service.enrollClient('user-1', 'prog-1', {
        cohortId: 'cohort-1',
        programVersionId: 'pv-1',
        startDate: new Date('2026-04-01'),
      });

      expect(repos.programEnrollment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cohortId: 'cohort-1',
          programVersionId: 'pv-1',
          startDate: new Date('2026-04-01'),
        })
      );
    });

    it('should default optional fields to null', async () => {
      await service.enrollClient('user-1', 'prog-1');

      const call = repos.programEnrollment.create.mock.calls[0][0];
      expect(call.programVersionId).toBeNull();
      expect(call.cohortId).toBeNull();
      expect(call.cohortStartDate).toBeNull();
    });
  });

  describe('getActiveEnrollment', () => {
    it('should return active enrollment', async () => {
      const result = await service.getActiveEnrollment('user-1');
      expect(result).toEqual(expect.objectContaining({ status: 'active' }));
    });

    it('should return null when none active', async () => {
      repos.programEnrollment.findActiveByClientId.mockResolvedValueOnce(null);
      const result = await service.getActiveEnrollment('user-1');
      expect(result).toBeNull();
    });
  });

  describe('getEnrollmentWithProgramVersion', () => {
    it('should return enrollment with version and plan', async () => {
      repos.programEnrollment.findActiveByClientId.mockResolvedValueOnce(
        makeEnrollment({ programVersionId: 'pv-1' })
      );

      const result = await service.getEnrollmentWithProgramVersion('user-1');

      expect(result).not.toBeNull();
      expect(result!.enrollment).toEqual(expect.objectContaining({ clientId: 'user-1' }));
      expect(result!.programVersion).toEqual(expect.objectContaining({ id: 'pv-1' }));
      expect(result!.currentPlanInstance).toEqual(expect.objectContaining({ id: 'plan-1' }));
    });

    it('should return null when no active enrollment', async () => {
      repos.programEnrollment.findActiveByClientId.mockResolvedValueOnce(null);
      const result = await service.getEnrollmentWithProgramVersion('user-1');
      expect(result).toBeNull();
    });

    it('should handle enrollment without program version', async () => {
      repos.programEnrollment.findActiveByClientId.mockResolvedValueOnce(
        makeEnrollment({ programVersionId: null })
      );

      const result = await service.getEnrollmentWithProgramVersion('user-1');
      expect(result!.programVersion).toBeNull();
      expect(repos.programVersion.findById).not.toHaveBeenCalled();
    });
  });

  describe('linkProgramVersion', () => {
    it('should link version to enrollment', async () => {
      const result = await service.linkProgramVersion('enr-1', 'pv-1');
      expect(repos.programEnrollment.updateProgramVersionId).toHaveBeenCalledWith('enr-1', 'pv-1');
      expect(result!.programVersionId).toBe('pv-1');
    });
  });

  describe('updateCurrentWeek', () => {
    it('should update week', async () => {
      const result = await service.updateCurrentWeek('enr-1', 3);
      expect(repos.programEnrollment.updateCurrentWeek).toHaveBeenCalledWith('enr-1', 3);
      expect(result!.currentWeek).toBe(3);
    });
  });

  describe('lifecycle methods', () => {
    it('should cancel enrollment', async () => {
      const result = await service.cancelEnrollment('enr-1');
      expect(repos.programEnrollment.cancel).toHaveBeenCalledWith('enr-1');
      expect(result!.status).toBe('cancelled');
    });

    it('should pause enrollment', async () => {
      const result = await service.pauseEnrollment('enr-1');
      expect(repos.programEnrollment.pause).toHaveBeenCalledWith('enr-1');
      expect(result!.status).toBe('paused');
    });

    it('should resume enrollment', async () => {
      const result = await service.resumeEnrollment('enr-1');
      expect(repos.programEnrollment.resume).toHaveBeenCalledWith('enr-1');
      expect(result!.status).toBe('active');
    });
  });

  describe('query methods', () => {
    it('should get by id', async () => {
      await service.getById('enr-1');
      expect(repos.programEnrollment.findById).toHaveBeenCalledWith('enr-1');
    });

    it('should get all by client id', async () => {
      const result = await service.getByClientId('user-1');
      expect(result).toHaveLength(1);
    });

    it('should get by program id', async () => {
      await service.getByProgramId('prog-1', 'active' as any);
      expect(repos.programEnrollment.findByProgramId).toHaveBeenCalledWith('prog-1', 'active');
    });

    it('should get by program version id', async () => {
      await service.getByProgramVersionId('pv-1');
      expect(repos.programEnrollment.findByProgramVersionId).toHaveBeenCalledWith('pv-1');
    });

    it('should count active enrollments', async () => {
      const count = await service.countActiveEnrollments('prog-1');
      expect(count).toBe(42);
    });

    it('should count active by version', async () => {
      const count = await service.countActiveEnrollmentsByVersion('pv-1');
      expect(count).toBe(15);
    });

    it('should list by program', async () => {
      await service.listByProgram('prog-1');
      expect(repos.programEnrollment.findByProgramId).toHaveBeenCalledWith('prog-1');
    });
  });

  describe('updateStatus', () => {
    it('should update enrollment status', async () => {
      const result = await service.updateStatus('enr-1', 'completed' as any);
      expect(result!.status).toBe('completed');
    });
  });

  describe('update', () => {
    it('should update arbitrary fields', async () => {
      await service.update('enr-1', { currentWeek: 5 } as any);
      expect(repos.programEnrollment.update).toHaveBeenCalledWith('enr-1', { currentWeek: 5 });
    });
  });
});
