import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWorkoutInstanceService } from '../domain/training/workoutInstanceService';
import type { WorkoutInstanceServiceInstance } from '../domain/training/workoutInstanceService';

function makeWorkout(overrides: Record<string, any> = {}) {
  return {
    id: 'wi-1',
    userId: 'user-1',
    date: '2026-03-20',
    content: 'Bench Press 3x8, Squats 3x10',
    microcycleId: 'micro-1',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMockRepo() {
  return {
    upsert: vi.fn().mockResolvedValue(makeWorkout()),
    getById: vi.fn().mockResolvedValue(makeWorkout()),
    getByUserAndDate: vi.fn().mockResolvedValue(makeWorkout()),
    getByUserId: vi.fn().mockResolvedValue([makeWorkout(), makeWorkout({ id: 'wi-2', date: '2026-03-21' })]),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

describe('WorkoutInstanceService', () => {
  let service: WorkoutInstanceServiceInstance;
  let repo: ReturnType<typeof makeMockRepo>;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = makeMockRepo();
    service = createWorkoutInstanceService(repo as any);
  });

  describe('upsert', () => {
    it('should upsert a workout instance', async () => {
      const input = { userId: 'user-1', date: '2026-03-20', content: 'New workout' };
      const result = await service.upsert(input as any);

      expect(repo.upsert).toHaveBeenCalledWith(input);
      expect(result).toEqual(expect.objectContaining({ id: 'wi-1' }));
    });
  });

  describe('getById', () => {
    it('should return workout by id', async () => {
      const result = await service.getById('wi-1');
      expect(repo.getById).toHaveBeenCalledWith('wi-1');
      expect(result).toEqual(expect.objectContaining({ id: 'wi-1' }));
    });

    it('should return null when not found', async () => {
      repo.getById.mockResolvedValueOnce(null);
      const result = await service.getById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getByUserAndDate', () => {
    it('should return workout for user and date', async () => {
      const result = await service.getByUserAndDate('user-1', '2026-03-20');
      expect(repo.getByUserAndDate).toHaveBeenCalledWith('user-1', '2026-03-20');
      expect(result).toEqual(expect.objectContaining({ date: '2026-03-20' }));
    });

    it('should return null when no workout for date', async () => {
      repo.getByUserAndDate.mockResolvedValueOnce(null);
      const result = await service.getByUserAndDate('user-1', '2025-01-01');
      expect(result).toBeNull();
    });
  });

  describe('getByUserId', () => {
    it('should return workouts for user', async () => {
      const result = await service.getByUserId('user-1');
      expect(repo.getByUserId).toHaveBeenCalledWith('user-1', undefined);
      expect(result).toHaveLength(2);
    });

    it('should pass limit and offset options', async () => {
      await service.getByUserId('user-1', { limit: 5, offset: 10 });
      expect(repo.getByUserId).toHaveBeenCalledWith('user-1', { limit: 5, offset: 10 });
    });

    it('should return empty array when no workouts', async () => {
      repo.getByUserId.mockResolvedValueOnce([]);
      const result = await service.getByUserId('unknown');
      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete a workout instance', async () => {
      await service.delete('wi-1');
      expect(repo.delete).toHaveBeenCalledWith('wi-1');
    });
  });
});
