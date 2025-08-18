import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfileUpdateService } from '@/server/services/profileUpdateService';
import { FitnessProfileRepository } from '@/server/repositories/fitnessProfileRepository';
import { FitnessProfile, ProfileUpdateOp } from '@/server/models/fitnessProfile';
import { Kysely } from 'kysely';
import { DB } from '@/server/models/_types';

// Mock the FitnessProfileRepository
vi.mock('@/server/repositories/fitnessProfileRepository');

describe('ProfileUpdateService', () => {
  let service: ProfileUpdateService;
  let mockDb: Kysely<DB>;
  let mockProfileRepo: FitnessProfileRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock database
    mockDb = {
      insertInto: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue(undefined),
    } as any;

    // Setup service
    service = new ProfileUpdateService(mockDb);
    
    // Get the mocked repository instance
    mockProfileRepo = (service as any).profileRepo;
  });

  describe('applyPatch', () => {
    it('should apply a patch to existing profile', async () => {
      const existingProfile: FitnessProfile = {
        primaryGoal: 'muscle gain',
        experienceLevel: 'intermediate',
        identity: {
          age: 30,
          gender: 'male',
        },
      };

      const patch: Partial<FitnessProfile> = {
        primaryGoal: 'strength',
        availability: {
          daysPerWeek: 5,
        },
      };

      vi.mocked(mockProfileRepo.getProfile).mockResolvedValue(existingProfile);
      vi.mocked(mockProfileRepo.upsertProfile).mockResolvedValue(undefined);

      const result = await service.applyPatch('user123', patch, 'api', 'User updated goals');

      expect(mockProfileRepo.getProfile).toHaveBeenCalledWith('user123');
      expect(mockProfileRepo.upsertProfile).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          primaryGoal: 'strength',
          experienceLevel: 'intermediate',
          identity: { age: 30, gender: 'male' },
          availability: { daysPerWeek: 5 },
        }),
        expect.any(Object)
      );
      
      expect(result.primaryGoal).toBe('strength');
      expect(result.experienceLevel).toBe('intermediate');
    });

    it('should deep merge nested objects', async () => {
      const existingProfile: FitnessProfile = {
        identity: {
          age: 30,
          gender: 'male',
        },
        metrics: {
          bodyweight: {
            value: 180,
            unit: 'lbs',
          },
        },
      };

      const patch: Partial<FitnessProfile> = {
        identity: {
          height: 72,
        },
        metrics: {
          benchPress: {
            value: 225,
            unit: 'lbs',
          },
        },
      };

      vi.mocked(mockProfileRepo.getProfile).mockResolvedValue(existingProfile);
      vi.mocked(mockProfileRepo.upsertProfile).mockResolvedValue(undefined);

      const result = await service.applyPatch('user123', patch, 'api');

      expect(result.identity).toEqual({
        age: 30,
        gender: 'male',
        height: 72,
      });
      expect(result.metrics).toEqual({
        bodyweight: { value: 180, unit: 'lbs' },
        benchPress: { value: 225, unit: 'lbs' },
      });
    });

    it('should record update in ledger', async () => {
      vi.mocked(mockProfileRepo.getProfile).mockResolvedValue({});
      vi.mocked(mockProfileRepo.upsertProfile).mockResolvedValue(undefined);

      const patch = { primaryGoal: 'weight loss' };
      await service.applyPatch('user123', patch, 'sms', 'From conversation');

      expect(mockDb.insertInto).toHaveBeenCalledWith('profileUpdates');
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          patch: JSON.stringify(patch),
          source: 'sms',
          reason: 'From conversation',
        })
      );
    });
  });

  describe('applyOp', () => {
    it('should add a new constraint', async () => {
      const existingProfile: FitnessProfile = {
        constraints: [],
      };

      const op: ProfileUpdateOp = {
        kind: 'add_constraint',
        constraint: {
          type: 'injury',
          label: 'Knee pain',
          severity: 'mild',
          modifications: 'Avoid jumping',
        },
      };

      vi.mocked(mockProfileRepo.getProfile).mockResolvedValue(existingProfile);
      vi.mocked(mockProfileRepo.upsertProfile).mockResolvedValue(undefined);

      const result = await service.applyOp('user123', op, 'api');

      expect(result.constraints).toHaveLength(1);
      expect(result.constraints![0]).toMatchObject({
        type: 'injury',
        label: 'Knee pain',
        severity: 'mild',
        status: 'active',
      });
      expect(result.constraints![0].id).toBeDefined();
    });

    it('should update an existing constraint', async () => {
      const existingProfile: FitnessProfile = {
        constraints: [
          {
            id: 'constraint1',
            type: 'injury',
            label: 'Back pain',
            severity: 'moderate',
            status: 'active',
          },
        ],
      };

      const op: ProfileUpdateOp = {
        kind: 'update_constraint',
        id: 'constraint1',
        patch: {
          severity: 'mild',
          modifications: 'Can do light deadlifts',
        },
      };

      vi.mocked(mockProfileRepo.getProfile).mockResolvedValue(existingProfile);
      vi.mocked(mockProfileRepo.upsertProfile).mockResolvedValue(undefined);

      const result = await service.applyOp('user123', op, 'api');

      expect(result.constraints).toHaveLength(1);
      expect(result.constraints![0]).toMatchObject({
        id: 'constraint1',
        severity: 'mild',
        modifications: 'Can do light deadlifts',
      });
    });

    it('should resolve a constraint', async () => {
      const existingProfile: FitnessProfile = {
        constraints: [
          {
            id: 'constraint1',
            type: 'injury',
            label: 'Back pain',
            status: 'active',
          },
        ],
      };

      const op: ProfileUpdateOp = {
        kind: 'resolve_constraint',
        id: 'constraint1',
        endDate: '2024-01-15',
      };

      vi.mocked(mockProfileRepo.getProfile).mockResolvedValue(existingProfile);
      vi.mocked(mockProfileRepo.upsertProfile).mockResolvedValue(undefined);

      const result = await service.applyOp('user123', op, 'api');

      expect(result.constraints![0]).toMatchObject({
        id: 'constraint1',
        status: 'resolved',
        endDate: '2024-01-15',
      });
    });

    it('should set a value by JSON pointer', async () => {
      const existingProfile: FitnessProfile = {
        metrics: {
          bodyweight: {
            value: 180,
            unit: 'lbs',
          },
        },
      };

      const op: ProfileUpdateOp = {
        kind: 'set',
        path: '/metrics/bodyweight/value',
        value: 175,
      };

      vi.mocked(mockProfileRepo.getProfile).mockResolvedValue(existingProfile);
      vi.mocked(mockProfileRepo.upsertProfile).mockResolvedValue(undefined);

      const result = await service.applyOp('user123', op, 'api');

      expect(result.metrics?.bodyweight?.value).toBe(175);
    });

    it('should throw error for unknown operation', async () => {
      const op = {
        kind: 'unknown_op',
      } as any;

      vi.mocked(mockProfileRepo.getProfile).mockResolvedValue({});

      await expect(service.applyOp('user123', op, 'api')).rejects.toThrow(
        'Unknown operation kind: unknown_op'
      );
    });
  });

  describe('getProfileWithContext', () => {
    it('should return profile with AI context', async () => {
      const profile: FitnessProfile = {
        primaryGoal: 'muscle gain',
        experienceLevel: 'intermediate',
      };

      vi.mocked(mockProfileRepo.getProfile).mockResolvedValue(profile);

      const result = await service.getProfileWithContext('user123');

      expect(result.profile).toEqual(profile);
      expect(result.context).toHaveProperty('facts');
      expect(result.context).toHaveProperty('prose');
      expect(result.context.facts).toBeDefined();
      expect(typeof result.context.prose).toBe('string');
    });
  });
});