import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FitnessProfileRepository } from '@/server/repositories/fitnessProfileRepository';
import { FitnessProfile } from '@/server/models/fitnessProfile';
import { Kysely } from 'kysely';
import { DB } from '@/server/models/_types';

describe('FitnessProfileRepository', () => {
  let repository: FitnessProfileRepository;
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock database with chainable methods
    mockDb = {
      selectFrom: vi.fn().mockReturnThis(),
      selectAll: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      executeTakeFirst: vi.fn(),
      updateTable: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      execute: vi.fn(),
      insertInto: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    repository = new FitnessProfileRepository(mockDb as Kysely<DB>);
  });

  describe('getByUserId', () => {
    it('should fetch profile by user ID', async () => {
      const mockProfile = {
        id: '1',
        userId: 'user123',
        profile: { primaryGoal: 'muscle gain' },
        fitnessGoals: 'muscle gain',
        skillLevel: 'intermediate',
        age: 30,
      };

      mockDb.executeTakeFirst.mockResolvedValue(mockProfile);

      const result = await repository.getByUserId('user123');

      expect(mockDb.selectFrom).toHaveBeenCalledWith('fitnessProfiles');
      expect(mockDb.where).toHaveBeenCalledWith('userId', '=', 'user123');
      expect(result).toEqual(mockProfile);
    });

    it('should return null if profile not found', async () => {
      mockDb.executeTakeFirst.mockResolvedValue(undefined);

      const result = await repository.getByUserId('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('getProfile', () => {
    it('should return JSON profile if available', async () => {
      const jsonProfile: FitnessProfile = {
        primaryGoal: 'strength',
        experienceLevel: 'advanced',
        identity: { age: 35 },
      };

      mockDb.executeTakeFirst.mockResolvedValue({
        profile: jsonProfile,
      });

      const result = await repository.getProfile('user123');

      expect(result).toEqual(jsonProfile);
    });

    it('should construct profile from legacy fields if JSON not available', async () => {
      mockDb.executeTakeFirst.mockResolvedValue({
        fitnessGoals: 'weight loss',
        skillLevel: 'beginner',
        exerciseFrequency: '3-4 times a week',
        age: 25,
        gender: 'female',
      });

      const result = await repository.getProfile('user123');

      expect(result).toEqual({
        primaryGoal: 'weight loss',
        experienceLevel: 'beginner',
        availability: { daysPerWeek: 4 },
        identity: { age: 25, gender: 'female' },
        version: 1,
      });
    });

    it('should return empty profile if not found', async () => {
      mockDb.executeTakeFirst.mockResolvedValue(null);

      const result = await repository.getProfile('nonexistent');

      expect(result).toEqual({});
    });

    it('should parse exercise frequency correctly', async () => {
      const testCases = [
        { input: 'daily', expected: 7 },
        { input: '5-6 times a week', expected: 6 },
        { input: '3-4 times a week', expected: 4 },
        { input: '1-2 times a week', expected: 2 },
        { input: 'unknown', expected: 3 },
      ];

      for (const testCase of testCases) {
        mockDb.executeTakeFirst.mockResolvedValue({
          exerciseFrequency: testCase.input,
        });

        const result = await repository.getProfile('user123');
        expect(result.availability?.daysPerWeek).toBe(testCase.expected);
      }
    });
  });

  describe('applyProfilePatch', () => {
    it('should apply patch and update database', async () => {
      const existing: FitnessProfile = {
        primaryGoal: 'muscle gain',
        identity: { age: 30 },
      };

      const patch: Partial<FitnessProfile> = {
        primaryGoal: 'strength',
        availability: { daysPerWeek: 5 },
      };

      // Mock getProfile
      mockDb.executeTakeFirst.mockResolvedValue({ profile: existing });
      mockDb.execute.mockResolvedValue(undefined);

      const result = await repository.applyProfilePatch('user123', patch, {
        source: 'api',
        reason: 'User update',
      });

      expect(mockDb.updateTable).toHaveBeenCalledWith('fitnessProfiles');
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: JSON.stringify({
            primaryGoal: 'strength',
            identity: { age: 30 },
            availability: { daysPerWeek: 5 },
          }),
        })
      );
      expect(result.primaryGoal).toBe('strength');
    });

    it('should record update in ledger when meta provided', async () => {
      mockDb.executeTakeFirst.mockResolvedValue({ profile: {} });
      mockDb.execute.mockResolvedValue(undefined);

      await repository.applyProfilePatch(
        'user123',
        { primaryGoal: 'weight loss' },
        { source: 'sms', reason: 'Chat update' }
      );

      expect(mockDb.insertInto).toHaveBeenCalledWith('profileUpdates');
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          source: 'sms',
          reason: 'Chat update',
        })
      );
    });
  });

  describe('upsertProfile', () => {
    it('should update existing profile', async () => {
      mockDb.executeTakeFirst.mockResolvedValue({ id: '1', userId: 'user123' });
      mockDb.execute.mockResolvedValue(undefined);

      const profile: FitnessProfile = {
        primaryGoal: 'muscle gain',
      };

      const legacyFields = {
        fitnessGoals: 'muscle gain',
        age: 30,
      };

      await repository.upsertProfile('user123', profile, legacyFields);

      expect(mockDb.updateTable).toHaveBeenCalledWith('fitnessProfiles');
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: JSON.stringify(profile),
          fitnessGoals: 'muscle gain',
          age: 30,
        })
      );
    });

    it('should create new profile if not exists', async () => {
      mockDb.executeTakeFirst.mockResolvedValue(null);
      mockDb.execute.mockResolvedValue(undefined);

      const profile: FitnessProfile = {
        primaryGoal: 'strength',
      };

      await repository.upsertProfile('user123', profile);

      expect(mockDb.insertInto).toHaveBeenCalledWith('fitnessProfiles');
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          profile: JSON.stringify(profile),
        })
      );
    });
  });

  describe('getUpdateHistory', () => {
    it('should fetch update history with limit', async () => {
      const updates = [
        {
          id: '1',
          userId: 'user123',
          patch: '{"primaryGoal":"muscle gain"}',
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: 'user123',
          patch: '{"experienceLevel":"intermediate"}',
          createdAt: new Date(),
        },
      ];

      mockDb.execute.mockResolvedValue(updates);

      const result = await repository.getUpdateHistory('user123', 10);

      expect(mockDb.selectFrom).toHaveBeenCalledWith('profileUpdates');
      expect(mockDb.where).toHaveBeenCalledWith('userId', '=', 'user123');
      expect(mockDb.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockDb.limit).toHaveBeenCalledWith(10);
      
      expect(result).toHaveLength(2);
      expect(result[0].patch).toEqual({ primaryGoal: 'muscle gain' });
      expect(result[1].patch).toEqual({ experienceLevel: 'intermediate' });
    });

    it('should use default limit of 50', async () => {
      mockDb.execute.mockResolvedValue([]);

      await repository.getUpdateHistory('user123');

      expect(mockDb.limit).toHaveBeenCalledWith(50);
    });
  });

  describe('deepMerge', () => {
    it('should merge nested objects correctly', () => {
      const repository = new FitnessProfileRepository(mockDb);
      const deepMerge = (repository as any).deepMerge.bind(repository);

      const target = {
        a: 1,
        b: { c: 2, d: 3 },
        e: [1, 2],
      };

      const source = {
        b: { c: 4, f: 5 },
        e: [3, 4],
        g: 6,
      };

      const result = deepMerge(target, source);

      expect(result).toEqual({
        a: 1,
        b: { c: 4, d: 3, f: 5 },
        e: [3, 4],
        g: 6,
      });
    });

    it('should handle null and undefined values', () => {
      const repository = new FitnessProfileRepository(mockDb);
      const deepMerge = (repository as any).deepMerge.bind(repository);

      const target = { a: 1, b: 2 };
      const source = { b: null, c: undefined, d: 3 };

      const result = deepMerge(target, source);

      expect(result).toEqual({
        a: 1,
        b: 2,
        d: 3,
      });
    });
  });
});