import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIContextService } from '@/server/services/aiContextService';
import { ProfileUpdateService } from '@/server/services/profileUpdateService';
import { FitnessProfileRepository } from '@/server/repositories/fitnessProfileRepository';
import { FitnessProfile, Constraint } from '@/server/models/fitnessProfile';

const mockDb = {
  selectFrom: vi.fn().mockReturnThis(),
  insertInto: vi.fn().mockReturnThis(),
  updateTable: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  execute: vi.fn(),
  executeTakeFirst: vi.fn(),
  selectAll: vi.fn().mockReturnThis(),
};

vi.mock('@/server/connections/postgres/postgres', () => ({
  postgresDb: mockDb,
}));

describe('Profile Performance Tests', () => {
  let aiContextService: AIContextService;
  let profileUpdateService: ProfileUpdateService;
  let profileRepo: FitnessProfileRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    aiContextService = new AIContextService();
    profileUpdateService = new ProfileUpdateService(mockDb as any);
    profileRepo = new FitnessProfileRepository(mockDb as any);
  });

  describe('Large profile handling', () => {
    it('should handle profile with many constraints efficiently', () => {
      const startTime = performance.now();
      
      // Create profile with 50 constraints
      const constraints: Constraint[] = Array.from({ length: 50 }, (_, i) => ({
        id: `constraint-${i}`,
        type: i % 2 === 0 ? 'injury' : 'equipment',
        label: `Constraint ${i}`,
        severity: ['mild', 'moderate', 'severe'][i % 3] as 'mild' | 'moderate' | 'severe',
        status: i < 40 ? 'active' : 'resolved',
        modifications: `Modification for constraint ${i}`,
      }));

      const largeProfile: FitnessProfile = {
        primaryGoal: 'muscle gain',
        constraints,
      };

      // Build context should be fast even with many constraints
      const context = aiContextService.buildAIContext(largeProfile);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(context.facts.constraints).toHaveLength(40); // Only active constraints
      expect(context.prose).toBeDefined();
    });

    it('should handle profile with extensive metrics efficiently', () => {
      const startTime = performance.now();

      // Create profile with many metrics
      const metrics: any = {
        bodyweight: { value: 180, unit: 'lbs', lastUpdated: '2024-01-01' },
        heightCm: 183,
        bodyFatPercent: 15,
        prLifts: {},
      };

      // Add 20 PR lifts
      for (let i = 0; i < 20; i++) {
        metrics.prLifts[`exercise${i}`] = {
          weight: 100 + i * 10,
          unit: 'lbs',
          reps: 5,
          date: '2024-01-01',
        };
      }

      const profile: FitnessProfile = {
        primaryGoal: 'strength',
        metrics,
      };

      const context = aiContextService.buildAIContext(profile);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
      expect(context.facts.metrics?.prLifts).toBeDefined();
      expect(Object.keys(context.facts.metrics?.prLifts || {}).length).toBe(20);
    });

    it('should handle deeply nested profile data', () => {
      const profile: FitnessProfile = {
        primaryGoal: 'muscle gain',
        identity: {
          age: 30,
          gender: 'male',
          height: 180,
          pronouns: 'he/him',
        },
        availability: {
          daysPerWeek: 4,
          minutesPerSession: 60,
          preferredTimes: ['morning', 'evening'],
        },
        preferences: {
          workoutStyle: 'bodybuilding',
          enjoyedExercises: ['squats', 'bench press', 'deadlifts'],
          dislikedExercises: ['burpees', 'running'],
          equipment: ['barbell', 'dumbbells', 'cables'],
          coachingTone: 'motivational',
        },
        equipment: {
          access: 'gym',
          available: ['barbell', 'dumbbells', 'machines', 'cables', 'pullup bar'],
        },
        currentTraining: {
          programName: 'PPL Split',
          weeksCompleted: 8,
          focus: 'hypertrophy',
        },
      };

      const startTime = performance.now();
      const context = aiContextService.buildAIContext(profile);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(20); // Should be very fast
      expect(context.prose).toContain('muscle gain');
      expect(context.prose).toContain('4x/week');
      expect(context.prose).toContain('60 min');
    });
  });

  describe('Update performance', () => {
    it('should handle rapid sequential updates', async () => {
      mockDb.executeTakeFirst.mockResolvedValue({
        profile: { primaryGoal: 'muscle gain' },
      });
      mockDb.execute.mockResolvedValue(undefined);

      const updates = [
        { experienceLevel: 'intermediate' },
        { identity: { age: 30 } },
        { availability: { daysPerWeek: 4 } },
        { metrics: { bodyweight: { value: 180, unit: 'lbs' } } },
      ];

      const startTime = performance.now();
      
      for (const patch of updates) {
        await profileUpdateService.applyPatch('user123', patch, 'test', 'Performance test');
      }
      
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // All updates in under 500ms
      expect(mockDb.updateTable).toHaveBeenCalledTimes(updates.length);
    });

    it('should efficiently merge complex patches', async () => {
      const existingProfile: FitnessProfile = {
        primaryGoal: 'muscle gain',
        identity: { age: 30, gender: 'male' },
        metrics: {
          bodyweight: { value: 180, unit: 'lbs' },
        },
        constraints: [
          { id: '1', type: 'injury', label: 'Back pain', status: 'active' },
        ],
      };

      mockDb.executeTakeFirst.mockResolvedValue({ profile: existingProfile });
      mockDb.execute.mockResolvedValue(undefined);

      const complexPatch: Partial<FitnessProfile> = {
        experienceLevel: 'advanced',
        identity: {
          height: 183,
          pronouns: 'he/him',
        },
        metrics: {
          bodyFatPercent: 12,
          prLifts: {
            benchPress: { weight: 225, unit: 'lbs', reps: 1 },
            squat: { weight: 315, unit: 'lbs', reps: 1 },
          },
        },
        availability: {
          daysPerWeek: 5,
          minutesPerSession: 90,
        },
      };

      const startTime = performance.now();
      const result = await profileUpdateService.applyPatch(
        'user123',
        complexPatch,
        'test',
        'Complex update'
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(result.primaryGoal).toBe('muscle gain'); // Preserved
      expect(result.identity?.age).toBe(30); // Preserved
      expect(result.identity?.height).toBe(183); // Added
      expect(result.metrics?.bodyweight).toBeDefined(); // Preserved
      expect(result.metrics?.bodyFatPercent).toBe(12); // Added
    });

    it('should handle constraint operations efficiently', async () => {
      const profile: FitnessProfile = {
        constraints: Array.from({ length: 20 }, (_, i) => ({
          id: `c${i}`,
          type: 'injury',
          label: `Injury ${i}`,
          status: 'active',
        })),
      };

      mockDb.executeTakeFirst.mockResolvedValue({ profile });
      mockDb.execute.mockResolvedValue(undefined);

      const startTime = performance.now();

      // Add new constraint
      await profileUpdateService.applyOp(
        'user123',
        {
          kind: 'add_constraint',
          constraint: {
            type: 'injury',
            label: 'New injury',
            severity: 'mild',
          },
        },
        'test',
        'Add constraint'
      );

      // Update existing constraint
      await profileUpdateService.applyOp(
        'user123',
        {
          kind: 'update_constraint',
          id: 'c5',
          patch: { severity: 'severe' },
        },
        'test',
        'Update constraint'
      );

      // Resolve constraint
      await profileUpdateService.applyOp(
        'user123',
        {
          kind: 'resolve_constraint',
          id: 'c10',
        },
        'test',
        'Resolve constraint'
      );

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(300);
      expect(mockDb.updateTable).toHaveBeenCalledTimes(3);
    });
  });

  describe('Context generation performance', () => {
    it('should generate deterministic prose quickly', () => {
      const profiles = [
        // Minimal profile
        { primaryGoal: 'weight loss' },
        // Medium profile
        {
          primaryGoal: 'muscle gain',
          experienceLevel: 'intermediate',
          identity: { age: 30, gender: 'male' },
          availability: { daysPerWeek: 4 },
        },
        // Complex profile
        {
          primaryGoal: 'strength',
          experienceLevel: 'advanced',
          identity: { age: 35, gender: 'male', height: 180 },
          availability: { daysPerWeek: 5, minutesPerSession: 90 },
          constraints: Array.from({ length: 10 }, (_, i) => ({
            id: `c${i}`,
            type: 'injury',
            label: `Constraint ${i}`,
            status: 'active',
          })),
          metrics: {
            bodyweight: { value: 200, unit: 'lbs' },
            bodyFatPercent: 15,
          },
          preferences: {
            workoutStyle: 'powerlifting',
            equipment: ['barbell', 'rack', 'bench'],
          },
        },
      ];

      profiles.forEach((profile, index) => {
        const startTime = performance.now();
        const context = aiContextService.buildAIContext(profile as FitnessProfile);
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(10); // Each should be under 10ms
        expect(context.prose).toBeDefined();
        expect(context.prose.length).toBeGreaterThan(0);
        
        // Prose should be deterministic
        const context2 = aiContextService.buildAIContext(profile as FitnessProfile);
        expect(context2.prose).toBe(context.prose);
      });
    });

    it('should handle fact extraction at scale', () => {
      const profileCount = 100;
      const profiles: FitnessProfile[] = Array.from({ length: profileCount }, (_, i) => ({
        primaryGoal: ['muscle gain', 'weight loss', 'strength'][i % 3],
        experienceLevel: ['beginner', 'intermediate', 'advanced'][i % 3],
        identity: {
          age: 20 + (i % 40),
          gender: i % 2 === 0 ? 'male' : 'female',
        },
      }));

      const startTime = performance.now();
      
      const contexts = profiles.map(p => aiContextService.buildAIContext(p));
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / profileCount;

      expect(avgTime).toBeLessThan(5); // Average under 5ms per profile
      expect(contexts).toHaveLength(profileCount);
      contexts.forEach(ctx => {
        expect(ctx.facts).toBeDefined();
        expect(ctx.prose).toBeDefined();
      });
    });
  });

  describe('Memory efficiency', () => {
    it('should not leak memory with repeated updates', async () => {
      mockDb.executeTakeFirst.mockResolvedValue({ profile: {} });
      mockDb.execute.mockResolvedValue(undefined);

      // Simulate 100 updates
      for (let i = 0; i < 100; i++) {
        await profileUpdateService.applyPatch(
          'user123',
          { metrics: { bodyweight: { value: 180 + i, unit: 'lbs' } } },
          'test',
          `Update ${i}`
        );
      }

      // No way to directly test memory in Vitest, but verify operations completed
      expect(mockDb.updateTable).toHaveBeenCalledTimes(100);
    });

    it('should efficiently handle large update history', async () => {
      // Simulate large history
      const history = Array.from({ length: 1000 }, (_, i) => ({
        id: `update-${i}`,
        userId: 'user123',
        patch: JSON.stringify({ test: i }),
        createdAt: new Date(Date.now() - i * 86400000), // Each day back
      }));

      mockDb.execute.mockResolvedValue(history);

      const startTime = performance.now();
      const result = await profileRepo.getUpdateHistory('user123', 1000);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should parse 1000 records quickly
      expect(result).toHaveLength(1000);
    });
  });
});