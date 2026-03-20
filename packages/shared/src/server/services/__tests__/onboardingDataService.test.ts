import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOnboardingDataService } from '../domain/user/onboardingDataService';
import type { OnboardingDataServiceInstance } from '../domain/user/onboardingDataService';

function makeRecord(overrides: Record<string, any> = {}) {
  return {
    id: 'onb-1',
    clientId: 'user-1',
    status: 'pending',
    currentStep: 0,
    signupData: null,
    messagesSent: false,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    onboarding: {
      create: vi.fn().mockResolvedValue(makeRecord()),
      markStarted: vi.fn().mockResolvedValue(makeRecord({ status: 'in_progress' })),
      updateCurrentStep: vi.fn().mockResolvedValue(makeRecord({ currentStep: 3 })),
      markCompleted: vi.fn().mockResolvedValue(makeRecord({ status: 'completed' })),
      updateStatus: vi.fn().mockResolvedValue(makeRecord({ status: 'failed' })),
      findByClientId: vi.fn().mockResolvedValue(makeRecord()),
      getSignupData: vi.fn().mockResolvedValue({ name: 'Test User', goals: ['strength'] }),
      upsertSignupData: vi.fn().mockResolvedValue(makeRecord({ signupData: { name: 'Test' } })),
      clearSignupData: vi.fn().mockResolvedValue(makeRecord({ signupData: null })),
      markMessagesSent: vi.fn().mockResolvedValue(makeRecord({ messagesSent: true })),
      hasMessagesSent: vi.fn().mockResolvedValue(false),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  } as any;
}

describe('OnboardingDataService', () => {
  let service: OnboardingDataServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createOnboardingDataService(repos);
  });

  describe('createOnboardingRecord', () => {
    it('should create a record without signup data', async () => {
      const result = await service.createOnboardingRecord('user-1');
      expect(repos.onboarding.create).toHaveBeenCalledWith('user-1', undefined);
      expect(result).toEqual(expect.objectContaining({ id: 'onb-1' }));
    });

    it('should create a record with signup data', async () => {
      const signupData = { name: 'Aaron', goals: ['muscle'] };
      await service.createOnboardingRecord('user-1', signupData as any);
      expect(repos.onboarding.create).toHaveBeenCalledWith('user-1', signupData);
    });
  });

  describe('markStarted', () => {
    it('should mark onboarding as started', async () => {
      const result = await service.markStarted('user-1');
      expect(repos.onboarding.markStarted).toHaveBeenCalledWith('user-1');
      expect(result.status).toBe('in_progress');
    });
  });

  describe('updateCurrentStep', () => {
    it('should update step number', async () => {
      const result = await service.updateCurrentStep('user-1', 3);
      expect(repos.onboarding.updateCurrentStep).toHaveBeenCalledWith('user-1', 3);
      expect(result.currentStep).toBe(3);
    });
  });

  describe('markCompleted', () => {
    it('should mark as completed', async () => {
      const result = await service.markCompleted('user-1');
      expect(repos.onboarding.markCompleted).toHaveBeenCalledWith('user-1');
      expect(result.status).toBe('completed');
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      await service.updateStatus('user-1', 'failed' as any);
      expect(repos.onboarding.updateStatus).toHaveBeenCalledWith('user-1', 'failed', undefined);
    });

    it('should update status with error message', async () => {
      await service.updateStatus('user-1', 'failed' as any, 'Something broke');
      expect(repos.onboarding.updateStatus).toHaveBeenCalledWith('user-1', 'failed', 'Something broke');
    });
  });

  describe('getStatus', () => {
    it('should return status for existing record', async () => {
      const status = await service.getStatus('user-1');
      expect(status).toBe('pending');
    });

    it('should return null when no record found', async () => {
      repos.onboarding.findByClientId.mockResolvedValueOnce(null);
      const status = await service.getStatus('unknown');
      expect(status).toBeNull();
    });
  });

  describe('findByClientId', () => {
    it('should return record', async () => {
      const result = await service.findByClientId('user-1');
      expect(result).toEqual(expect.objectContaining({ clientId: 'user-1' }));
    });

    it('should return null when not found', async () => {
      repos.onboarding.findByClientId.mockResolvedValueOnce(null);
      const result = await service.findByClientId('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getSignupData', () => {
    it('should return signup data', async () => {
      const data = await service.getSignupData('user-1');
      expect(data).toEqual({ name: 'Test User', goals: ['strength'] });
    });
  });

  describe('upsertSignupData', () => {
    it('should upsert partial signup data', async () => {
      await service.upsertSignupData('user-1', { name: 'Updated' } as any);
      expect(repos.onboarding.upsertSignupData).toHaveBeenCalledWith('user-1', { name: 'Updated' });
    });
  });

  describe('clearSignupData', () => {
    it('should clear signup data', async () => {
      const result = await service.clearSignupData('user-1');
      expect(repos.onboarding.clearSignupData).toHaveBeenCalledWith('user-1');
      expect(result.signupData).toBeNull();
    });
  });

  describe('markMessagesSent', () => {
    it('should mark messages as sent', async () => {
      const result = await service.markMessagesSent('user-1');
      expect(result.messagesSent).toBe(true);
    });
  });

  describe('hasMessagesSent', () => {
    it('should return false when not sent', async () => {
      const sent = await service.hasMessagesSent('user-1');
      expect(sent).toBe(false);
    });

    it('should return true when sent', async () => {
      repos.onboarding.hasMessagesSent.mockResolvedValueOnce(true);
      const sent = await service.hasMessagesSent('user-1');
      expect(sent).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete onboarding record', async () => {
      await service.delete('user-1');
      expect(repos.onboarding.delete).toHaveBeenCalledWith('user-1');
    });
  });
});
