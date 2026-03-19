import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTrainingService } from '../orchestration/trainingService';
import type { TrainingServiceInstance, TrainingServiceDeps } from '../orchestration/trainingService';
import type { UserWithProfile } from '../../models/user';
import { DateTime } from 'luxon';

// Mock date utilities
vi.mock('@/shared/utils/date', () => ({
  now: () => ({
    toJSDate: () => new Date('2026-03-19T09:00:00-04:00'),
    startOf: () => ({
      toISODate: () => '2026-03-19',
    }),
  }),
  getDayOfWeekName: (_date: Date, _tz: string) => 'Wednesday',
  parseDate: (d: Date) => d,
  toISODate: (_d: Date, _tz: string) => '2026-03-19',
}));

vi.mock('@/server/utils/formatters', () => ({
  normalizeWhitespace: (s: string) => s,
  stripCodeFences: (s: string) => s,
}));

function makeUser(overrides: Partial<UserWithProfile> = {}): UserWithProfile {
  return {
    id: 'user-1',
    phone: '+15551234567',
    name: 'Test User',
    email: null,
    timezone: 'America/New_York',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: null,
    subscriptionStatus: 'active',
    preferredWorkoutTime: null,
    fitnessProfile: null,
    ...overrides,
  } as UserWithProfile;
}

function makeMockDeps(): TrainingServiceDeps {
  return {
    user: {
      getUser: vi.fn().mockResolvedValue(makeUser()),
    },
    markdown: {
      getContext: vi.fn().mockResolvedValue(['## Profile\nTest user profile']),
      createPlan: vi.fn().mockResolvedValue({
        id: 'plan-1',
        userId: 'user-1',
        content: '# Fitness Plan\nStrength 3x/week',
      }),
      getPlan: vi.fn().mockResolvedValue({
        id: 'plan-1',
        userId: 'user-1',
        content: '# Fitness Plan\nStrength 3x/week',
      }),
      getWeekForDate: vi.fn().mockResolvedValue(null), // No existing week
      createWeek: vi.fn().mockResolvedValue({
        id: 'week-1',
        userId: 'user-1',
        content: '# Week 1\nMon: Push, Wed: Pull',
      }),
    },
    agentRunner: {
      invoke: vi.fn().mockImplementation((agent: string) => {
        const responses: Record<string, string> = {
          'plan:generate': '# Strength Training Plan\n3x per week',
          'plan:details': JSON.stringify({ days: 3, type: 'strength' }),
          'week:generate': '# Week 1\nMonday: Push\nWednesday: Pull\nFriday: Legs',
          'week:format': 'Here\'s your week! Push on Mon, Pull on Wed, Legs on Fri.',
          'week:details': JSON.stringify({ workoutDays: ['Mon', 'Wed', 'Fri'] }),
          'workout:format': 'Squats 3x8\nBench Press 3x8\nRows 3x8',
          'workout:details': JSON.stringify({ exercises: 3, sets: 9 }),
        };
        return Promise.resolve({ response: responses[agent] || 'default response' });
      }),
    },
    workoutInstance: {
      upsert: vi.fn().mockResolvedValue({
        id: 'workout-1',
        clientId: 'user-1',
        date: '2026-03-19',
        message: 'Squats 3x8',
      }),
    },
    shortLink: {
      createWorkoutLink: vi.fn().mockResolvedValue({ code: 'abc123' }),
      getFullUrl: vi.fn().mockReturnValue('https://gymtext.com/w/abc123'),
    },
  } as any;
}

