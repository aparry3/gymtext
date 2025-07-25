import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { DatabaseMockHelper } from '../../../mocks/database-helpers';
import { FitnessPlanBuilder, mockFitnessPlans, createMacrocycleOverview } from '../../../fixtures/fitnessPlans';
import type { Kysely } from 'kysely';
import type { DB } from '@/server/models/_types';

// Mock the FitnessPlanModel
vi.mock('@/server/models/fitnessPlan', async () => {
  const actual = await vi.importActual('@/server/models/fitnessPlan');
  return {
    ...actual,
    FitnessPlanModel: {
      fromDB: vi.fn((plan) => ({
        ...plan,
        macrocycles: typeof plan.macrocycles === 'string' 
          ? JSON.parse(plan.macrocycles) 
          : plan.macrocycles
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
    it('should insert a fitness plan successfully', async () => {
      const fitnessPlan = mockFitnessPlans.strengthPlan();
      const dbResult = {
        ...fitnessPlan,
        macrocycles: JSON.stringify(fitnessPlan.macrocycles),
      };
      
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(fitnessPlan);

      expect(mockDb.insertInto).toHaveBeenCalledWith('fitnessPlans');
      expect(insertBuilder.values).toHaveBeenCalledWith({
        ...fitnessPlan,
        macrocycles: JSON.stringify(fitnessPlan.macrocycles),
      });
      expect(insertBuilder.returningAll).toHaveBeenCalled();
      expect(result.macrocycles).toEqual(fitnessPlan.macrocycles);
    });

    it('should handle complex macrocycle structures', async () => {
      const complexPlan = mockFitnessPlans.complexPlan();
      const dbResult = {
        ...complexPlan,
        macrocycles: JSON.stringify(complexPlan.macrocycles),
      };
      
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(complexPlan);

      expect(result.macrocycles).toHaveLength(3);
      expect(result.macrocycles[0].name).toBe('Foundation');
      expect(result.macrocycles[1].name).toBe('Development');
      expect(result.macrocycles[2].name).toBe('Peak');
      expect(result.macrocycles[0].mesocycles).toHaveLength(2);
    });

    it('should handle different program types', async () => {
      const programTypes = ['strength', 'endurance', 'shred', 'hybrid', 'rehab'];
      
      for (const programType of programTypes) {
        const plan = new FitnessPlanBuilder()
          .withProgramType(programType)
          .build();
        
        const dbResult = {
          ...plan,
          macrocycles: JSON.stringify(plan.macrocycles),
        };
        
        const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
        insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

        const result = await fitnessPlanRepository.insertFitnessPlan(plan);

        expect(result.programType).toBe(programType);
      }
    });

    it('should handle null overview and goalStatement', async () => {
      const plan = new FitnessPlanBuilder()
        .withOverview(null)
        .withGoalStatement(null)
        .build();
      
      const dbResult = {
        ...plan,
        macrocycles: JSON.stringify(plan.macrocycles),
      };
      
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(plan);

      expect(result.overview).toBeNull();
      expect(result.goalStatement).toBeNull();
    });

    it('should preserve all fitness plan fields', async () => {
      const plan = mockFitnessPlans.endurancePlan();
      const dbResult = {
        ...plan,
        macrocycles: JSON.stringify(plan.macrocycles),
      };
      
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(plan);

      expect(result.id).toBe(plan.id);
      expect(result.clientId).toBe(plan.clientId);
      expect(result.programType).toBe(plan.programType);
      expect(result.overview).toBe(plan.overview);
      expect(result.goalStatement).toBe(plan.goalStatement);
      expect(result.startDate).toEqual(plan.startDate);
      expect(result.createdAt).toEqual(plan.createdAt);
      expect(result.updatedAt).toEqual(plan.updatedAt);
    });

    it('should throw error when insert fails', async () => {
      const plan = mockFitnessPlans.strengthPlan();
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(new Error('Insert failed'));

      await expect(fitnessPlanRepository.insertFitnessPlan(plan)).rejects.toThrow('Insert failed');
    });

    it('should handle empty macrocycles array', async () => {
      const plan = new FitnessPlanBuilder()
        .withMacrocycles([])
        .build();
      
      const dbResult = {
        ...plan,
        macrocycles: JSON.stringify([]),
      };
      
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(plan);

      expect(result.macrocycles).toEqual([]);
    });

    it('should handle deeply nested mesocycle structures', async () => {
      const complexMacrocycle = createMacrocycleOverview({
        name: 'Complex Phase',
        mesocycles: [
          {
            name: 'Week 1-2',
            description: 'Initial phase with high volume',
            durationWeeks: 2,
            phase: 'Volume',
          },
          {
            name: 'Week 3-4',
            description: 'Intensity increase',
            durationWeeks: 2,
            phase: 'Intensity',
          },
          {
            name: 'Week 5',
            description: 'Deload week',
            durationWeeks: 1,
            phase: 'Recovery',
          },
        ],
      });

      const plan = new FitnessPlanBuilder()
        .withMacrocycles([complexMacrocycle])
        .build();
      
      const dbResult = {
        ...plan,
        macrocycles: JSON.stringify(plan.macrocycles),
      };
      
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(plan);

      expect(result.macrocycles[0].mesocycles).toHaveLength(3);
      expect(result.macrocycles[0].mesocycles[2].phase).toBe('Recovery');
    });
  });

  describe('JSON serialization', () => {
    it('should properly serialize and deserialize macrocycles', async () => {
      const plan = mockFitnessPlans.rehabPlan();
      const serializedMacrocycles = JSON.stringify(plan.macrocycles);
      
      const dbResult = {
        ...plan,
        macrocycles: serializedMacrocycles,
      };
      
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(plan);

      expect(typeof serializedMacrocycles).toBe('string');
      expect(result.macrocycles).toEqual(plan.macrocycles);
      expect(Array.isArray(result.macrocycles)).toBe(true);
    });

    it('should handle special characters in macrocycle data', async () => {
      const specialCharPlan = new FitnessPlanBuilder()
        .withMacrocycles([
          {
            name: 'Phase "One"',
            description: 'Description with \'quotes\' and\nnewlines',
            durationWeeks: 4,
            mesocycles: [
              {
                name: 'Week 1/2',
                description: 'Contains: special, characters & symbols!',
                durationWeeks: 2,
                phase: 'Test\\Phase',
              },
            ],
          },
        ])
        .build();
      
      const dbResult = {
        ...specialCharPlan,
        macrocycles: JSON.stringify(specialCharPlan.macrocycles),
      };
      
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockResolvedValue(dbResult);

      const result = await fitnessPlanRepository.insertFitnessPlan(specialCharPlan);

      expect(result.macrocycles[0].name).toBe('Phase "One"');
      expect(result.macrocycles[0].description).toContain('\n');
      expect(result.macrocycles[0].mesocycles[0].name).toBe('Week 1/2');
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
      const plan = new FitnessPlanBuilder()
        .withClientId('non-existent-user')
        .build();
      
      const insertBuilder = dbHelper.mockInsertInto('fitnessPlans');
      insertBuilder.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('violates foreign key constraint')
      );

      await expect(fitnessPlanRepository.insertFitnessPlan(plan)).rejects.toThrow('foreign key');
    });
  });
});