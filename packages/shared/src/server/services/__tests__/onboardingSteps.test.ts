import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOnboardingSteps } from '../orchestration/onboardingSteps';
import type { OnboardingSteps } from '../orchestration/onboardingSteps';
import type { UserWithProfile } from '../../models/user';
import type { FitnessPlan } from '../../models/fitnessPlan';
import type { Microcycle } from '../../models/microcycle';

// Mock date utilities
vi.mock('@/shared/utils/date', () => ({
  now: (tz?: string) => ({
    toJSDate: () => new Date('2026-03-19T09:00:00-04:00'),
    startOf: () => ({
      toISODate: () => '2026-03-19',
      toJSDate: () => new Date('2026-03-19T00:00:00-04:00'),
    }),
  }),
}));

vi.mock('@/shared/config', () => ({
  getProgramConfig: () => ({ defaultProgramId: 'default-program' }),
}));

function makeUser(overrides: Partial<UserWithProfile> = {}): UserWithProfile {
  return {
    id: 'user-1',
    name: 'Test User',
    phone: '+15551234567',
    timezone: 'America/New_York',
    active: true,
    profile: null,
    ...overrides,
  } as UserWithProfile;
}

function makePlan(overrides: Partial<FitnessPlan> = {}): FitnessPlan {
  return {
    id: 'plan-1',
    clientId: 'user-1',
    content: '# Plan\nStrength 3x/week',
    startDate: new Date('2026-03-17'),
    ...overrides,
  } as FitnessPlan;
}

function makeMicrocycle(overrides: Partial<Microcycle> = {}): Microcycle {
  return {
    id: 'mc-1',
    clientId: 'user-1',
    content: '# Week 1',
    startDate: new Date('2026-03-17'),
    ...overrides,
  } as Microcycle;
}

function makeMockServices() {
  return {
    user: {
      getUser: vi.fn().mockResolvedValue(makeUser()),
    },
    onboardingData: {
      getSignupData: vi.fn().mockResolvedValue({ goals: 'Get fit', experience: 'beginner' }),
      markCompleted: vi.fn().mockResolvedValue(undefined),
    },
    fitnessProfile: {
      getCurrentProfile: vi.fn().mockResolvedValue(null),
      createFitnessProfile: vi.fn().mockResolvedValue({ id: 'profile-1' }),
    },
    markdown: {
      getPlan: vi.fn().mockResolvedValue(null),
    },
    training: {
      createFitnessPlan: vi.fn().mockResolvedValue(makePlan()),
      prepareMicrocycleForDate: vi.fn().mockResolvedValue({
        microcycle: makeMicrocycle(),
        wasCreated: true,
      }),
      prepareWorkoutForDate: vi.fn().mockResolvedValue({
        id: 'workout-1',
        message: 'Here is your workout!',
        date: new Date('2026-03-19'),
      }),
    },
    onboardingCoordinator: {
      sendOnboardingMessages: vi.fn().mockResolvedValue(true),
    },
    enrollment: {
      getActiveEnrollment: vi.fn().mockResolvedValue(null),
      enrollClient: vi.fn().mockResolvedValue({
        programId: 'default-program',
        programVersionId: 'v1',
      }),
    },
    program: {
      getById: vi.fn().mockResolvedValue({
        id: 'default-program',
        name: 'AI Fitness',
        publishedVersionId: 'v1',
      }),
    },
  } as any;
}

