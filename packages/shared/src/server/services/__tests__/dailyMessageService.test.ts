import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDailyMessageService } from '../orchestration/dailyMessageService';
import type { DailyMessageServiceInstance } from '../orchestration/dailyMessageService';
import type { UserWithProfile } from '../../models/user';

// Mock inngest
vi.mock('@/server/connections/inngest/client', () => ({
  inngest: {
    send: vi.fn().mockResolvedValue({ ids: ['evt-123'] }),
  },
}));

// Mock date utilities
vi.mock('@/shared/utils/date', () => ({
  now: (tz?: string) => {
    const { DateTime } = require('luxon');
    return DateTime.fromISO('2026-03-18T09:00:00', { zone: tz || 'America/New_York' });
  },
}));

// Mock config
vi.mock('@/shared/config', () => ({
  getUrlsConfig: () => ({ publicBaseUrl: 'https://gymtext.co', baseUrl: 'https://gymtext.co' }),
  getMessagingConfig: () => ({}),
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
    preferredSendHour: 8,
    messagingOptIn: true,
    fitnessProfile: null,
    ...overrides,
  } as UserWithProfile;
}

function makeMockDeps() {
  return {
    user: {
      getUser: vi.fn().mockResolvedValue(makeUser()),
      getUsersForHour: vi.fn().mockResolvedValue([makeUser()]),
    },
    messagingOrchestrator: {
      queueMessages: vi.fn().mockResolvedValue({
        messageIds: ['msg-1'],
        queueEntryIds: ['q-1'],
      }),
    },
    dayConfig: {
      getImageUrlForDate: vi.fn().mockResolvedValue(null),
    },
    training: {
      prepareWorkoutForDate: vi.fn().mockResolvedValue({
        id: 'workout-1',
        message: '💪 Today: Squats 3x8, Bench 3x8',
        date: '2026-03-18',
      }),
      regenerateWorkoutMessage: vi.fn().mockResolvedValue('Regenerated workout message'),
    },
    message: {
      findUserIdsWithOutboundMessagesForDates: vi.fn().mockResolvedValue(new Set()),
    },
    workoutInstance: {
      getByUserAndDate: vi.fn().mockResolvedValue({
        id: 'wi-1',
        message: '💪 Today: Squats 3x8, Bench 3x8',
        date: '2026-03-18',
      }),
    },
  } as any;
}

describe('DailyMessageService', () => {
  let service: DailyMessageServiceInstance;
  let deps: ReturnType<typeof makeMockDeps>;

  beforeEach(() => {
    vi.clearAllMocks();
    deps = makeMockDeps();
    service = createDailyMessageService(deps);
  });

  describe('scheduleMessagesForHour', () => {
    it('should schedule messages for eligible users', async () => {
      const result = await service.scheduleMessagesForHour(13); // 13 UTC = 9 AM ET
      expect(result.scheduled).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should filter out users who already received today\'s message', async () => {
      deps.message.findUserIdsWithOutboundMessagesForDates.mockResolvedValue(new Set(['user-1']));
      const result = await service.scheduleMessagesForHour(13);
      expect(result.scheduled).toBe(0);
    });

    it('should return empty result when no candidate users', async () => {
      deps.user.getUsersForHour.mockResolvedValue([]);
      const result = await service.scheduleMessagesForHour(13);
      expect(result.scheduled).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should handle multiple users', async () => {
      deps.user.getUsersForHour.mockResolvedValue([
        makeUser({ id: 'user-1' }),
        makeUser({ id: 'user-2' }),
        makeUser({ id: 'user-3' }),
      ]);
      const { inngest } = await import('@/server/connections/inngest/client');
      (inngest.send as ReturnType<typeof vi.fn>).mockResolvedValue({ ids: ['e1', 'e2', 'e3'] });

      const result = await service.scheduleMessagesForHour(13);
      expect(result.scheduled).toBe(3);
    });
  });

  describe('sendDailyMessage', () => {
    it('should send workout message to user', async () => {
      const user = makeUser();
      const result = await service.sendDailyMessage(user);
      expect(result.success).toBe(true);
      expect(result.userId).toBe('user-1');
      expect(deps.messagingOrchestrator.queueMessages).toHaveBeenCalled();
    });

    it('should generate workout on-demand if none exists', async () => {
      deps.workoutInstance.getByUserAndDate.mockResolvedValue(null);
      const user = makeUser();
      const result = await service.sendDailyMessage(user);
      expect(result.success).toBe(true);
      expect(deps.training.prepareWorkoutForDate).toHaveBeenCalled();
    });

    it('should return failure if workout generation fails', async () => {
      deps.workoutInstance.getByUserAndDate.mockResolvedValue(null);
      deps.training.prepareWorkoutForDate.mockResolvedValue(null);
      const user = makeUser();
      const result = await service.sendDailyMessage(user);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not generate workout');
    });

    it('should skip SMS for users without messaging consent', async () => {
      const user = makeUser({ messagingOptIn: false });
      const result = await service.sendDailyMessage(user);
      expect(result.success).toBe(true);
      expect(deps.messagingOrchestrator.queueMessages).not.toHaveBeenCalled();
    });

    it('should include custom day image if configured', async () => {
      deps.dayConfig.getImageUrlForDate.mockResolvedValue('https://example.com/custom.jpg');
      const user = makeUser();
      await service.sendDailyMessage(user);
      expect(deps.messagingOrchestrator.queueMessages).toHaveBeenCalledWith(
        user,
        [expect.objectContaining({ mediaUrls: ['https://example.com/custom.jpg'] })],
        'daily'
      );
    });

    it('should catch errors and return failure', async () => {
      deps.messagingOrchestrator.queueMessages.mockRejectedValue(new Error('Twilio down'));
      const user = makeUser();
      const result = await service.sendDailyMessage(user);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Twilio down');
    });
  });

  describe('checkUserEligibility', () => {
    it('should return eligible for users past their send hour', async () => {
      // User prefers 8 AM, current time is 9 AM
      const result = await service.checkUserEligibility('user-1');
      expect(result.eligible).toBe(true);
    });

    it('should return ineligible if user not found', async () => {
      deps.user.getUser.mockResolvedValue(null);
      const result = await service.checkUserEligibility('missing');
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('not found');
    });

    it('should return ineligible if already sent today', async () => {
      deps.message.findUserIdsWithOutboundMessagesForDates.mockResolvedValue(new Set(['user-1']));
      const result = await service.checkUserEligibility('user-1');
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('already has a daily message');
    });
  });

  describe('triggerForUser', () => {
    it('should trigger Inngest event for eligible user', async () => {
      const result = await service.triggerForUser('user-1', { forceImmediate: false });
      expect(result.success).toBe(true);
      expect(result.scheduled).toBe(true);
      expect(result.inngestEventId).toBeDefined();
    });

    it('should force trigger even for ineligible user', async () => {
      deps.message.findUserIdsWithOutboundMessagesForDates.mockResolvedValue(new Set(['user-1']));
      const result = await service.triggerForUser('user-1', { forceImmediate: true });
      expect(result.success).toBe(true);
      expect(result.scheduled).toBe(true);
    });

    it('should not trigger if user not found', async () => {
      deps.user.getUser.mockResolvedValue(null);
      const result = await service.triggerForUser('missing', { forceImmediate: false });
      expect(result.success).toBe(false);
      expect(result.scheduled).toBe(false);
    });
  });
});
