import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MesocycleRepository } from '@/server/repositories/mesocycleRepository';
import { DatabaseMockHelper } from '../../../mocks/database-helpers';
import { MesocycleBuilder, mockMesocycles, createMesocycleSequence, createMockMesocycles } from '../../../fixtures/mesocycles';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

describe('MesocycleRepository', () => {
  let mockDb: Kysely<DB>;
  let dbHelper: DatabaseMockHelper;
  let mesocycleRepository: MesocycleRepository;

  beforeEach(() => {
    dbHelper = new DatabaseMockHelper();
    mockDb = dbHelper.getDb();
    mesocycleRepository = new MesocycleRepository(mockDb);
  });

  describe('create', () => {
    it('should create a new mesocycle successfully', async () => {
      const mesocycleData = new MesocycleBuilder().asNewMesocycle();
      const expectedMesocycle = new MesocycleBuilder(mesocycleData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('mesocycles');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMesocycle);

      const result = await mesocycleRepository.create(mesocycleData);

      expect(mockDb.insertInto).toHaveBeenCalledWith('mesocycles');
      expect(insertBuilder.values).toHaveBeenCalledWith(mesocycleData);
      expect(insertBuilder.returningAll).toHaveBeenCalled();
      expect(result).toEqual(expectedMesocycle);
    });

    it('should create mesocycle with specific phase', async () => {
      const phases = ['Foundation', 'Build', 'Strength', 'Peak', 'Deload'];
      
      for (const phase of phases) {
        const mesocycleData = new MesocycleBuilder()
          .withPhase(phase)
          .asNewMesocycle();
        const expectedMesocycle = new MesocycleBuilder(mesocycleData).build();
        
        const insertBuilder = dbHelper.mockInsertInto('mesocycles');
        insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMesocycle);

        const result = await mesocycleRepository.create(mesocycleData);

        expect(result.phase).toBe(phase);
      }
    });

    it('should create mesocycle with different durations', async () => {
      const durations = [1, 2, 4, 6, 8, 12];
      
      for (const weeks of durations) {
        const mesocycleData = new MesocycleBuilder()
          .withLengthWeeks(weeks)
          .asNewMesocycle();
        const expectedMesocycle = new MesocycleBuilder(mesocycleData).build();
        
        const insertBuilder = dbHelper.mockInsertInto('mesocycles');
        insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMesocycle);

        const result = await mesocycleRepository.create(mesocycleData);

        expect(result.lengthWeeks).toBe(weeks);
      }
    });

    it('should throw error when insert fails', async () => {
      const mesocycleData = new MesocycleBuilder().asNewMesocycle();
      const insertBuilder = dbHelper.mockInsertInto('mesocycles');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Insert failed'));

      await expect(mesocycleRepository.create(mesocycleData)).rejects.toThrow('Insert failed');
    });

    it('should handle constraint violations', async () => {
      const mesocycleData = new MesocycleBuilder()
        .withLengthWeeks(0)
        .asNewMesocycle();
      
      const insertBuilder = dbHelper.mockInsertInto('mesocycles');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('Check constraint violation: length_weeks must be greater than 0')
      );

      await expect(mesocycleRepository.create(mesocycleData)).rejects.toThrow('Check constraint violation');
    });
  });

  describe('getMesocyclesByFitnessPlanId', () => {
    it('should get all mesocycles for a fitness plan ordered by index', async () => {
      const fitnessPlanId = 'plan-1';
      const mesocycles = createMesocycleSequence(fitnessPlanId, 'user-1');
      
      const selectBuilder = dbHelper.mockSelectFrom('mesocycles');
      selectBuilder.execute.mockResolvedValue(mesocycles);

      const result = await mesocycleRepository.getMesocyclesByFitnessPlanId(fitnessPlanId);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('mesocycles');
      expect(selectBuilder.where).toHaveBeenCalledWith('fitnessPlanId', '=', fitnessPlanId);
      expect(selectBuilder.orderBy).toHaveBeenCalledWith('index', 'asc');
      expect(selectBuilder.selectAll).toHaveBeenCalled();
      expect(result).toHaveLength(4);
      expect(result[0].phase).toBe('Base');
      expect(result[3].phase).toBe('Deload');
    });

    it('should return empty array when no mesocycles found', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('mesocycles');
      selectBuilder.execute.mockResolvedValue([]);

      const result = await mesocycleRepository.getMesocyclesByFitnessPlanId('plan-without-mesocycles');

      expect(result).toEqual([]);
    });

    it('should maintain correct order for multiple mesocycles', async () => {
      const fitnessPlanId = 'plan-1';
      const mesocycles = [
        mockMesocycles.peakPhase(),
        mockMesocycles.buildPhase(),
        mockMesocycles.basePhase(),
      ].sort((a, b) => a.index - b.index);
      
      const selectBuilder = dbHelper.mockSelectFrom('mesocycles');
      selectBuilder.execute.mockResolvedValue(mesocycles);

      const result = await mesocycleRepository.getMesocyclesByFitnessPlanId(fitnessPlanId);

      expect(result[0].index).toBe(0);
      expect(result[1].index).toBe(1);
      expect(result[2].index).toBe(2);
    });

    it('should handle large number of mesocycles', async () => {
      const fitnessPlanId = 'plan-1';
      const mesocycles = createMockMesocycles(20, fitnessPlanId, 'user-1');
      
      const selectBuilder = dbHelper.mockSelectFrom('mesocycles');
      selectBuilder.execute.mockResolvedValue(mesocycles);

      const result = await mesocycleRepository.getMesocyclesByFitnessPlanId(fitnessPlanId);

      expect(result).toHaveLength(20);
      expect(result.every(m => m.fitnessPlanId === fitnessPlanId)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle mesocycles with same index', async () => {
      const fitnessPlanId = 'plan-1';
      const mesocycles = [
        new MesocycleBuilder().withFitnessPlanId(fitnessPlanId).withIndex(0).withPhase('Phase 1').build(),
        new MesocycleBuilder().withFitnessPlanId(fitnessPlanId).withIndex(0).withPhase('Phase 2').build(),
      ];
      
      const selectBuilder = dbHelper.mockSelectFrom('mesocycles');
      selectBuilder.execute.mockResolvedValue(mesocycles);

      const result = await mesocycleRepository.getMesocyclesByFitnessPlanId(fitnessPlanId);

      expect(result).toHaveLength(2);
      expect(result.filter(m => m.index === 0)).toHaveLength(2);
    });

    it('should handle very long phase names', async () => {
      const longPhaseName = 'This is an extremely long phase name that describes a complex training phase with multiple objectives and considerations';
      const mesocycleData = new MesocycleBuilder()
        .withPhase(longPhaseName)
        .asNewMesocycle();
      const expectedMesocycle = new MesocycleBuilder(mesocycleData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('mesocycles');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMesocycle);

      const result = await mesocycleRepository.create(mesocycleData);

      expect(result.phase).toBe(longPhaseName);
    });

    it('should handle mesocycles spanning long periods', async () => {
      const mesocycleData = new MesocycleBuilder()
        .withLengthWeeks(52) // Full year
        .asNewMesocycle();
      const expectedMesocycle = new MesocycleBuilder(mesocycleData).build();
      
      const insertBuilder = dbHelper.mockInsertInto('mesocycles');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(expectedMesocycle);

      const result = await mesocycleRepository.create(mesocycleData);

      expect(result.lengthWeeks).toBe(52);
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      mockDb.selectFrom = vi.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(
        mesocycleRepository.getMesocyclesByFitnessPlanId('plan-1')
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle foreign key violations', async () => {
      const mesocycleData = new MesocycleBuilder()
        .withFitnessPlanId('non-existent-plan')
        .asNewMesocycle();
      
      const insertBuilder = dbHelper.mockInsertInto('mesocycles');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('Foreign key violation: fitness_plan_id references non-existent plan')
      );

      await expect(mesocycleRepository.create(mesocycleData)).rejects.toThrow('Foreign key violation');
    });

    it('should handle unique constraint violations', async () => {
      const mesocycleData = new MesocycleBuilder().asNewMesocycle();
      
      const insertBuilder = dbHelper.mockInsertInto('mesocycles');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('Unique constraint violation: (client_id, fitness_plan_id, index)')
      );

      await expect(mesocycleRepository.create(mesocycleData)).rejects.toThrow('Unique constraint violation');
    });

    it('should handle query timeout', async () => {
      const selectBuilder = dbHelper.mockSelectFrom('mesocycles');
      selectBuilder.execute.mockRejectedValue(new Error('Query timeout'));

      await expect(
        mesocycleRepository.getMesocyclesByFitnessPlanId('plan-1')
      ).rejects.toThrow('Query timeout');
    });
  });
});