describe('OnboardingSteps', () => {
  let steps: OnboardingSteps;
  let services: ReturnType<typeof makeMockServices>;
  const user = makeUser();

  beforeEach(() => {
    vi.clearAllMocks();
    services = makeMockServices();
    steps = createOnboardingSteps(services);
  });

  // ===========================================================================
  // Step 1: loadData
  // ===========================================================================
  describe('loadData', () => {
    it('should return user and signup data', async () => {
      const result = await steps.loadData('user-1');
      expect(result.user.id).toBe('user-1');
      expect(result.signupData).toEqual({ goals: 'Get fit', experience: 'beginner' });
    });

    it('should throw if user not found', async () => {
      services.user.getUser.mockResolvedValue(null);
      await expect(steps.loadData('nope')).rejects.toThrow('User nope not found');
    });

    it('should throw if no signup data', async () => {
      services.onboardingData.getSignupData.mockResolvedValue(null);
      await expect(steps.loadData('user-1')).rejects.toThrow('No signup data found');
    });
  });

  // ===========================================================================
  // Step 2: getOrCreateProfile
  // ===========================================================================
  describe('getOrCreateProfile', () => {
    const signupData = { goals: 'Get fit' };

    it('should return existing profile without creating', async () => {
      services.fitnessProfile.getCurrentProfile.mockResolvedValue({ id: 'existing-profile' });

      const result = await steps.getOrCreateProfile(user, signupData as any);
      expect(result.wasCreated).toBe(false);
      expect(services.fitnessProfile.createFitnessProfile).not.toHaveBeenCalled();
    });

    it('should create profile when none exists', async () => {
      const updatedUser = makeUser({ profile: { id: 'new-profile' } as any });
      services.user.getUser.mockResolvedValue(updatedUser);

      const result = await steps.getOrCreateProfile(user, signupData as any);
      expect(result.wasCreated).toBe(true);
      expect(services.fitnessProfile.createFitnessProfile).toHaveBeenCalledWith(user, signupData);
    });

    it('should force create even when profile exists', async () => {
      services.fitnessProfile.getCurrentProfile.mockResolvedValue({ id: 'existing' });
      const updatedUser = makeUser({ profile: { id: 'new-profile' } as any });
      services.user.getUser.mockResolvedValue(updatedUser);

      const result = await steps.getOrCreateProfile(user, signupData as any, true);
      expect(result.wasCreated).toBe(true);
      // Should NOT check for existing profile
      expect(services.fitnessProfile.getCurrentProfile).not.toHaveBeenCalled();
    });

    it('should throw if user not found after profile creation', async () => {
      services.user.getUser.mockResolvedValue(null);
      await expect(steps.getOrCreateProfile(user, signupData as any)).rejects.toThrow('not found after profile creation');
    });
  });

  // ===========================================================================
  // Step 3: getOrCreatePlan
  // ===========================================================================
  describe('getOrCreatePlan', () => {
    const signupData = { goals: 'Get fit' };

    it('should create enrollment and plan for new user', async () => {
      const result = await steps.getOrCreatePlan(user, signupData as any);
      expect(result.wasCreated).toBe(true);
      expect(services.enrollment.enrollClient).toHaveBeenCalled();
      expect(services.training.createFitnessPlan).toHaveBeenCalled();
    });

    it('should skip enrollment if already enrolled', async () => {
      services.enrollment.getActiveEnrollment.mockResolvedValue({
        programId: 'prog-1',
        programVersionId: 'v1',
      });

      await steps.getOrCreatePlan(user, signupData as any);
      expect(services.enrollment.enrollClient).not.toHaveBeenCalled();
    });

    it('should return existing plan without creating', async () => {
      services.enrollment.getActiveEnrollment.mockResolvedValue({ programId: 'p1' });
      services.markdown.getPlan.mockResolvedValue(makePlan());

      const result = await steps.getOrCreatePlan(user, signupData as any);
      expect(result.wasCreated).toBe(false);
      expect(services.training.createFitnessPlan).not.toHaveBeenCalled();
    });

    it('should force create plan even when one exists', async () => {
      services.enrollment.getActiveEnrollment.mockResolvedValue({ programId: 'p1' });
      services.markdown.getPlan.mockResolvedValue(makePlan());

      const result = await steps.getOrCreatePlan(user, signupData as any, true);
      expect(result.wasCreated).toBe(true);
      expect(services.markdown.getPlan).not.toHaveBeenCalled();
    });

    it('should throw if program not found', async () => {
      services.program.getById.mockResolvedValue(null);
      await expect(steps.getOrCreatePlan(user, signupData as any)).rejects.toThrow('not found');
    });

    it('should use signupData.programId when available', async () => {
      const dataWithProgram = { goals: 'Get fit', programId: 'custom-program' };
      services.program.getById.mockResolvedValue({
        id: 'custom-program',
        publishedVersionId: 'v2',
      });

      await steps.getOrCreatePlan(user, dataWithProgram as any);
      expect(services.program.getById).toHaveBeenCalledWith('custom-program');
    });
  });

  // ===========================================================================
  // Step 4: getOrCreateMicrocycle
  // ===========================================================================
  describe('getOrCreateMicrocycle', () => {
    it('should create microcycle via training service', async () => {
      const result = await steps.getOrCreateMicrocycle(user, makePlan());
      expect(result.wasCreated).toBe(true);
      expect(result.microcycle.id).toBe('mc-1');
      expect(services.training.prepareMicrocycleForDate).toHaveBeenCalled();
    });

    it('should throw if microcycle creation fails', async () => {
      services.training.prepareMicrocycleForDate.mockResolvedValue({ microcycle: null });
      await expect(steps.getOrCreateMicrocycle(user, makePlan())).rejects.toThrow('Could not get/create microcycle');
    });

    it('should use existing microcycle when available', async () => {
      services.training.prepareMicrocycleForDate.mockResolvedValue({
        microcycle: makeMicrocycle(),
        wasCreated: false,
      });

      const result = await steps.getOrCreateMicrocycle(user, makePlan());
      expect(result.wasCreated).toBe(false);
    });
  });

  // ===========================================================================
  // Step 5: getOrCreateWorkout
  // ===========================================================================
  describe('getOrCreateWorkout', () => {
    it('should create workout for today', async () => {
      const result = await steps.getOrCreateWorkout(user, makeMicrocycle());
      expect(result.wasCreated).toBe(true);
      expect(result.workout.id).toBe('workout-1');
    });

    it('should throw if workout generation fails', async () => {
      services.training.prepareWorkoutForDate.mockResolvedValue(null);
      await expect(steps.getOrCreateWorkout(user, makeMicrocycle())).rejects.toThrow('Failed to generate workout');
    });
  });

  // ===========================================================================
  // Step 6: markCompleted
  // ===========================================================================
  describe('markCompleted', () => {
    it('should mark onboarding as completed', async () => {
      await steps.markCompleted('user-1');
      expect(services.onboardingData.markCompleted).toHaveBeenCalledWith('user-1');
    });
  });

  // ===========================================================================
  // Step 7: sendMessages
  // ===========================================================================
  describe('sendMessages', () => {
    it('should send onboarding messages and return true', async () => {
      const result = await steps.sendMessages('user-1');
      expect(result).toBe(true);
      expect(services.onboardingCoordinator.sendOnboardingMessages).toHaveBeenCalledWith('user-1');
    });

    it('should return false when waiting for payment', async () => {
      services.onboardingCoordinator.sendOnboardingMessages.mockResolvedValue(false);
      const result = await steps.sendMessages('user-1');
      expect(result).toBe(false);
    });

    it('should not throw on send failure (graceful degradation)', async () => {
      services.onboardingCoordinator.sendOnboardingMessages.mockRejectedValue(new Error('SMS down'));
      const result = await steps.sendMessages('user-1');
      expect(result).toBe(false); // Returns false instead of throwing
    });
  });
});
