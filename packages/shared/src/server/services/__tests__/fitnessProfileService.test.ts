import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFitnessProfileService } from '../domain/user/fitnessProfileService';
import type { FitnessProfileServiceInstance } from '../domain/user/fitnessProfileService';

// Mock dependencies
vi.mock('@/server/utils/circuitBreaker', () => {
  class MockCircuitBreaker {
    async execute<T>(fn: () => Promise<T>): Promise<T> {
      return fn();
    }
  }
  return { CircuitBreaker: MockCircuitBreaker };
});

vi.mock('@/server/utils/profile/jsonToMarkdown', () => ({
  createEmptyProfile: vi.fn().mockReturnValue('# Fitness Profile\n\n## Goals\n'),
}));

vi.mock('./signupDataFormatter', () => ({
  formatSignupDataForLLM: vi.fn().mockReturnValue('User wants to build muscle, 3x/week'),
}));

vi.mock('@/shared/utils/date', () => ({
  formatForAI: vi.fn().mockReturnValue('Friday, March 20, 2026'),
}));

function makeMockRepos() {
  return {
    profile: {
      getCurrentProfileText: vi.fn().mockResolvedValue('# Profile\nGoal: Strength'),
      createProfileForUser: vi.fn().mockResolvedValue(undefined),
      getProfileHistory: vi.fn().mockResolvedValue([
        { profile: '# v2', createdAt: new Date('2026-03-20') },
        { profile: '# v1', createdAt: new Date('2026-03-19') },
      ]),
    },
  } as any;
}

function makeMockAgentRunner() {
  return {
    invoke: vi.fn()
      .mockResolvedValueOnce({ response: '# Updated Profile\nGoal: Hypertrophy' }) // profile:update
      .mockResolvedValueOnce({ response: JSON.stringify({ goal: 'Hypertrophy', level: 'intermediate' }) }), // profile:details
  } as any;
}

describe('FitnessProfileService', () => {
  let service: FitnessProfileServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;
  let agentRunner: ReturnType<typeof makeMockAgentRunner>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    agentRunner = makeMockAgentRunner();
    service = createFitnessProfileService(repos, () => agentRunner);
  });

  describe('getCurrentProfile', () => {
    it('should return current profile text', async () => {
      const result = await service.getCurrentProfile('user-1');
      expect(repos.profile.getCurrentProfileText).toHaveBeenCalledWith('user-1');
      expect(result).toBe('# Profile\nGoal: Strength');
    });

    it('should return null when no profile exists', async () => {
      repos.profile.getCurrentProfileText.mockResolvedValueOnce(null);
      const result = await service.getCurrentProfile('user-1');
      expect(result).toBeNull();
    });
  });

  describe('saveProfile', () => {
    it('should save profile text', async () => {
      await service.saveProfile('user-1', '# New Profile');
      expect(repos.profile.createProfileForUser).toHaveBeenCalledWith('user-1', '# New Profile');
    });

    it('should throw on save error', async () => {
      repos.profile.createProfileForUser.mockRejectedValueOnce(new Error('DB error'));
      await expect(service.saveProfile('user-1', 'test')).rejects.toThrow('DB error');
    });
  });

  describe('createFitnessProfile', () => {
    const mockUser = { id: 'user-1', name: 'Aaron', timezone: 'America/New_York' } as any;
    const mockSignupData = { goals: ['muscle'], frequency: 3 } as any;

    it('should create profile via agent runner', async () => {
      const result = await service.createFitnessProfile(mockUser, mockSignupData);

      expect(agentRunner.invoke).toHaveBeenCalledWith('profile:update', expect.objectContaining({
        input: expect.any(String),
      }));
      expect(repos.profile.createProfileForUser).toHaveBeenCalledWith(
        'user-1',
        '# Updated Profile\nGoal: Hypertrophy',
        expect.objectContaining({ details: expect.any(Object) })
      );
      expect(result).toBe('# Updated Profile\nGoal: Hypertrophy');
    });

    it('should throw when agentRunner getter not provided', async () => {
      const serviceNoRunner = createFitnessProfileService(repos);
      await expect(serviceNoRunner.createFitnessProfile(mockUser, mockSignupData))
        .rejects.toThrow('agentRunner is required');
    });

    it('should handle profile:details failure gracefully', async () => {
      // Reset and set up fresh mocks for this test
      agentRunner.invoke = vi.fn()
        .mockResolvedValueOnce({ response: '# Profile' }) // profile:update succeeds
        .mockRejectedValueOnce(new Error('Details agent failed')); // profile:details fails

      // Re-create service with fresh agent runner
      service = createFitnessProfileService(repos, () => agentRunner);
      const result = await service.createFitnessProfile(mockUser, mockSignupData);

      // Should still save profile (with undefined details)
      expect(repos.profile.createProfileForUser).toHaveBeenCalledWith(
        'user-1',
        '# Profile',
        expect.objectContaining({ details: undefined })
      );
      expect(result).toBe('# Profile');
    });
  });

  describe('getProfileHistory', () => {
    it('should return profile history with default limit', async () => {
      const result = await service.getProfileHistory('user-1');
      expect(repos.profile.getProfileHistory).toHaveBeenCalledWith('user-1', 10);
      expect(result).toHaveLength(2);
    });

    it('should pass custom limit', async () => {
      await service.getProfileHistory('user-1', 5);
      expect(repos.profile.getProfileHistory).toHaveBeenCalledWith('user-1', 5);
    });
  });
});
