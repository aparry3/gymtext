import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { DatabaseMockHelper } from '../../../mocks/database-helpers';
import { WorkoutInstanceBuilder, mockWorkoutInstances, createWorkoutSequence } from '../../../fixtures/workoutInstances';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

describe('WorkoutInstanceRepository', () => {
  let mockDb: Kysely<DB>;
  let dbHelper: DatabaseMockHelper;
  let workoutInstanceRepository: WorkoutInstanceRepository;

  beforeEach(() => {
    dbHelper = new DatabaseMockHelper();
    mockDb = dbHelper.getDb();
    workoutInstanceRepository = new WorkoutInstanceRepository(mockDb);
  });

  describe('create', () => {
    it('should create a new workout instance successfully', async () => {
      const workoutData = new WorkoutInstanceBuilder().asNewWorkoutInstance();
      const expectedWorkout = new WorkoutInstanceBuilder(workoutData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedWorkout);

      const result = await workoutInstanceRepository.create(workoutData);

      expect(mockDb.insertInto).toHaveBeenCalledWith('workoutInstances');
      expect(insertBuilder.values).toHaveBeenCalledWith(workoutData);
      expect(insertBuilder.returningAll).toHaveBeenCalled();
      expect(result).toEqual(expectedWorkout);
    });

    it('should create strength workout with detailed structure', async () => {
      const strengthWorkout = mockWorkoutInstances.strengthWorkout();
      const workoutData = new WorkoutInstanceBuilder(strengthWorkout).asNewWorkoutInstance();
      const expectedWorkout = new WorkoutInstanceBuilder(workoutData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedWorkout);

      const result = await workoutInstanceRepository.create(workoutData);

      expect(result.sessionType).toBe('strength');
      expect(result.details).toHaveProperty('sessionType', 'lift');
      expect(result.details).toHaveProperty('details');
      expect(result.details).toHaveProperty('targets');
      expect(result.details.details).toHaveLength(3);
      expect(result.details.targets).toHaveLength(2);
    });

    it('should create cardio workout with distance targets', async () => {
      const cardioWorkout = mockWorkoutInstances.cardioWorkout();
      const workoutData = new WorkoutInstanceBuilder(cardioWorkout).asNewWorkoutInstance();
      const expectedWorkout = new WorkoutInstanceBuilder(workoutData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedWorkout);

      const result = await workoutInstanceRepository.create(workoutData);

      expect(result.sessionType).toBe('cardio');
      expect(result.goal).toBe('Improve aerobic capacity');
      expect(result.details.sessionType).toBe('run');
      
      const targets = result.details.targets || [];
      const distanceTarget = targets.find((t: any) => t.key === 'distanceKm');
      expect(distanceTarget).toBeDefined();
      expect(distanceTarget?.value).toBe(8);
    });

    it('should create workout with different session types', async () => {
      const sessionTypes: Array<'strength' | 'cardio' | 'mobility' | 'recovery' | 'assessment' | 'deload'> = 
        ['strength', 'cardio', 'mobility', 'recovery', 'assessment', 'deload'];
      
      for (const sessionType of sessionTypes) {
        const workoutData = new WorkoutInstanceBuilder()
          .withSessionType(sessionType)
          .asNewWorkoutInstance();
        const expectedWorkout = new WorkoutInstanceBuilder(workoutData).build();
        
        const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
        insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedWorkout);

        const result = await workoutInstanceRepository.create(workoutData);

        expect(result.sessionType).toBe(sessionType);
      }
    });

    it('should create workout without goal', async () => {
      const workoutData = new WorkoutInstanceBuilder()
        .withGoal(null)
        .asNewWorkoutInstance();
      const expectedWorkout = new WorkoutInstanceBuilder(workoutData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedWorkout);

      const result = await workoutInstanceRepository.create(workoutData);

      expect(result.goal).toBeNull();
    });

    it('should throw error when insert fails', async () => {
      const workoutData = new WorkoutInstanceBuilder().asNewWorkoutInstance();
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Insert failed'));

      await expect(workoutInstanceRepository.create(workoutData)).rejects.toThrow('Insert failed');
    });
  });

  describe('edge cases', () => {
    it('should handle complex details structure', async () => {
      const complexDetails = {
        sessionType: 'lift',
        details: [
          {
            label: 'Warm-up',
            activities: ['10 min row', 'Dynamic stretching', 'Band work'],
          },
          {
            label: 'Main Lift',
            activities: ['Squat: 5@60%, 5@70%, 5@80%, 3@85%, 1@90%, 1@95%'],
          },
          {
            label: 'Accessory A',
            activities: ['Front Squat 4x6@70%', 'Bulgarian Split Squats 3x10 each'],
          },
          {
            label: 'Accessory B',
            activities: ['Leg Curls 4x12', 'Calf Raises 4x15'],
          },
          {
            label: 'Core',
            activities: ['Plank 3x60s', 'Dead Bug 3x10', 'Pallof Press 3x12'],
          },
        ],
        targets: [
          { key: 'totalVolume', value: 12500 },
          { key: 'topSetWeight', value: 140 },
          { key: 'rpe', value: 9 },
          { key: 'sessionDuration', value: 90 },
        ],
      };
      
      const workoutData = new WorkoutInstanceBuilder()
        .withDetails(complexDetails)
        .asNewWorkoutInstance();
      const expectedWorkout = new WorkoutInstanceBuilder(workoutData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedWorkout);

      const result = await workoutInstanceRepository.create(workoutData);

      expect(result.details).toEqual(complexDetails);
      expect(result.details.details).toHaveLength(5);
      expect(result.details.targets).toHaveLength(4);
    });

    it('should handle workouts scheduled on same date', async () => {
      const date = new Date('2024-01-15');
      
      const morningWorkout = new WorkoutInstanceBuilder()
        .withDate(date)
        .withSessionType('strength')
        .asNewWorkoutInstance();
      
      const eveningWorkout = new WorkoutInstanceBuilder()
        .withDate(date)
        .withSessionType('cardio')
        .asNewWorkoutInstance();
      
      const expectedMorning = new WorkoutInstanceBuilder(morningWorkout).build();
      const expectedEvening = new WorkoutInstanceBuilder(eveningWorkout).build();
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow
        .mockResolvedValueOnce(expectedMorning)
        .mockResolvedValueOnce(expectedEvening);

      const result1 = await workoutInstanceRepository.create(morningWorkout);
      const result2 = await workoutInstanceRepository.create(eveningWorkout);

      expect(result1.date).toEqual(result2.date);
      expect(result1.sessionType).not.toBe(result2.sessionType);
    });

    it('should handle completed workouts', async () => {
      const completedAt = new Date('2024-01-15T10:30:00');
      const workoutData = new WorkoutInstanceBuilder()
        .markCompleted(completedAt)
        .asNewWorkoutInstance();
      const expectedWorkout = new WorkoutInstanceBuilder(workoutData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedWorkout);

      const result = await workoutInstanceRepository.create(workoutData);

      expect(result.completedAt).toEqual(completedAt);
    });

    it('should handle minimal details structure', async () => {
      const minimalDetails = {
        sessionType: 'rest',
        details: [
          {
            label: 'Rest Day',
            activities: ['Complete rest'],
          },
        ],
      };
      
      const workoutData = new WorkoutInstanceBuilder()
        .withDetails(minimalDetails)
        .asNewWorkoutInstance();
      const expectedWorkout = new WorkoutInstanceBuilder(workoutData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedWorkout);

      const result = await workoutInstanceRepository.create(workoutData);

      expect(result.details).toEqual(minimalDetails);
      expect(result.details.targets).toBeUndefined();
    });

    it('should handle very long activity descriptions', async () => {
      const longDescription = 'This is a very detailed exercise description that includes specific form cues, breathing patterns, tempo recommendations, and various modifications for different skill levels. It goes into great detail about the setup, execution, and common mistakes to avoid.';
      
      const workoutData = new WorkoutInstanceBuilder()
        .withDetails({
          sessionType: 'lift',
          details: [
            {
              label: 'Complex Movement',
              activities: [longDescription],
            },
          ],
        })
        .asNewWorkoutInstance();
      const expectedWorkout = new WorkoutInstanceBuilder(workoutData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedWorkout);

      const result = await workoutInstanceRepository.create(workoutData);

      expect(result.details.details[0].activities[0]).toBe(longDescription);
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      mockDb.insertInto = vi.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const workoutData = new WorkoutInstanceBuilder().asNewWorkoutInstance();

      await expect(workoutInstanceRepository.create(workoutData)).rejects.toThrow('Database connection failed');
    });

    it('should handle foreign key violations', async () => {
      const workoutData = new WorkoutInstanceBuilder()
        .withMicrocycleId('non-existent-microcycle')
        .asNewWorkoutInstance();
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('Foreign key violation: microcycle_id references non-existent microcycle')
      );

      await expect(workoutInstanceRepository.create(workoutData)).rejects.toThrow('Foreign key violation');
    });

    it('should handle unique constraint violations', async () => {
      const workoutData = new WorkoutInstanceBuilder().asNewWorkoutInstance();
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('Unique constraint violation: only one workout per client per date per session type')
      );

      await expect(workoutInstanceRepository.create(workoutData)).rejects.toThrow('Unique constraint violation');
    });

    it('should handle invalid session type', async () => {
      const workoutData = {
        ...new WorkoutInstanceBuilder().asNewWorkoutInstance(),
        sessionType: 'invalid-type',
      };
      
      const insertBuilder = dbHelper.mockInsertInto('workoutInstances');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('Check constraint violation: invalid session_type')
      );

      await expect(workoutInstanceRepository.create(workoutData as any)).rejects.toThrow('Check constraint violation');
    });
  });
});