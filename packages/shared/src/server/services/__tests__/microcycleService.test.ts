import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMicrocycleService } from '../domain/training/microcycleService';
import type { MicrocycleServiceInstance } from '../domain/training/microcycleService';

function makeMicrocycle(overrides: Record<string, any> = {}) {
  return {
    id: 'micro-1',
    clientId: 'user-1',
    planId: 'plan-1',
    content: 'Week 1: Upper/Lower split',
    startDate: '2026-03-17',
    weekNumber: 1,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    microcycle: {
      getLatest: vi.fn().mockResolvedValue(makeMicrocycle()),
      getByDate: vi.fn().mockResolvedValue(makeMicrocycle()),
      getById: vi.fn().mockResolvedValue(makeMicrocycle()),
      getHistory: vi.fn().mockResolvedValue([makeMicrocycle(), makeMicrocycle({ id: 'micro-2', weekNumber: 2 })]),
      create: vi.fn().mockResolvedValue(makeMicrocycle()),
    },
  } as any;
}

describe('MicrocycleService', () => {
  let service: MicrocycleServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createMicrocycleService(repos);
  });

  describe('getLatestMicrocycle', () => {
    it('should return latest microcycle', async () => {
      const result = await service.getLatestMicrocycle('user-1');
      expect(repos.microcycle.getLatest).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expect.objectContaining({ id: 'micro-1' }));
    });

    it('should return null when none exist', async () => {
      repos.microcycle.getLatest.mockResolvedValueOnce(null);
      const result = await service.getLatestMicrocycle('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getMicrocycleByDate', () => {
    it('should return microcycle for target date', async () => {
      const date = new Date('2026-03-20');
      const result = await service.getMicrocycleByDate('user-1', date);
      expect(repos.microcycle.getByDate).toHaveBeenCalledWith('user-1', date);
      expect(result).toEqual(expect.objectContaining({ id: 'micro-1' }));
    });

    it('should return null when no microcycle covers date', async () => {
      repos.microcycle.getByDate.mockResolvedValueOnce(null);
      const result = await service.getMicrocycleByDate('user-1', new Date('2025-01-01'));
      expect(result).toBeNull();
    });
  });

  describe('getMicrocycleById', () => {
    it('should return microcycle by id', async () => {
      const result = await service.getMicrocycleById('micro-1');
      expect(repos.microcycle.getById).toHaveBeenCalledWith('micro-1');
      expect(result).toEqual(expect.objectContaining({ id: 'micro-1' }));
    });

    it('should return null when not found', async () => {
      repos.microcycle.getById.mockResolvedValueOnce(null);
      const result = await service.getMicrocycleById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getMicrocycleHistory', () => {
    it('should return history with default limit', async () => {
      const result = await service.getMicrocycleHistory('user-1');
      expect(repos.microcycle.getHistory).toHaveBeenCalledWith('user-1', 10);
      expect(result).toHaveLength(2);
    });

    it('should pass custom limit', async () => {
      await service.getMicrocycleHistory('user-1', 5);
      expect(repos.microcycle.getHistory).toHaveBeenCalledWith('user-1', 5);
    });

    it('should return empty array when no history', async () => {
      repos.microcycle.getHistory.mockResolvedValueOnce([]);
      const result = await service.getMicrocycleHistory('unknown');
      expect(result).toEqual([]);
    });
  });

  describe('createMicrocycle', () => {
    it('should create a microcycle', async () => {
      const startDate = new Date('2026-03-24');
      const result = await service.createMicrocycle('user-1', 'plan-1', 'Week 2 content', startDate);

      expect(repos.microcycle.create).toHaveBeenCalledWith('user-1', 'plan-1', 'Week 2 content', startDate);
      expect(result).toEqual(expect.objectContaining({ id: 'micro-1' }));
    });
  });
});
