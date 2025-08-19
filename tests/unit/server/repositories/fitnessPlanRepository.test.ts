import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { DatabaseMockHelper } from '../../../mocks/database-helpers';
import { mockFitnessPlans } from '../../../fixtures/fitnessPlans';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

// Mock the FitnessPlanModel only to bypass date parsing nuances
vi.mock('@/server/models/fitnessPlan', async () => {
  const actual = await vi.importActual('@/server/models/fitnessPlan');
  return {
    ...actual,
    FitnessPlanModel: {
      fromDB: vi.fn((plan) => ({
        ...plan,
        mesocycles: typeof plan.mesocycles === 'string' 
          ? JSON.parse(plan.mesocycles) 
          : plan.mesocycles
      })),
    },
  };
});

describe('FitnessPlanRepository', () => {
  let mockDb: Kysely<DB>;
  let dbHelper: DatabaseMockHelper;
  let fitnessPlanRepository: FitnessPlanRepository;

  beforeEach(() => {
    dbHelper = new DatabaseMockHelper();
    mockDb = dbHelper.getDb();
    fitnessPlanRepository = new FitnessPlanRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('insertFitnessPlan', () => {
    it('inserts a plan and serializes mesocycles JSON', async () => {
      const fitnessPlan = mockFitnessPlans.currentSchemaPlan();
      const dbResult = {
        ...fitnessPlan,
        mesocycles: JSON.stringify(fitnessPlan.mesocycles),
      } as any;

      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(fitnessPlan as any);

      expect(mockDb.insertInto).toHaveBeenCalledWith('fitnessPlans');
      expect(insertBuilder.values).toHaveBeenCalledWith(
        expect.objectContaining({ mesocycles: JSON.stringify(fitnessPlan.mesocycles) })
      );
      expect(insertBuilder.returningAll).toHaveBeenCalled();
      expect(result.mesocycles).toEqual(fitnessPlan.mesocycles);
    });

    it('handles multiple mesocycles in plan', async () => {
      const plan = mockFitnessPlans.withMesocycles(3);
      const dbResult = { ...plan, mesocycles: JSON.stringify(plan.mesocycles) } as any;

      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(plan as any);
      expect(result.mesocycles).toHaveLength(3);
    });

    it('handles different program types', async () => {
      const programTypes = ['strength', 'endurance', 'shred', 'hybrid', 'rehab'];
      
      for (const programType of programTypes) {
        const plan = mockFitnessPlans.currentSchemaPlan({ programType });
        const dbResult = { ...plan, mesocycles: JSON.stringify(plan.mesocycles) } as any;
        
        const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
        insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

        const result = await fitnessPlanRepository.insertFitnessPlan(plan as any);

        expect(result.programType).toBe(programType);
      }
    });

    it('handles null overview and goalStatement', async () => {
      const plan = mockFitnessPlans.currentSchemaPlan({ overview: null, goalStatement: null });
      const dbResult = { ...plan, mesocycles: JSON.stringify(plan.mesocycles) } as any;

      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(plan as any);

      expect(result.overview).toBeNull();
      expect(result.goalStatement).toBeNull();
    });

    it('preserves all fields', async () => {
      const plan = mockFitnessPlans.currentSchemaPlan({ programType: 'endurance' });
      const dbResult = { ...plan, mesocycles: JSON.stringify(plan.mesocycles) } as any;

      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(plan as any);

      expect(result.clientId).toBe(plan.clientId);
      expect(result.programType).toBe(plan.programType);
      expect(result.overview).toBe(plan.overview);
      expect(result.goalStatement).toBe(plan.goalStatement);
      expect(result.startDate).toEqual(plan.startDate);
    });

    it('throws when insert fails', async () => {
      const plan = mockFitnessPlans.strengthPlan();
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Insert failed'));

      await expect(fitnessPlanRepository.insertFitnessPlan(plan)).rejects.toThrow('Insert failed');
    });

    it('handles empty mesocycles array', async () => {
      const plan = mockFitnessPlans.currentSchemaPlan({ mesocycles: [] });
      const dbResult = { ...plan, mesocycles: JSON.stringify([]) } as any;

      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(plan as any);
      expect(result.mesocycles).toEqual([]);
    });

    // Removed macrocycle-based tests; schema now uses direct mesocycles array
  });

  describe('JSON serialization', () => {
    it('serializes and deserializes mesocycles JSON', async () => {
      const plan = mockFitnessPlans.currentSchemaPlan({ programType: 'rehab' });
      const serialized = JSON.stringify(plan.mesocycles);

      const dbResult = { ...plan, mesocycles: serialized } as any;

      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(plan as any);

      expect(typeof serialized).toBe('string');
      expect(result.mesocycles).toEqual(plan.mesocycles);
      expect(Array.isArray(result.mesocycles)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      mockDb.insertInto = vi.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const plan = mockFitnessPlans.strengthPlan();

      await expect(fitnessPlanRepository.insertFitnessPlan(plan)).rejects.toThrow('Database connection failed');
    });

    it('should handle constraint violations', async () => {
      const plan = mockFitnessPlans.strengthPlan();
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('duplicate key value violates unique constraint')
      );

      await expect(fitnessPlanRepository.insertFitnessPlan(plan)).rejects.toThrow('duplicate key');
    });

    it('should handle foreign key violations', async () => {
      const plan = mockFitnessPlans.currentSchemaPlan({ clientId: 'non-existent-user' });
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('violates foreign key constraint')
      );

      await expect(fitnessPlanRepository.insertFitnessPlan(plan as any)).rejects.toThrow('foreign key');
    });
  });
});