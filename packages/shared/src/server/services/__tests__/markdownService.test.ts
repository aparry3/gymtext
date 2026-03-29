import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMarkdownService } from '../domain/markdown/markdownService';
import type { MarkdownServiceInstance } from '../domain/markdown/markdownService';

function makeMockRepos() {
  return {
    profile: {
      getCurrentProfileText: vi.fn().mockResolvedValue('# Profile\nAge: 30, Goal: Strength'),
      createProfileForUser: vi.fn().mockResolvedValue({ id: 'prof-1', content: 'updated' }),
      updateProfileDetails: vi.fn().mockResolvedValue(undefined),
    },
    fitnessPlan: {
      getLatest: vi.fn().mockResolvedValue({
        id: 'plan-1',
        content: '4-week strength program',
        description: 'fallback description',
      }),
      create: vi.fn().mockResolvedValue({ id: 'plan-new', content: 'new plan' }),
    },
    microcycle: {
      getLatest: vi.fn().mockResolvedValue({
        id: 'week-1',
        content: 'Week 1: Push/Pull/Legs',
        startDate: new Date('2026-03-17'),
      }),
      getByDate: vi.fn().mockResolvedValue({
        id: 'week-1',
        content: 'Week 1: Push/Pull/Legs',
        startDate: new Date('2026-03-17'),
      }),
      create: vi.fn().mockResolvedValue({ id: 'week-new', content: 'new week' }),
    },
  } as any;
}

