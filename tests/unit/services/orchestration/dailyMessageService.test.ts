/**
 * Unit & Integration Tests for DailyMessageService
 *
 * Tests the core scheduling, eligibility, and workout retrieval logic
 * of the daily message system using mocked dependencies.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import type { UserWithProfile } from '../../../../packages/shared/src/server/models/user';
import type {
  DailyMessageServiceDeps,
  DailyMessageServiceInstance,
} from '../../../../packages/shared/src/server/services/orchestration/dailyMessageService';

// ---------------------------------------------------------------------------
// Controllable time mock — set `mockNow` before each test
// ---------------------------------------------------------------------------
let mockNow: DateTime = DateTime.fromObject(
  { year: 2026, month: 3, day: 6, hour: 10, minute: 0 },
  { zone: 'America/New_York' }
);

vi.mock('../../../../packages/shared/src/shared/utils/date', async () => {
  const actual = await vi.importActual<typeof import('../../../../packages/shared/src/shared/utils/date')>(
    '../../../../packages/shared/src/shared/utils/date'
  );
  return {
    ...actual,
    now: (_tz?: string) => mockNow,
  };
});

// Mock inngest
vi.mock('../../../../packages/shared/src/server/connections/inngest/client', () => ({
  inngest: { send: vi.fn().mockResolvedValue({ ids: ['evt-1'] }) },
}));

vi.mock('../../../../packages/shared/src/shared/config', () => ({
  getUrlsConfig: () => ({ publicBaseUrl: 'https://gymtext.test', baseUrl: 'https://gymtext.test' }),
}));

// Import AFTER mocks are set up
import { createDailyMessageService } from '../../../../packages/shared/src/server/services/orchestration/dailyMessageService';
import { inngest } from '../../../../packages/shared/src/server/connections/inngest/client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUser(overrides: Record<string, unknown> = {}): UserWithProfile {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '+15551234567',
    timezone: 'America/New_York',
    preferredSendHour: 8, // 8 AM local
    units: 'imperial',
    messagingOptIn: true,
    referralCode: null,
    stripeCustomerId: null,
    preferredMessagingProvider: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as UserWithProfile;
}

function makeDeps(overrides: Partial<Record<keyof DailyMessageServiceDeps, unknown>> = {}): DailyMessageServiceDeps {
  return {
    user: {
      getUser: vi.fn().mockResolvedValue(makeUser()),
      getUsersForHour: vi.fn().mockResolvedValue([]),
      ...((overrides.user as object) ?? {}),
    },
    messagingOrchestrator: {
      queueMessages: vi.fn().mockResolvedValue({ messageIds: ['msg-1'], queueEntryIds: ['q-1'] }),
      ...((overrides.messagingOrchestrator as object) ?? {}),
    },
    dayConfig: {
      getImageUrlForDate: vi.fn().mockResolvedValue(null),
      ...((overrides.dayConfig as object) ?? {}),
    },
    training: {
      prepareWorkoutForDate: vi.fn().mockResolvedValue(null),
      regenerateWorkoutMessage: vi.fn().mockResolvedValue('Regenerated workout message'),
      ...((overrides.training as object) ?? {}),
    },
    message: {
      findUserIdsWithOutboundMessagesForDates: vi.fn().mockResolvedValue(new Set<string>()),
      ...((overrides.message as object) ?? {}),
    },
    workoutInstance: {
      getByUserAndDate: vi.fn().mockResolvedValue(null),
      ...((overrides.workoutInstance as object) ?? {}),
    },
  } as unknown as DailyMessageServiceDeps;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DailyMessageService', () => {
  let service: DailyMessageServiceInstance;
  let deps: DailyMessageServiceDeps;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: 10 AM ET
    mockNow = DateTime.fromObject(
      { year: 2026, month: 3, day: 6, hour: 10, minute: 0 },
      { zone: 'America/New_York' }
    );
  });

  // =========================================================================
  // 1. User NOT sent message if before their send hour
  // =========================================================================
  describe('checkUserEligibility — before send hour', () => {
    it('should return ineligible when current local time is before preferredSendHour', async () => {
      // User's send hour is 8 AM. Set clock to 6 AM.
      mockNow = DateTime.fromObject(
        { year: 2026, month: 3, day: 6, hour: 6, minute: 0 },
        { zone: 'America/New_York' }
      );

      const user = makeUser({ preferredSendHour: 8 });
      deps = makeDeps({
        user: { getUser: vi.fn().mockResolvedValue(user) },
      });
      service = createDailyMessageService(deps);

      const result = await service.checkUserEligibility('user-1');

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('before preferred send hour');
    });

    it('should return ineligible at midnight when send hour is in the morning', async () => {
      mockNow = DateTime.fromObject(
        { year: 2026, month: 3, day: 6, hour: 0, minute: 0 },
        { zone: 'America/New_York' }
      );

      const user = makeUser({ preferredSendHour: 7 });
      deps = makeDeps({
        user: { getUser: vi.fn().mockResolvedValue(user) },
      });
      service = createDailyMessageService(deps);

      const result = await service.checkUserEligibility('user-1');

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('before preferred send hour');
    });
  });

  // =========================================================================
  // 2. User IS sent message if after send hour AND haven't received one
  // =========================================================================
  describe('checkUserEligibility — after send hour, no message sent yet', () => {
    it('should return eligible when local time >= preferredSendHour and no daily message exists', async () => {
      // 10 AM, send hour is 8 AM
      mockNow = DateTime.fromObject(
        { year: 2026, month: 3, day: 6, hour: 10, minute: 0 },
        { zone: 'America/New_York' }
      );

      const user = makeUser({ preferredSendHour: 8 });
      deps = makeDeps({
        user: { getUser: vi.fn().mockResolvedValue(user) },
        message: {
          findUserIdsWithOutboundMessagesForDates: vi.fn().mockResolvedValue(new Set<string>()),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.checkUserEligibility('user-1');

      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('eligible');
    });

    it('should return eligible exactly at the send hour', async () => {
      // 8 AM exactly, send hour is 8 AM
      mockNow = DateTime.fromObject(
        { year: 2026, month: 3, day: 6, hour: 8, minute: 0 },
        { zone: 'America/New_York' }
      );

      const user = makeUser({ preferredSendHour: 8 });
      deps = makeDeps({
        user: { getUser: vi.fn().mockResolvedValue(user) },
        message: {
          findUserIdsWithOutboundMessagesForDates: vi.fn().mockResolvedValue(new Set<string>()),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.checkUserEligibility('user-1');

      expect(result.eligible).toBe(true);
    });
  });

  // =========================================================================
  // 3. User NOT sent message if after send hour AND have received one
  // =========================================================================
  describe('checkUserEligibility — after send hour, message already sent', () => {
    it('should return ineligible when user already has a daily message for today', async () => {
      mockNow = DateTime.fromObject(
        { year: 2026, month: 3, day: 6, hour: 10, minute: 0 },
        { zone: 'America/New_York' }
      );

      const user = makeUser({ preferredSendHour: 8 });
      deps = makeDeps({
        user: { getUser: vi.fn().mockResolvedValue(user) },
        message: {
          // User already received a message today
          findUserIdsWithOutboundMessagesForDates: vi.fn().mockResolvedValue(new Set(['user-1'])),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.checkUserEligibility('user-1');

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('already has a daily message');
    });
  });

  // =========================================================================
  // 4. If no workout exists, try to create one
  // =========================================================================
  describe('sendDailyMessage — no existing workout', () => {
    it('should attempt to generate a workout when none exists for today', async () => {
      const user = makeUser();
      const generatedWorkout = {
        id: 'wk-gen-1',
        message: 'Here is your AI-generated workout!',
        date: new Date('2026-03-06'),
      };

      const prepareWorkoutForDate = vi.fn().mockResolvedValue(generatedWorkout);

      deps = makeDeps({
        workoutInstance: {
          getByUserAndDate: vi.fn().mockResolvedValue(null), // no existing workout
        },
        training: {
          prepareWorkoutForDate,
          regenerateWorkoutMessage: vi.fn(),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.sendDailyMessage(user);

      expect(result.success).toBe(true);
      expect(prepareWorkoutForDate).toHaveBeenCalledTimes(1);
      // Verify it was called with the user and a DateTime object
      expect(prepareWorkoutForDate).toHaveBeenCalledWith(
        user,
        expect.objectContaining({ zoneName: expect.any(String) })
      );
    });

    it('should return failure when workout generation also fails', async () => {
      const user = makeUser();

      deps = makeDeps({
        workoutInstance: {
          getByUserAndDate: vi.fn().mockResolvedValue(null),
        },
        training: {
          prepareWorkoutForDate: vi.fn().mockResolvedValue(null), // generation fails
          regenerateWorkoutMessage: vi.fn(),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.sendDailyMessage(user);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not generate workout');
    });
  });

  // =========================================================================
  // 5. If workout exists, use that and skip AI call
  // =========================================================================
  describe('sendDailyMessage — existing workout', () => {
    it('should use existing workout and NOT call AI generation', async () => {
      const user = makeUser();
      const existingWorkout = {
        id: 'wk-exist-1',
        message: 'Your pre-built workout for today!',
        date: new Date('2026-03-06'),
      };

      const prepareWorkoutForDate = vi.fn();

      deps = makeDeps({
        workoutInstance: {
          getByUserAndDate: vi.fn().mockResolvedValue(existingWorkout),
        },
        training: {
          prepareWorkoutForDate,
          regenerateWorkoutMessage: vi.fn(),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.sendDailyMessage(user);

      expect(result.success).toBe(true);
      // AI generation should NOT have been called
      expect(prepareWorkoutForDate).not.toHaveBeenCalled();
    });

    it('should queue the existing workout message via messaging orchestrator', async () => {
      const user = makeUser();
      const existingWorkout = {
        id: 'wk-exist-1',
        message: 'Leg day: squats, lunges, calf raises',
        date: new Date('2026-03-06'),
      };

      const queueMessages = vi.fn().mockResolvedValue({
        messageIds: ['msg-1'],
        queueEntryIds: ['q-1'],
      });

      deps = makeDeps({
        workoutInstance: {
          getByUserAndDate: vi.fn().mockResolvedValue(existingWorkout),
        },
        messagingOrchestrator: { queueMessages },
      });
      service = createDailyMessageService(deps);

      await service.sendDailyMessage(user);

      expect(queueMessages).toHaveBeenCalledTimes(1);
      expect(queueMessages).toHaveBeenCalledWith(
        user,
        expect.arrayContaining([
          expect.objectContaining({ content: existingWorkout.message }),
        ]),
        'daily'
      );
    });
  });

  // =========================================================================
  // Integration-style: scheduleMessagesForHour
  // =========================================================================
  describe('scheduleMessagesForHour — integration', () => {
    it('should filter out users who already received todays message', async () => {
      const user1 = makeUser({ id: 'user-1' });
      const user2 = makeUser({ id: 'user-2' });

      deps = makeDeps({
        user: {
          getUsersForHour: vi.fn().mockResolvedValue([user1, user2]),
        },
        message: {
          // user-1 already sent today
          findUserIdsWithOutboundMessagesForDates: vi.fn().mockResolvedValue(new Set(['user-1'])),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.scheduleMessagesForHour(13);

      // Only user-2 should be scheduled
      expect(result.scheduled).toBe(1);

      // Verify inngest.send was called with only user-2
      expect(inngest.send).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ data: expect.objectContaining({ userId: 'user-2' }) }),
        ])
      );
    });

    it('should return early with zeros when no candidate users exist', async () => {
      deps = makeDeps({
        user: { getUsersForHour: vi.fn().mockResolvedValue([]) },
      });
      service = createDailyMessageService(deps);

      const result = await service.scheduleMessagesForHour(13);

      expect(result.scheduled).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should return zeros when all users already received messages', async () => {
      const user1 = makeUser({ id: 'user-1' });

      deps = makeDeps({
        user: { getUsersForHour: vi.fn().mockResolvedValue([user1]) },
        message: {
          findUserIdsWithOutboundMessagesForDates: vi.fn().mockResolvedValue(new Set(['user-1'])),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.scheduleMessagesForHour(13);

      expect(result.scheduled).toBe(0);
      expect(result.failed).toBe(0);
    });
  });

  // =========================================================================
  // Integration-style: triggerForUser respects eligibility
  // =========================================================================
  describe('triggerForUser — integration', () => {
    it('should not schedule when user is ineligible (before send hour) and forceImmediate=false', async () => {
      mockNow = DateTime.fromObject(
        { year: 2026, month: 3, day: 6, hour: 6, minute: 0 },
        { zone: 'America/New_York' }
      );

      const user = makeUser({ preferredSendHour: 8 });
      deps = makeDeps({
        user: { getUser: vi.fn().mockResolvedValue(user) },
        message: {
          findUserIdsWithOutboundMessagesForDates: vi.fn().mockResolvedValue(new Set<string>()),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.triggerForUser('user-1', { forceImmediate: false });

      expect(result.success).toBe(true);
      expect(result.scheduled).toBe(false);
      expect(result.reason).toContain('before preferred send hour');
    });

    it('should not schedule when user already received message and forceImmediate=false', async () => {
      mockNow = DateTime.fromObject(
        { year: 2026, month: 3, day: 6, hour: 10, minute: 0 },
        { zone: 'America/New_York' }
      );

      const user = makeUser({ preferredSendHour: 8 });
      deps = makeDeps({
        user: { getUser: vi.fn().mockResolvedValue(user) },
        message: {
          findUserIdsWithOutboundMessagesForDates: vi.fn().mockResolvedValue(new Set(['user-1'])),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.triggerForUser('user-1', { forceImmediate: false });

      expect(result.success).toBe(true);
      expect(result.scheduled).toBe(false);
      expect(result.reason).toContain('already has a daily message');
    });

    it('should schedule even if ineligible when forceImmediate=true', async () => {
      mockNow = DateTime.fromObject(
        { year: 2026, month: 3, day: 6, hour: 6, minute: 0 },
        { zone: 'America/New_York' }
      );

      const user = makeUser({ preferredSendHour: 8 });
      deps = makeDeps({
        user: { getUser: vi.fn().mockResolvedValue(user) },
      });
      service = createDailyMessageService(deps);

      const result = await service.triggerForUser('user-1', { forceImmediate: true });

      expect(result.success).toBe(true);
      expect(result.scheduled).toBe(true);
      expect(result.reason).toContain('Force triggered');
    });
  });

  // =========================================================================
  // messagingOptIn gating
  // =========================================================================
  describe('sendDailyMessage — messagingOptIn gating', () => {
    it('should skip SMS queuing when user.messagingOptIn is false', async () => {
      const user = makeUser({ messagingOptIn: false });
      const existingWorkout = {
        id: 'wk-1',
        message: 'Leg day workout',
        date: new Date('2026-03-06'),
      };

      const queueMessages = vi.fn();

      deps = makeDeps({
        workoutInstance: {
          getByUserAndDate: vi.fn().mockResolvedValue(existingWorkout),
        },
        messagingOrchestrator: { queueMessages },
      });
      service = createDailyMessageService(deps);

      const result = await service.sendDailyMessage(user);

      expect(result.success).toBe(true);
      expect(queueMessages).not.toHaveBeenCalled();
    });

    it('should skip SMS queuing when user.messagingOptIn is null (unset)', async () => {
      const user = makeUser({ messagingOptIn: null });
      const existingWorkout = {
        id: 'wk-1',
        message: 'Leg day workout',
        date: new Date('2026-03-06'),
      };

      const queueMessages = vi.fn();

      deps = makeDeps({
        workoutInstance: {
          getByUserAndDate: vi.fn().mockResolvedValue(existingWorkout),
        },
        messagingOrchestrator: { queueMessages },
      });
      service = createDailyMessageService(deps);

      const result = await service.sendDailyMessage(user);

      expect(result.success).toBe(true);
      expect(queueMessages).not.toHaveBeenCalled();
    });

    it('should queue SMS when user.messagingOptIn is true', async () => {
      const user = makeUser({ messagingOptIn: true });
      const existingWorkout = {
        id: 'wk-1',
        message: 'Leg day workout',
        date: new Date('2026-03-06'),
      };

      const queueMessages = vi.fn().mockResolvedValue({
        messageIds: ['msg-1'],
        queueEntryIds: ['q-1'],
      });

      deps = makeDeps({
        workoutInstance: {
          getByUserAndDate: vi.fn().mockResolvedValue(existingWorkout),
        },
        messagingOrchestrator: { queueMessages },
      });
      service = createDailyMessageService(deps);

      const result = await service.sendDailyMessage(user);

      expect(result.success).toBe(true);
      expect(queueMessages).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // regenerateWorkoutMessage path
  // =========================================================================
  describe('sendDailyMessage — regenerateWorkoutMessage fallback', () => {
    it('should call regenerateWorkoutMessage when generated workout has null message', async () => {
      const user = makeUser({ messagingOptIn: true });
      const generatedWorkout = {
        id: 'wk-gen-1',
        message: null as string | null,
        date: new Date('2026-03-06'),
      };

      const regenerateWorkoutMessage = vi.fn().mockResolvedValue('Regenerated message');
      const queueMessages = vi.fn().mockResolvedValue({
        messageIds: ['msg-1'],
        queueEntryIds: ['q-1'],
      });

      deps = makeDeps({
        workoutInstance: {
          getByUserAndDate: vi.fn().mockResolvedValue(null),
        },
        training: {
          prepareWorkoutForDate: vi.fn().mockResolvedValue(generatedWorkout),
          regenerateWorkoutMessage,
        },
        messagingOrchestrator: { queueMessages },
      });
      service = createDailyMessageService(deps);

      const result = await service.sendDailyMessage(user);

      expect(result.success).toBe(true);
      expect(regenerateWorkoutMessage).toHaveBeenCalledWith(user, generatedWorkout);
      expect(queueMessages).toHaveBeenCalledWith(
        user,
        expect.arrayContaining([
          expect.objectContaining({ content: 'Regenerated message' }),
        ]),
        'daily',
      );
    });
  });

  // =========================================================================
  // Inngest failure in scheduleMessagesForHour
  // =========================================================================
  describe('scheduleMessagesForHour — inngest failure', () => {
    it('should report failures when inngest.send rejects', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user1 = makeUser({ id: 'user-1' });

      (inngest.send as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Inngest unavailable'));

      deps = makeDeps({
        user: {
          getUsersForHour: vi.fn().mockResolvedValue([user1]),
        },
        message: {
          findUserIdsWithOutboundMessagesForDates: vi.fn().mockResolvedValue(new Set<string>()),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.scheduleMessagesForHour(13);

      expect(result.scheduled).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Inngest unavailable');
      consoleSpy.mockRestore();
    });
  });

  // =========================================================================
  // getTodaysWorkout
  // =========================================================================
  describe('getTodaysWorkout', () => {
    it('should return workout data when a workout instance exists with a message', async () => {
      const existing = {
        id: 'wk-1',
        message: 'Push day workout',
        date: new Date('2026-03-06'),
      };

      deps = makeDeps({
        workoutInstance: {
          getByUserAndDate: vi.fn().mockResolvedValue(existing),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.getTodaysWorkout('user-1', new Date('2026-03-06'));

      expect(result).not.toBeNull();
      expect(result!.id).toBe('wk-1');
      expect(result!.message).toBe('Push day workout');
    });

    it('should return null when no workout instance exists', async () => {
      deps = makeDeps({
        workoutInstance: {
          getByUserAndDate: vi.fn().mockResolvedValue(null),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.getTodaysWorkout('user-1', new Date('2026-03-06'));

      expect(result).toBeNull();
    });

    it('should return null when workout exists but has no message', async () => {
      const existing = {
        id: 'wk-1',
        message: null,
        date: new Date('2026-03-06'),
      };

      deps = makeDeps({
        workoutInstance: {
          getByUserAndDate: vi.fn().mockResolvedValue(existing),
        },
      });
      service = createDailyMessageService(deps);

      const result = await service.getTodaysWorkout('user-1', new Date('2026-03-06'));

      expect(result).toBeNull();
    });
  });
});
