import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOnboardingSteps } from '../orchestration/onboardingSteps';
import type { OnboardingSteps } from '../orchestration/onboardingSteps';
import type { UserWithProfile } from '../../models/user';

// Mock date utilities
vi.mock('@/shared/utils/date', () => ({
  now: (tz?: string) => ({
    toJSDate: () => new Date('2026-03-19T09:00:00-04:00'),
    startOf: (unit: string) => ({
      toJSDate: () => new Date('2026-03-19T00:00:00-04:00'),
    }),
  }),
}));

// Mock config
vi.mock('@/shared/config', () => ({
  getProgramConfig: () => ({ defaultProgramId: 'default-program' }),
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
    profile: { id: 'prof-1' },
    ...overrides,
  } as UserWithProfile;
}

function makeMockServices() {
  const user = makeUser();
  return {
    user: {
      getUser: vi.fn().mockResolvedValue(user),
    },
    onboardingData: {
      getSignupData: vi.fn().mockResolvedValue({ goals: 'Get fit', experience: 'beginner' }),
      markCompleted: vi.fn().mockResolvedValue(undefined),
    },
    fitnessProfile: {
      getCurrentProfile: vi.fn().mockResolvedValue(null), // No existing profile
      createFitnessProfile: vi.fn().mockResolvedValue({ id: 'profile-1' }),
    },
    markdown: {
      getPlan: vi.fn().mockResolvedValue(null), // No existing plan
    },
    training: {
      createFitnessPlan: vi.fn().mockResolvedValue({
        id: 'plan-1',
        clientId: 'user-1',
        content: '# Plan',
        startDate: new Date(),
      }),
      prepareMicrocycleForDate: vi.fn().mockResolvedValue({
        microcycle: { id: 'mc-1', content: '# Week 1' },
        wasCreated: true,
      }),
      prepareWorkoutForDate: vi.fn().mockResolvedValue({
        id: 'workout-1',
        message: 'Today: Squats 3x8',
        date: new Date(),
      }),
    },
    onboardingCoordinator: {
      sendOnboardingMessages: vi.fn().mockResolvedValue(true),
    },
    enrollment: {
      getActiveEnrollment: vi.fn().mockResolvedValue(null), // No existing enrollment
      enrollClient: vi.fn().mockResolvedValue({
        programId: 'prog-1',
        programVersionId: 'ver-1',
      }),
    },
    program: {
      getById: vi.fn().mockResolvedValue({
        id: 'prog-1',
        publishedVersionId: 'ver-1',
      }),
    },
    // Stubs for other services that createOnboardingSteps expects
    markdown: {
      getPlan: vi.fn().mockResolvedValue(null),
    },
  } as any;
}

describe('OnboardingSteps', () => {
  let steps: OnboardingSteps;
  let services: ReturnType<typeof makeMockServices>;

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
      await expect(steps.loadData('nonexistent')).rejects.toThrow('User nonexistent not found');
    });

    it('should throw if no signup data found', async () => {
      services.onboardingData.getSignupData.mockResolvedValue(null);
      await expect(steps.loadData('user-1')).rejects.toThrow('No signup data found');
    });
  });

  // ===========================================================================
  // Step 2: getOrCreateProfile
  // ===========================================================================
  describe('getOrCreateProfile', () => {
    const user = makeUser();
    const signupData = { goals: 'Get fit' };

    it('should return existing profile without creating', async () => {
      services.fitnessProfile.getCurrentProfile.mockResolvedValue({ id: 'existing-prof' });

      const result = await steps.getOrCreateProfile(user, signupData as any);

      expect(result.wasCreated).toBe(false);
      expect(services.fitnessProfile.createFitnessProfile).not.toHaveBeenCalled();
    });

    it('should create profile when none exists', async () => {
      const updatedUser = makeUser({ profile: { id: 'new-prof' } as any });
      services.user.getUser.mockResolvedValue(updatedUser);

      const result = await steps.getOrCreateProfile(user, signupData as any);

      expect(result.wasCreated).toBe(true);
      expect(services.fitnessProfile.createFitnessProfile).toHaveBeenCalledWith(user, signupData);
    });

    it('should force create even when profile exists', async () => {
      services.fitnessProfile.getCurrentProfile.mockResolvedValue({ id: 'existing' });
      const updatedUser = makeUser();
      services.user.getUser.mockResolvedValue(updatedUser);

      const result = await steps.getOrCreateProfile(user, signupData as any, true);

      expect(result.wasCreated).toBe(true);
      expect(services.fitnessProfile.getCurrentProfile).not.toHaveBeenCalled();
    });

    it('should throw if user disappears after profile creation', async () => {
      services.user.getUser.mockResolvedValue(null);

      await expect(steps.getOrCreateProfile(user, signupData as any)).rejects.toThrow(
        'User user-1 not found after profile creation'
      );
    });
  });

  // ===========================================================================
  // Step 3: getOrCreatePlan
  // ===========================================================================
  describe('getOrCreatePlan', () => {
    const user = makeUser();
    const signupData = { goals: 'Get fit', programId: undefined } as any;

    it('should return existing plan without creating', async () => {
      services.markdown.getPlan.mockResolvedValue({ id: 'existing-plan' });
      // Need enrollment too
      services.enrollment.getActiveEnrollment.mockResolvedValue({ programId: 'prog-1' });

      const result = await steps.getOrCreatePlan(user, signupData);

      expect(result.wasCreated).toBe(false);
      expect(services.training.createFitnessPlan).not.toHaveBeenCalled();
    });

    it('should create enrollment if none exists', async () => {
      const result = await steps.getOrCreatePlan(user, signupData);

      expect(services.enrollment.enrollClient).toHaveBeenCalledWith(
        'user-1',
        'prog-1',
        expect.objectContaining({ programVersionId: 'ver-1' })
      );
    });

    it('should use signupData programId when provided', async () => {
      const dataWithProgram = { ...signupData, programId: 'custom-prog' };
      services.program.getById.mockResolvedValue({ id: 'custom-prog', publishedVersionId: 'v2' });

      await steps.getOrCreatePlan(user, dataWithProgram);

      expect(services.program.getById).toHaveBeenCalledWith('custom-prog');
    });

    it('should fall back to default program ID', async () => {
      await steps.getOrCreatePlan(user, signupData);
      expect(services.program.getById).toHaveBeenCalledWith('default-program');
    });

    it('should throw if program not found', async () => {
      services.program.getById.mockResolvedValue(null);

      await expect(steps.getOrCreatePlan(user, signupData)).rejects.toThrow('Program default-program not found');
    });

    it('should force create plan even when one exists', async () => {
      services.markdown.getPlan.mockResolvedValue({ id: 'existing' });
      services.enrollment.getActiveEnrollment.mockResolvedValue({ programId: 'prog-1', programVersionId: 'ver-1' });

      const result = await steps.getOrCreatePlan(user, signupData, true);

      expect(result.wasCreated).toBe(true);
      expect(services.training.createFitnessPlan).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Step 4: getOrCreateMicrocycle
  // ===========================================================================
  describe('getOrCreateMicrocycle', () => {
    const user = makeUser();
    const plan = { id: 'plan-1', clientId: 'user-1' } as any;

    it('should create microcycle for current date', async () => {
      const result = await steps.getOrCreateMicrocycle(user, plan);

      expect(result.microcycle.id).toBe('mc-1');
      expect(services.training.prepareMicrocycleForDate).toHaveBeenCalledWith(
        'user-1',
        plan,
        expect.any(Date),
        'America/New_York'
      );
    });

    it('should throw if microcycle creation fails', async () => {
      services.training.prepareMicrocycleForDate.mockResolvedValue({ microcycle: null, wasCreated: false });

      await expect(steps.getOrCreateMicrocycle(user, plan)).rejects.toThrow(
        'Could not get/create microcycle'
      );
    });
  });

  // ===========================================================================
  // Step 5: getOrCreateWorkout
  // ===========================================================================
  describe('getOrCreateWorkout', () => {
    const user = makeUser();
    const microcycle = { id: 'mc-1' } as any;

    it('should create workout for today', async () => {
      const result = await steps.getOrCreateWorkout(user, microcycle);

      expect(result.workout.id).toBe('workout-1');
      expect(result.wasCreated).toBe(true);
      expect(services.training.prepareWorkoutForDate).toHaveBeenCalled();
    });

    it('should throw if workout generation fails', async () => {
      services.training.prepareWorkoutForDate.mockResolvedValue(null);

      await expect(steps.getOrCreateWorkout(user, microcycle)).rejects.toThrow(
        'Failed to generate workout'
      );
    });
  });

  // ===========================================================================
  // Step 6: markCompleted
  // ===========================================================================
  describe('markCompleted', () => {
    it('should call onboardingData.markCompleted', async () => {
      await steps.markCompleted('user-1');
      expect(services.onboardingData.markCompleted).toHaveBeenCalledWith('user-1');
    });
  });

  // ===========================================================================
  // Step 7: sendMessages
  // ===========================================================================
  describe('sendMessages', () => {
    it('should send messages via coordinator and return true', async () => {
      const result = await steps.sendMessages('user-1');

      expect(result).toBe(true);
      expect(services.onboardingCoordinator.sendOnboardingMessages).toHaveBeenCalledWith('user-1');
    });

    it('should return false when coordinator says not ready (waiting for payment)', async () => {
      services.onboardingCoordinator.sendOnboardingMessages.mockResolvedValue(false);

      const result = await steps.sendMessages('user-1');
      expect(result).toBe(false);
    });

    it('should catch errors and return false (non-blocking)', async () => {
      services.onboardingCoordinator.sendOnboardingMessages.mockRejectedValue(new Error('SMS down'));

      const result = await steps.sendMessages('user-1');
      expect(result).toBe(false); // Should not throw
    });
  });
});