describe('MarkdownService', () => {
  let service: MarkdownServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createMarkdownService(repos);
  });

  describe('getProfile', () => {
    it('should return profile text', async () => {
      const result = await service.getProfile('user-1');
      expect(repos.profile.getCurrentProfileText).toHaveBeenCalledWith('user-1');
      expect(result).toContain('Strength');
    });

    it('should return null when no profile', async () => {
      repos.profile.getCurrentProfileText.mockResolvedValueOnce(null);
      expect(await service.getProfile('user-1')).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should create/update profile', async () => {
      await service.updateProfile('user-1', 'new content');
      expect(repos.profile.createProfileForUser).toHaveBeenCalledWith('user-1', 'new content', undefined);
    });

    it('should pass details option', async () => {
      await service.updateProfile('user-1', 'content', { details: { age: 30 } });
      expect(repos.profile.createProfileForUser).toHaveBeenCalledWith('user-1', 'content', { details: { age: 30 } });
    });
  });

  describe('updateProfileDetails', () => {
    it('should update details', async () => {
      await service.updateProfileDetails('user-1', { goals: ['muscle'] });
      expect(repos.profile.updateProfileDetails).toHaveBeenCalledWith('user-1', { goals: ['muscle'] });
    });
  });

  describe('getPlan', () => {
    it('should return latest plan', async () => {
      const result = await service.getPlan('user-1');
      expect(result).toEqual(expect.objectContaining({ id: 'plan-1' }));
    });
  });

  describe('createPlan', () => {
    it('should create a plan', async () => {
      const startDate = new Date('2026-03-20');
      await service.createPlan('user-1', 'plan content', startDate);
      expect(repos.fitnessPlan.create).toHaveBeenCalledWith('user-1', 'plan content', startDate, undefined, undefined);
    });
  });

  describe('getWeek', () => {
    it('should return latest microcycle', async () => {
      const result = await service.getWeek('user-1');
      expect(result).toEqual(expect.objectContaining({ id: 'week-1' }));
    });
  });

  describe('getWeekForDate', () => {
    it('should return microcycle for specific date', async () => {
      const date = new Date('2026-03-18');
      await service.getWeekForDate('user-1', date);
      expect(repos.microcycle.getByDate).toHaveBeenCalledWith('user-1', date);
    });
  });

  describe('createWeek', () => {
    it('should create a microcycle', async () => {
      const startDate = new Date('2026-03-17');
      await service.createWeek('user-1', 'plan-1', 'week content', startDate);
      expect(repos.microcycle.create).toHaveBeenCalledWith('user-1', 'plan-1', 'week content', startDate, undefined);
    });

    it('should pass options', async () => {
      const startDate = new Date('2026-03-17');
      await service.createWeek('user-1', 'plan-1', 'content', startDate, { message: 'msg' });
      expect(repos.microcycle.create).toHaveBeenCalledWith('user-1', 'plan-1', 'content', startDate, { message: 'msg' });
    });
  });

  describe('getContext', () => {
    it('should return profile context', async () => {
      const result = await service.getContext('user-1', ['profile']);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatch(/## Profile/);
    });

    it('should return plan context', async () => {
      const result = await service.getContext('user-1', ['plan']);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatch(/## Plan/);
      expect(result[0]).toContain('4-week strength program');
    });

    it('should fall back to plan description when content is null', async () => {
      repos.fitnessPlan.getLatest.mockResolvedValueOnce({
        id: 'plan-1',
        content: null,
        description: 'fallback description',
      });

      const result = await service.getContext('user-1', ['plan']);
      expect(result[0]).toContain('fallback description');
    });

    it('should return week context', async () => {
      const result = await service.getContext('user-1', ['week']);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatch(/## Week/);
    });

    it('should use weekContentOverride when provided', async () => {
      const result = await service.getContext('user-1', ['week'], { weekContentOverride: 'Custom week' });
      expect(result[0]).toContain('Custom week');
      // Should not fetch from DB when override provided
      expect(repos.microcycle.getLatest).not.toHaveBeenCalled();
    });

    it('should use profileContentOverride when provided', async () => {
      const result = await service.getContext('user-1', ['profile'], { profileContentOverride: 'Custom profile' });
      expect(result[0]).toContain('Custom profile');
      expect(repos.profile.getCurrentProfileText).not.toHaveBeenCalled();
    });

    it('should fetch by date when options.date is provided', async () => {
      const date = new Date('2026-03-18');
      await service.getContext('user-1', ['week'], { date });
      expect(repos.microcycle.getByDate).toHaveBeenCalledWith('user-1', date);
      expect(repos.microcycle.getLatest).not.toHaveBeenCalled();
    });

    it('should return multiple contexts in requested order', async () => {
      const result = await service.getContext('user-1', ['profile', 'plan', 'week']);
      expect(result).toHaveLength(3);
      expect(result[0]).toMatch(/## Profile/);
      expect(result[1]).toMatch(/## Plan/);
      expect(result[2]).toMatch(/## Week/);
    });

    it('should skip empty contexts', async () => {
      repos.profile.getCurrentProfileText.mockResolvedValueOnce(null);
      const result = await service.getContext('user-1', ['profile', 'plan']);
      expect(result).toHaveLength(1); // only plan
      expect(result[0]).toMatch(/## Plan/);
    });

    it('should handle previousWeek type', async () => {
      // getByDate returns current week with startDate, then previous week
      repos.microcycle.getByDate
        .mockResolvedValueOnce(null) // previous week fetch
      repos.microcycle.getLatest.mockResolvedValueOnce({
        id: 'week-1',
        content: 'Current week',
        startDate: new Date('2026-03-17'),
      });

      // previousWeek needs the current week's startDate to calculate previous
      const result = await service.getContext('user-1', ['previousWeek']);
      // The previous week lookup depends on current week having a startDate
      expect(repos.microcycle.getLatest).toHaveBeenCalled();
    });

    it('should return empty array when no matching contexts', async () => {
      repos.profile.getCurrentProfileText.mockResolvedValueOnce(null);
      repos.fitnessPlan.getLatest.mockResolvedValueOnce(null);
      repos.microcycle.getLatest.mockResolvedValueOnce(null);

      const result = await service.getContext('user-1', ['profile', 'plan', 'week']);
      expect(result).toHaveLength(0);
    });

    it('should fetch data in parallel', async () => {
      // All three types should trigger parallel fetches
      await service.getContext('user-1', ['profile', 'plan', 'week']);

      expect(repos.profile.getCurrentProfileText).toHaveBeenCalled();
      expect(repos.fitnessPlan.getLatest).toHaveBeenCalled();
      expect(repos.microcycle.getLatest).toHaveBeenCalled();
    });
  });
});