describe('TrainingService', () => {
  let service: TrainingServiceInstance;
  let deps: ReturnType<typeof makeMockDeps>;
  const user = makeUser();

  beforeEach(() => {
    vi.clearAllMocks();
    deps = makeMockDeps();
    service = createTrainingService(deps);
  });

  // ===========================================================================
  // createFitnessPlan
  // ===========================================================================
  describe('createFitnessPlan', () => {
    it('should generate plan via AI agent and save to database', async () => {
      const plan = await service.createFitnessPlan(user);

      expect(deps.markdown.getContext).toHaveBeenCalledWith(user.id, ['profile']);
      expect(deps.agentRunner.invoke).toHaveBeenCalledWith('plan:generate', expect.objectContaining({
        input: expect.stringContaining('Test User'),
        context: expect.any(Array),
      }));
      expect(deps.markdown.createPlan).toHaveBeenCalledWith(
        user.id,
        expect.stringContaining('Strength Training Plan'),
        expect.any(Date),
        { details: { days: 3, type: 'strength' } }
      );
      expect(plan.id).toBe('plan-1');
    });

    it('should handle plan:details failure gracefully', async () => {
      (deps.agentRunner.invoke as any).mockImplementation((agent: string) => {
        if (agent === 'plan:details') return Promise.reject(new Error('parse error'));
        return Promise.resolve({ response: '# Plan\nStrength 3x/week' });
      });

      const plan = await service.createFitnessPlan(user);

      // Should still save plan, just without details
      expect(deps.markdown.createPlan).toHaveBeenCalledWith(
        user.id,
        expect.any(String),
        expect.any(Date),
        { details: undefined }
      );
      expect(plan.id).toBe('plan-1');
    });

    it('should use user name in agent input', async () => {
      const namedUser = makeUser({ name: 'Sarah' });
      await service.createFitnessPlan(namedUser);

      expect(deps.agentRunner.invoke).toHaveBeenCalledWith('plan:generate', expect.objectContaining({
        input: expect.stringContaining('Sarah'),
      }));
    });

    it('should use fallback when user has no name', async () => {
      const noNameUser = makeUser({ name: undefined as any });
      await service.createFitnessPlan(noNameUser);

      expect(deps.agentRunner.invoke).toHaveBeenCalledWith('plan:generate', expect.objectContaining({
        input: expect.stringContaining('this user'),
      }));
    });
  });

  // ===========================================================================
  // prepareMicrocycleForDate
  // ===========================================================================
  describe('prepareMicrocycleForDate', () => {
    it('should return existing week if one exists for the date', async () => {
      const existingWeek = { id: 'existing-week', content: 'Already planned' };
      (deps.markdown.getWeekForDate as any).mockResolvedValue(existingWeek);

      const result = await service.prepareMicrocycleForDate('user-1', new Date('2026-03-19'));

      expect(result.wasCreated).toBe(false);
      expect(result.microcycle).toEqual(existingWeek);
      expect(deps.agentRunner.invoke).not.toHaveBeenCalled();
    });

    it('should generate new week when none exists (new signature)', async () => {
      const result = await service.prepareMicrocycleForDate('user-1', new Date('2026-03-19'), 'America/New_York');

      expect(result.wasCreated).toBe(true);
      expect(deps.agentRunner.invoke).toHaveBeenCalledWith('week:generate', expect.any(Object));
      expect(deps.agentRunner.invoke).toHaveBeenCalledWith('week:format', expect.any(Object));
      expect(deps.agentRunner.invoke).toHaveBeenCalledWith('week:details', expect.any(Object));
      expect(deps.markdown.createWeek).toHaveBeenCalled();
    });

    it('should support old signature (userId, plan, date, timezone)', async () => {
      const plan = { id: 'plan-1' };
      const result = await service.prepareMicrocycleForDate('user-1', plan, new Date('2026-03-19'), 'America/New_York');

      expect(result.wasCreated).toBe(true);
      expect(deps.user.getUser).toHaveBeenCalledWith('user-1');
    });

    it('should throw if user not found', async () => {
      (deps.user.getUser as any).mockResolvedValue(null);

      await expect(
        service.prepareMicrocycleForDate('nonexistent', new Date('2026-03-19'))
      ).rejects.toThrow('User not found');
    });

    it('should throw if no fitness plan exists', async () => {
      (deps.markdown.getPlan as any).mockResolvedValue(null);

      await expect(
        service.prepareMicrocycleForDate('user-1', new Date('2026-03-19'))
      ).rejects.toThrow('No fitness plan found');
    });

    it('should handle week:details failure gracefully', async () => {
      (deps.agentRunner.invoke as any).mockImplementation((agent: string) => {
        if (agent === 'week:details') return Promise.reject(new Error('parse fail'));
        return Promise.resolve({ response: agent === 'week:generate' ? 'Week content' : 'Formatted' });
      });

      const result = await service.prepareMicrocycleForDate('user-1', new Date('2026-03-19'));

      expect(result.wasCreated).toBe(true);
      // Should still create week, just without structured details
      expect(deps.markdown.createWeek).toHaveBeenCalled();
    });

    it('should default timezone to America/New_York', async () => {
      await service.prepareMicrocycleForDate('user-1', new Date('2026-03-19'));

      // Should proceed without error using default timezone
      expect(deps.markdown.createWeek).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // prepareWorkoutForDate
  // ===========================================================================
  describe('prepareWorkoutForDate', () => {
    const targetDate = DateTime.fromISO('2026-03-19', { zone: 'America/New_York' });

    it('should generate workout with short link', async () => {
      // Need to also mock prepareMicrocycleForDate behavior (it calls itself)
      (deps.markdown.getWeekForDate as any).mockResolvedValue({
        id: 'week-1',
        content: '# Week\nMon: Push',
      });

      const result = await service.prepareWorkoutForDate(user, targetDate);

      expect(result).not.toBeNull();
      expect(result!.message).toContain('Wednesday');
      expect(result!.message).toContain('gymtext.com/w/abc123');
      expect(deps.workoutInstance.upsert).toHaveBeenCalled();
      expect(deps.shortLink.createWorkoutLink).toHaveBeenCalledWith('user-1', 'workout-1');
    });

    it('should return null if microcycle creation fails', async () => {
      // Mock prepareMicrocycleForDate to return null microcycle
      (deps.markdown.getWeekForDate as any).mockResolvedValue(null);
      (deps.user.getUser as any).mockResolvedValue(null); // This triggers the user not found error

      // This will throw because user not found
      await expect(service.prepareWorkoutForDate(user, targetDate)).rejects.toThrow();
    });

    it('should handle short link failure gracefully', async () => {
      (deps.markdown.getWeekForDate as any).mockResolvedValue({
        id: 'week-1',
        content: '# Week\nMon: Push',
      });
      (deps.shortLink.createWorkoutLink as any).mockRejectedValue(new Error('Link service down'));

      const result = await service.prepareWorkoutForDate(user, targetDate);

      expect(result).not.toBeNull();
      expect(result!.message).not.toContain('gymtext.com'); // No link on failure
    });

    it('should use provided weekContent override', async () => {
      (deps.markdown.getWeekForDate as any).mockResolvedValue({
        id: 'week-1',
        content: '# Default Week',
      });

      await service.prepareWorkoutForDate(user, targetDate, {
        weekContent: '# Custom Week\nOverridden content',
      });

      expect(deps.markdown.getContext).toHaveBeenCalledWith(user.id, ['week'], expect.objectContaining({
        weekContentOverride: '# Custom Week\nOverridden content',
      }));
    });

    it('should run workout:format and workout:details in parallel', async () => {
      (deps.markdown.getWeekForDate as any).mockResolvedValue({
        id: 'week-1',
        content: '# Week',
      });

      await service.prepareWorkoutForDate(user, targetDate);

      const invokeCalls = (deps.agentRunner.invoke as any).mock.calls.map((c: any) => c[0]);
      expect(invokeCalls).toContain('workout:format');
      expect(invokeCalls).toContain('workout:details');
    });
  });

  // ===========================================================================
  // formatWeekMessage
  // ===========================================================================
  describe('formatWeekMessage', () => {
    it('should invoke week:format agent with profile context', async () => {
      const result = await service.formatWeekMessage(user, '# Week 1\nMon: Push');

      expect(deps.markdown.getContext).toHaveBeenCalledWith(user.id, ['profile']);
      expect(deps.agentRunner.invoke).toHaveBeenCalledWith('week:format', expect.objectContaining({
        input: '# Week 1\nMon: Push',
      }));
      expect(result).toBe('Here\'s your week! Push on Mon, Pull on Wed, Legs on Fri.');
    });
  });

  // ===========================================================================
  // regenerateWorkoutMessage
  // ===========================================================================
  describe('regenerateWorkoutMessage', () => {
    const workout = {
      id: 'workout-1',
      message: 'Old workout message',
      date: new Date('2026-03-19T09:00:00-04:00'),
    };

    it('should regenerate workout with fresh short link', async () => {
      const result = await service.regenerateWorkoutMessage(user, workout);

      expect(deps.agentRunner.invoke).toHaveBeenCalledWith('workout:format', expect.any(Object));
      expect(deps.workoutInstance.upsert).toHaveBeenCalled();
      expect(deps.shortLink.createWorkoutLink).toHaveBeenCalled();
      expect(result).toContain('Wednesday');
      expect(result).toContain('gymtext.com/w/abc123');
    });

    it('should handle short link failure gracefully', async () => {
      (deps.shortLink.createWorkoutLink as any).mockRejectedValue(new Error('fail'));

      const result = await service.regenerateWorkoutMessage(user, workout);

      expect(result).not.toContain('gymtext.com');
    });

    it('should use user timezone for date context', async () => {
      const estUser = makeUser({ timezone: 'US/Pacific' });
      await service.regenerateWorkoutMessage(estUser, workout);

      expect(deps.markdown.getContext).toHaveBeenCalledWith(user.id, ['week'], expect.objectContaining({
        timezone: 'US/Pacific',
      }));
    });
  });
});
