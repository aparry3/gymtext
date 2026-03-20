import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFitnessPlanService } from '../domain/training/fitnessPlanService';
import type { FitnessPlanServiceInstance } from '../domain/training/fitnessPlanService';
import type { FitnessPlan } from '../../models/fitnessPlan';

function makePlan(overrides: Partial<FitnessPlan> = {}): FitnessPlan {
  return {
    id: 'plan-1',
    clientId: 'user-1',
    content: '4-week strength program',
    description: 'Beginner strength training',
    startDate: '2026-03-01',
    details: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  } as FitnessPlan;
}

function makeMockRepos() {
  return {
    fitnessPlan: {
      create: vi.fn().mockResolvedValue(makePlan()),
      getLatest: vi.fn().mockResolvedValue(makePlan()),
      getById: vi.fn().mockResolvedValue(makePlan()),
      getHistory: vi.fn().mockResolvedValue([makePlan(), makePlan({ id: 'plan-2' })]),
    },
  } as any;
}

describe('FitnessPlanService', () => {
  let service: FitnessPlanServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createFitnessPlanService(repos);
  });

  describe('insertPlan', () => {
    it('should insert a plan via repository', async () => {
      const plan = makePlan();
      const result = await service.insertPlan(plan);

      expect(repos.fitnessPlan.create).toHaveBeenCalledWith(
        'user-1',
        '4-week strength program',
        '2026-03-01',
        'Beginner strength training',
        undefined
      );
      expect(result).toEqual(expect.objectContaining({ id: 'plan-1' }));
    });

    it('should pass details when present', async () => {
      const plan = makePlan({ details: { weeks: 4, focus: 'strength' } as any });
      await service.insertPlan(plan);

      expect(repos.fitnessPlan.create).toHaveBeenCalledWith(
        'user-1',
        '4-week strength program',
        '2026-03-01',
        'Beginner strength training',
        { details: { weeks: 4, focus: 'strength' } }
      );
    });

    it('should fall back to description if content is null', async () => {
      const plan = makePlan({ content: null as any });
      await service.insertPlan(plan);

      expect(repos.fitnessPlan.create).toHaveBeenCalledWith(
        'user-1',
        'Beginner strength training',
        expect.any(String),
        'Beginner strength training',
        undefined
      );
    });
  });

  describe('getCurrentPlan', () => {
    it('should return latest plan for user', async () => {
      const result = await service.getCurrentPlan('user-1');
      expect(repos.fitnessPlan.getLatest).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expect.objectContaining({ id: 'plan-1' }));
    });

    it('should return null when no plan exists', async () => {
      repos.fitnessPlan.getLatest.mockResolvedValueOnce(null);
      const result = await service.getCurrentPlan('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getPlanById', () => {
    it('should return plan by id', async () => {
      const result = await service.getPlanById('plan-1');
      expect(repos.fitnessPlan.getById).toHaveBeenCalledWith('plan-1');
      expect(result).toEqual(expect.objectContaining({ id: 'plan-1' }));
    });

    it('should return null when not found', async () => {
      repos.fitnessPlan.getById.mockResolvedValueOnce(null);
      const result = await service.getPlanById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getPlanHistory', () => {
    it('should return plan history for user', async () => {
      const result = await service.getPlanHistory('user-1');
      expect(repos.fitnessPlan.getHistory).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no history', async () => {
      repos.fitnessPlan.getHistory.mockResolvedValueOnce([]);
      const result = await service.getPlanHistory('unknown');
      expect(result).toEqual([]);
    });
  });
});
