import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOnboardingService } from '../orchestration/onboardingService';
import type { OnboardingServiceInstance } from '../orchestration/onboardingService';
import type { UserWithProfile } from '../../models/user';

// Mock date utilities
vi.mock('@/shared/utils/date', () => ({
  now: (tz?: string) => ({
    toJSDate: () => new Date('2026-03-18T09:00:00-04:00'),
    startOf: () => ({
      toISODate: () => '2026-03-18',
    }),
  }),
  getDayOfWeek: () => 'Wednesday',
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

function makeMockDeps() {
  return {
    markdown: {
      getPlan: vi.fn().mockResolvedValue({
        id: 'plan-1',
        userId: 'user-1',
        content: '# Fitness Plan\n\nStrength training 3x/week',
      }),
    },
    training: {
      createFitnessPlan: vi.fn().mockResolvedValue(undefined),
      prepareMicrocycleForDate: vi.fn().mockResolvedValue({
        microcycle: {
          id: 'mc-1',
          content: '# Week 1\n\nMon: Push, Wed: Pull, Fri: Legs',
        },
      }),
      prepareWorkoutForDate: vi.fn().mockResolvedValue({
        id: 'workout-1',
        message: 'Here is your workout for today!',
      }),
    },
    workoutInstance: {
      getByUserAndDate: vi.fn().mockResolvedValue({
        id: 'wi-1',
        message: '💪 Today\'s Workout:\n\nSquats 3x8\nBench Press 3x8',
      }),
    },
    messagingOrchestrator: {
      queueMessages: vi.fn().mockResolvedValue({
        messageIds: ['msg-1', 'msg-2'],
        queueEntryIds: ['q-1', 'q-2'],
      }),
      queueMessage: vi.fn().mockResolvedValue({
        messageId: 'msg-1',
        queueEntryId: 'q-1',
      }),
    },
    messagingAgent: {
      generatePlanMicrocycleCombinedMessage: vi.fn().mockResolvedValue(
        'Here\'s your personalized training plan for this week!'
      ),
    },
  } as any;
}

describe('OnboardingService', () => {
  let service: OnboardingServiceInstance;
  let deps: ReturnType<typeof makeMockDeps>;
  const user = makeUser();

  beforeEach(() => {
    vi.clearAllMocks();
    deps = makeMockDeps();
    service = createOnboardingService(deps);
  });

  describe('createFitnessPlan', () => {
    it('should call training service to create a plan', async () => {
      await service.createFitnessPlan(user);
      expect(deps.training.createFitnessPlan).toHaveBeenCalledWith(user);
    });

    it('should propagate errors from training service', async () => {
      deps.training.createFitnessPlan.mockRejectedValue(new Error('LLM timeout'));
      await expect(service.createFitnessPlan(user)).rejects.toThrow('LLM timeout');
    });
  });

  describe('createFirstMicrocycle', () => {
    it('should create microcycle from existing plan', async () => {
      await service.createFirstMicrocycle(user);
      expect(deps.markdown.getPlan).toHaveBeenCalledWith(user.id);
      expect(deps.training.prepareMicrocycleForDate).toHaveBeenCalled();
    });

    it('should throw if no plan exists', async () => {
      deps.markdown.getPlan.mockResolvedValue(null);
      await expect(service.createFirstMicrocycle(user)).rejects.toThrow('No fitness plan found');
    });

    it('should throw if microcycle creation fails', async () => {
      deps.training.prepareMicrocycleForDate.mockResolvedValue({ microcycle: null });
      await expect(service.createFirstMicrocycle(user)).rejects.toThrow('Failed to create first microcycle');
    });
  });

  describe('createFirstWorkout', () => {
    it('should create workout for today', async () => {
      await service.createFirstWorkout(user);
      expect(deps.training.prepareWorkoutForDate).toHaveBeenCalledWith(user, expect.anything());
    });

    it('should throw if workout creation fails', async () => {
      deps.training.prepareWorkoutForDate.mockResolvedValue(null);
      await expect(service.createFirstWorkout(user)).rejects.toThrow('Failed to create first workout');
    });
  });

  describe('sendWelcomeMessage', () => {
    it('should queue welcome message', async () => {
      await service.sendWelcomeMessage(user);
      expect(deps.messagingOrchestrator.queueMessages).toHaveBeenCalledWith(
        user,
        [{ content: expect.stringContaining('') }], // WELCOME_MESSAGE constant
        'onboarding'
      );
    });

    it('should not throw on failure (non-blocking)', async () => {
      deps.messagingOrchestrator.queueMessages.mockRejectedValue(new Error('Queue full'));
      // Should not throw
      await service.sendWelcomeMessage(user);
    });
  });

  describe('sendOnboardingMessages', () => {
    it('should send plan summary + workout messages', async () => {
      await service.sendOnboardingMessages(user);
      expect(deps.messagingAgent.generatePlanMicrocycleCombinedMessage).toHaveBeenCalled();
      expect(deps.messagingOrchestrator.queueMessages).toHaveBeenCalledWith(
        user,
        expect.arrayContaining([
          expect.objectContaining({ content: expect.any(String) }),
          expect.objectContaining({ content: expect.any(String) }),
        ]),
        'onboarding'
      );
    });

    it('should throw if plan is missing', async () => {
      deps.markdown.getPlan.mockResolvedValue(null);
      await expect(service.sendOnboardingMessages(user)).rejects.toThrow('No fitness plan found');
    });

    it('should throw if workout is missing', async () => {
      deps.workoutInstance.getByUserAndDate.mockResolvedValue(null);
      await expect(service.sendOnboardingMessages(user)).rejects.toThrow('No workout found');
    });
  });
});
