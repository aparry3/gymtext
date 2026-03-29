import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createExerciseMetricsService } from '../domain/training/exerciseMetricsService';
import type { ExerciseMetricsServiceInstance } from '../domain/training/exerciseMetricsService';

function makeMockRepos() {
  return {
    exerciseMetrics: {
      upsert: vi.fn().mockResolvedValue({
        id: 'metric-1',
        clientId: 'user-1',
        workoutId: 'workout-1',
        exerciseId: 'exercise-1',
        data: { type: 'strength', sets: [{ reps: 8, weight: 135 }] },
      }),
      getByWorkoutId: vi.fn().mockResolvedValue([
        { exerciseId: 'ex-1', data: { type: 'strength', sets: [{ reps: 8, weight: 135 }] } },
        { exerciseId: 'ex-2', data: { type: 'cardio', duration: 30, distance: 3.1 } },
      ]),
      getByExerciseId: vi.fn().mockResolvedValue([
        { id: 'metric-1', data: { type: 'strength', sets: [{ reps: 10, weight: 145 }] } },
        { id: 'metric-2', data: { type: 'strength', sets: [{ reps: 8, weight: 135 }] } },
      ]),
      getByMovementId: vi.fn().mockResolvedValue([
        { id: 'metric-1', exerciseId: 'ex-1', exercise: { name: 'Bench Press' } },
        { id: 'metric-2', exerciseId: 'ex-3', exercise: { name: 'Incline Bench' } },
      ]),
    },
  } as any;
}

describe('ExerciseMetricsService', () => {
  let service: ExerciseMetricsServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createExerciseMetricsService(repos);
  });

  describe('saveExerciseProgress', () => {
    it('should upsert exercise metric', async () => {
      const data = { type: 'strength', sets: [{ reps: 8, weight: 135 }] };
      const result = await service.saveExerciseProgress('user-1', 'workout-1', 'exercise-1', data as any);

      expect(repos.exerciseMetrics.upsert).toHaveBeenCalledWith({
        clientId: 'user-1',
        workoutId: 'workout-1',
        exerciseId: 'exercise-1',
        data,
      });
      expect(result.id).toBe('metric-1');
    });
  });

  describe('getWorkoutMetrics', () => {
    it('should return metrics as exerciseId -> data map', async () => {
      const result = await service.getWorkoutMetrics('workout-1');

      expect(result).toEqual({
        'ex-1': { type: 'strength', sets: [{ reps: 8, weight: 135 }] },
        'ex-2': { type: 'cardio', duration: 30, distance: 3.1 },
      });
    });

    it('should return empty object when no metrics', async () => {
      repos.exerciseMetrics.getByWorkoutId.mockResolvedValue([]);
      const result = await service.getWorkoutMetrics('empty-workout');
      expect(result).toEqual({});
    });
  });

  describe('getWorkoutMetricRecords', () => {
    it('should return raw metric records', async () => {
      const result = await service.getWorkoutMetricRecords('workout-1');
      expect(result).toHaveLength(2);
      expect(repos.exerciseMetrics.getByWorkoutId).toHaveBeenCalledWith('workout-1');
    });
  });

  describe('getExerciseHistory', () => {
    it('should return historical metrics for an exercise', async () => {
      const result = await service.getExerciseHistory('user-1', 'ex-1');

      expect(repos.exerciseMetrics.getByExerciseId).toHaveBeenCalledWith('user-1', 'ex-1', 20);
      expect(result).toHaveLength(2);
    });

    it('should respect custom limit', async () => {
      await service.getExerciseHistory('user-1', 'ex-1', 5);
      expect(repos.exerciseMetrics.getByExerciseId).toHaveBeenCalledWith('user-1', 'ex-1', 5);
    });
  });

  describe('getLastMetricForExercise', () => {
    it('should return the most recent metric', async () => {
      const result = await service.getLastMetricForExercise('user-1', 'ex-1');

      expect(repos.exerciseMetrics.getByExerciseId).toHaveBeenCalledWith('user-1', 'ex-1', 1);
      expect(result?.id).toBe('metric-1');
    });

    it('should return undefined when no history', async () => {
      repos.exerciseMetrics.getByExerciseId.mockResolvedValue([]);
      const result = await service.getLastMetricForExercise('user-1', 'ex-new');
      expect(result).toBeUndefined();
    });
  });

  describe('getMovementHistory', () => {
    it('should return metrics across exercise variations', async () => {
      const result = await service.getMovementHistory('user-1', 'bench-press-movement');

      expect(repos.exerciseMetrics.getByMovementId).toHaveBeenCalledWith('user-1', 'bench-press-movement', 50);
      expect(result).toHaveLength(2);
    });

    it('should respect custom limit', async () => {
      await service.getMovementHistory('user-1', 'movement-1', 10);
      expect(repos.exerciseMetrics.getByMovementId).toHaveBeenCalledWith('user-1', 'movement-1', 10);
    });
  });
});
