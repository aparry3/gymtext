import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { DatabaseMockHelper } from '../../../mocks/database-helpers';
import { MicrocycleBuilder, mockMicrocycles, createMicrocycleSequence } from '../../../fixtures/microcycles';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

describe('MicrocycleRepository', () => {
  let mockDb: Kysely<DB>;
  let dbHelper: DatabaseMockHelper;
  let microcycleRepository: MicrocycleRepository;

  beforeEach(() => {
    dbHelper = new DatabaseMockHelper();
    mockDb = dbHelper.getDb();
    microcycleRepository = new MicrocycleRepository(mockDb);
  });

  describe('create', () => {
    it('should create a new microcycle successfully', async () => {
      const microcycleData = new MicrocycleBuilder().asNewMicrocycle();
      const expectedMicrocycle = new MicrocycleBuilder(microcycleData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMicrocycle);

      const result = await microcycleRepository.create(microcycleData);

      expect(mockDb.insertInto).toHaveBeenCalledWith('microcycles');
      expect(insertBuilder.values).toHaveBeenCalledWith(microcycleData);
      expect(insertBuilder.returningAll).toHaveBeenCalled();
      expect(result).toEqual(expectedMicrocycle);
    });

    it('should create microcycle with targets', async () => {
      const targets = {
        avgIntensityPct1RM: 80,
        totalSetsMainLifts: 16,
        split: 'Upper-Lower-Rest-Upper-Lower-Rest-Rest',
      };
      
      const microcycleData = new MicrocycleBuilder()
        .withTargets(targets)
        .asNewMicrocycle();
      const expectedMicrocycle = new MicrocycleBuilder(microcycleData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMicrocycle);

      const result = await microcycleRepository.create(microcycleData);

      expect(result.targets).toEqual(targets);
    });

    it('should create deload week', async () => {
      const deloadTargets = { deload: true, volumeReduction: 0.5 };
      const microcycleData = new MicrocycleBuilder()
        .withTargets(deloadTargets)
        .asNewMicrocycle();
      const expectedMicrocycle = new MicrocycleBuilder(microcycleData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMicrocycle);

      const result = await microcycleRepository.create(microcycleData);

      expect(result.targets).toHaveProperty('deload', true);
      expect(result.targets).toHaveProperty('volumeReduction', 0.5);
    });

    it('should create microcycle with proper date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      
      const microcycleData = new MicrocycleBuilder()
        .withDates(startDate, endDate)
        .asNewMicrocycle();
      const expectedMicrocycle = new MicrocycleBuilder(microcycleData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMicrocycle);

      const result = await microcycleRepository.create(microcycleData);

      expect(result.startDate).toEqual(startDate);
      expect(result.endDate).toEqual(endDate);
      
      const duration = endDate.getTime() - startDate.getTime();
      const days = duration / (1000 * 60 * 60 * 24);
      expect(days).toBe(6); // 7-day week
    });

    it('should throw error when insert fails', async () => {
      const microcycleData = new MicrocycleBuilder().asNewMicrocycle();
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Insert failed'));

      await expect(microcycleRepository.create(microcycleData)).rejects.toThrow('Insert failed');
    });
  });

  describe('edge cases', () => {
    it('should handle microcycles with null targets', async () => {
      const microcycleData = new MicrocycleBuilder()
        .withTargets(null)
        .asNewMicrocycle();
      const expectedMicrocycle = new MicrocycleBuilder(microcycleData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMicrocycle);

      const result = await microcycleRepository.create(microcycleData);

      expect(result.targets).toBeNull();
    });

    it('should handle complex target structures', async () => {
      const complexTargets = {
        strength: {
          avgIntensityPct1RM: 85,
          totalSetsMainLifts: 15,
          mainLifts: ['squat', 'bench', 'deadlift'],
        },
        endurance: {
          totalMileage: 30,
          longRunMileage: 12,
          paceTargets: {
            easy: '8:30',
            tempo: '7:00',
            interval: '6:00',
          },
        },
        split: 'Custom-Program',
        notes: 'Focus on compound movements',
      };
      
      const microcycleData = new MicrocycleBuilder()
        .withTargets(complexTargets)
        .asNewMicrocycle();
      const expectedMicrocycle = new MicrocycleBuilder(microcycleData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMicrocycle);

      const result = await microcycleRepository.create(microcycleData);

      expect(result.targets).toEqual(complexTargets);
    });

    it('should handle microcycles with same index in different mesocycles', async () => {
      const microcycle1Data = new MicrocycleBuilder()
        .withMesocycleId('meso-1')
        .withIndex(0)
        .asNewMicrocycle();
      const microcycle2Data = new MicrocycleBuilder()
        .withMesocycleId('meso-2')
        .withIndex(0)
        .asNewMicrocycle();
      
      const expectedMicrocycle1 = new MicrocycleBuilder(microcycle1Data).build();
      const expectedMicrocycle2 = new MicrocycleBuilder(microcycle2Data).build();
      
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow
        .mockResolvedValueOnce(expectedMicrocycle1)
        .mockResolvedValueOnce(expectedMicrocycle2);

      const result1 = await microcycleRepository.create(microcycle1Data);
      const result2 = await microcycleRepository.create(microcycle2Data);

      expect(result1.index).toBe(0);
      expect(result2.index).toBe(0);
      expect(result1.mesocycleId).not.toBe(result2.mesocycleId);
    });

    it('should handle microcycles spanning different durations', async () => {
      const durations = [
        { start: new Date('2024-01-01'), end: new Date('2024-01-07'), days: 6 },  // Standard week
        { start: new Date('2024-01-01'), end: new Date('2024-01-10'), days: 9 },  // 10-day cycle
        { start: new Date('2024-01-01'), end: new Date('2024-01-14'), days: 13 }, // 2-week cycle
      ];

      for (const { start, end, days } of durations) {
        const microcycleData = new MicrocycleBuilder()
          .withDates(start, end)
          .asNewMicrocycle();
        const expectedMicrocycle = new MicrocycleBuilder(microcycleData).build();
        
        const insertBuilder = dbHelper.mockInsertInto('microcycles');
        insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMicrocycle);

        const result = await microcycleRepository.create(microcycleData);

        const actualDays = (result.endDate.getTime() - result.startDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(actualDays).toBe(days);
      }
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      mockDb.insertInto = vi.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const microcycleData = new MicrocycleBuilder().asNewMicrocycle();

      await expect(microcycleRepository.create(microcycleData)).rejects.toThrow('Database connection failed');
    });

    it('should handle foreign key violations', async () => {
      const microcycleData = new MicrocycleBuilder()
        .withMesocycleId('non-existent-mesocycle')
        .asNewMicrocycle();
      
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('Foreign key violation: mesocycle_id references non-existent mesocycle')
      );

      await expect(microcycleRepository.create(microcycleData)).rejects.toThrow('Foreign key violation');
    });

    it('should handle unique constraint violations', async () => {
      const microcycleData = new MicrocycleBuilder().asNewMicrocycle();
      
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('Unique constraint violation: (client_id, fitness_plan_id, mesocycle_id, index)')
      );

      await expect(microcycleRepository.create(microcycleData)).rejects.toThrow('Unique constraint violation');
    });

    it('should handle invalid date ranges', async () => {
      const microcycleData = new MicrocycleBuilder()
        .withDates(new Date('2024-01-08'), new Date('2024-01-01')) // End before start
        .asNewMicrocycle();
      
      const insertBuilder = dbHelper.mockInsertInto('microcycles');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('Check constraint violation: end_date must be after start_date')
      );

      await expect(microcycleRepository.create(microcycleData)).rejects.toThrow('Check constraint violation');
    });
  });
});