import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWeeklyMessageService } from '../orchestration/weeklyMessageService';
import type { WeeklyMessageServiceInstance } from '../orchestration/weeklyMessageService';
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
    // Sunday at 5pm
    return DateTime.fromISO('2026-03-22T17:00:00', { zone: tz || 'America/New_York' });
  },
  getNextWeekStart: () => new Date('2026-03-23T00:00:00'),
}));

// Mock config
vi.mock('@/shared/config', () => ({
  getUrlsConfig: () => ({ publicBaseUrl: 'https://gymtext.co', baseUrl: 'https://gymtext.co' }),
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
    subscriptionStatus: 'active',
    messagingOptIn: true,
    fitnessProfile: null,
    ...overrides,
  } as UserWithProfile;
}

function makeMockDeps() {
  return {
    user: {
      getUser: vi.fn().mockResolvedValue(makeUser()),
      getUsersForWeeklyMessage: vi.fn().mockResolvedValue([makeUser()]),
    },
    messagingOrchestrator: {
      queueMessages: vi.fn().mockResolvedValue({
        messageIds: ['msg-1'],
        queueEntryIds: ['q-1'],
      }),
    },
    training: {
      prepareMicrocycleForDate: vi.fn().mockResolvedValue({
        microcycle: {
          id: 'mc-1',
          content: '# Week 2\n\nMon: Push, Wed: Pull, Fri: Legs',
        },
      }),
      formatWeekMessage: vi.fn().mockResolvedValue(
        '📋 Next week:\nMon: Push Day\nWed: Pull Day\nFri: Leg Day'
      ),
    },
    markdown: {
      getPlan: vi.fn().mockResolvedValue({
        id: 'plan-1',
        content: '# Fitness Plan\n3x/week strength',
      }),
    },
    messagingAgent: {},
    dayConfig: {
      getImageUrlForDate: vi.fn().mockResolvedValue(null),
    },
  } as any;
}

describe('WeeklyMessageService', () => {
  let service: WeeklyMessageServiceInstance;
  let deps: ReturnType<typeof makeMockDeps>;

  beforeEach(() => {
    vi.clearAllMocks();
    deps = makeMockDeps();
    service = createWeeklyMessageService(deps);
  });

  describe('scheduleMessagesForHour', () => {
    it('should schedule messages for eligible users', async () => {
      const result = await service.scheduleMessagesForHour(22); // 10 PM UTC = 5 PM ET
      expect(result.scheduled).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should return empty result when no users', async () => {
      deps.user.getUsersForWeeklyMessage.mockResolvedValue([]);
      const result = await service.scheduleMessagesForHour(22);
      expect(result.scheduled).toBe(0);
    });

    it('should handle Inngest batch failure', async () => {
      deps.user.getUsersForWeeklyMessage.mockResolvedValue([makeUser(), makeUser({ id: 'user-2' })]);
      const { inngest } = await import('@/server/connections/inngest/client');
      (inngest.send as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Inngest down'));

      const result = await service.scheduleMessagesForHour(22);
      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('sendWeeklyMessage', () => {
    it('should generate and queue weekly message', async () => {
      const result = await service.sendWeeklyMessage(makeUser());
      expect(result.success).toBe(true);
      expect(deps.markdown.getPlan).toHaveBeenCalled();
      expect(deps.training.prepareMicrocycleForDate).toHaveBeenCalled();
      expect(deps.training.formatWeekMessage).toHaveBeenCalled();
      expect(deps.messagingOrchestrator.queueMessages).toHaveBeenCalled();
    });

    it('should fail if no plan exists', async () => {
      deps.markdown.getPlan.mockResolvedValue(null);
      const result = await service.sendWeeklyMessage(makeUser());
      expect(result.success).toBe(false);
      expect(result.error).toContain('No fitness plan');
    });

    it('should fail if microcycle creation fails', async () => {
      deps.training.prepareMicrocycleForDate.mockRejectedValue(new Error('LLM timeout'));
      const result = await service.sendWeeklyMessage(makeUser());
      expect(result.success).toBe(false);
      expect(result.error).toContain('training pattern');
    });

    it('should fail if microcycle has no content', async () => {
      deps.training.prepareMicrocycleForDate.mockResolvedValue({
        microcycle: { id: 'mc-1', content: null },
      });
      const result = await service.sendWeeklyMessage(makeUser());
      expect(result.success).toBe(false);
      expect(result.error).toContain('No content');
    });

    it('should fail if message formatting fails', async () => {
      deps.training.formatWeekMessage.mockResolvedValue(null);
      const result = await service.sendWeeklyMessage(makeUser());
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to format');
    });

    it('should skip SMS for users without consent', async () => {
      const result = await service.sendWeeklyMessage(makeUser({ messagingOptIn: false }));
      expect(result.success).toBe(true);
      expect(deps.messagingOrchestrator.queueMessages).not.toHaveBeenCalled();
    });
  });

  describe('checkUserEligibility', () => {
    it('should return eligible on Sunday at/after 5pm', async () => {
      const result = await service.checkUserEligibility('user-1');
      expect(result.eligible).toBe(true);
    });

    it('should return ineligible for unknown user', async () => {
      deps.user.getUser.mockResolvedValue(null);
      const result = await service.checkUserEligibility('missing');
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('not found');
    });
  });

  describe('triggerForUser', () => {
    it('should trigger Inngest event', async () => {
      // Reset inngest mock (may have been set to reject by prior test)
      const { inngest } = await import('@/server/connections/inngest/client');
      (inngest.send as ReturnType<typeof vi.fn>).mockResolvedValue({ ids: ['evt-456'] });

      const result = await service.triggerForUser('user-1', { forceImmediate: true });
      expect(result.success).toBe(true);
      expect(result.scheduled).toBe(true);
    });

    it('should not trigger for missing user', async () => {
      deps.user.getUser.mockResolvedValue(null);
      const result = await service.triggerForUser('missing', { forceImmediate: false });
      expect(result.success).toBe(false);
      expect(result.scheduled).toBe(false);
    });
  });
});
