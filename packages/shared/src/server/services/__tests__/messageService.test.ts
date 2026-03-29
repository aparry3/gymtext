import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMessageService } from '../domain/messaging/messageService';
import type { MessageServiceInstance } from '../domain/messaging/messageService';
import type { UserWithProfile } from '../../models/user';
import type { Message } from '../../models/message';

// Mock inngest
vi.mock('@/server/connections/inngest/client', () => ({
  inngest: {
    send: vi.fn().mockResolvedValue({ ids: ['job-123'] }),
  },
}));

// Mock twilio secrets
vi.mock('@/server/config', () => ({
  getTwilioSecrets: () => ({ phoneNumber: '+15555550000' }),
}));

// Helpers
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

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'msg-1',
    clientId: 'user-1',
    direction: 'inbound' as const,
    content: 'Hello',
    phoneFrom: '+15551234567',
    phoneTo: '+15555550000',
    provider: 'twilio',
    providerMessageId: null,
    metadata: {},
    messageType: 'conversation',
    deliveryStatus: 'delivered' as const,
    deliveryAttempts: 0,
    lastDeliveryAttemptAt: null,
    deliveryError: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Message;
}

function makeMockRepos() {
  return {
    message: {
      create: vi.fn().mockImplementation(async (data: Record<string, unknown>) =>
        makeMessage({ id: `msg-${Date.now()}`, ...data } as Partial<Message>)
      ),
      findByClientId: vi.fn().mockResolvedValue([]),
      findRecentByClientId: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(undefined),
      findByIds: vi.fn().mockResolvedValue([]),
      updateDeliveryStatus: vi.fn().mockImplementation(async (id: string, status: string) =>
        makeMessage({ id, deliveryStatus: status as Message['deliveryStatus'] })
      ),
      updateProviderMessageId: vi.fn().mockImplementation(async (id: string, pid: string) =>
        makeMessage({ id, providerMessageId: pid })
      ),
      markCancelled: vi.fn().mockImplementation(async (id: string) =>
        makeMessage({ id, deliveryStatus: 'cancelled' as Message['deliveryStatus'] })
      ),
      findStuckMessages: vi.fn().mockResolvedValue([]),
      findUserIdsWithOutboundMessagesForDates: vi.fn().mockResolvedValue(new Set()),
    },
    // Add other repos as needed (stubs)
    user: {},
    fitnessProfile: {},
    fitnessPlan: {},
    microcycle: {},
    workout: {},
    subscription: {},
    dayConfig: {},
    queue: {},
    shortLink: {},
    referral: {},
    adminAuth: {},
    onboardingData: {},
    agentLog: {},
    organization: {},
    program: {},
    programVersion: {},
    blog: {},
    exerciseMetrics: {},
  } as any;
}

function makeMockDeps() {
  return {
    user: {
      getUser: vi.fn().mockResolvedValue(makeUser()),
    },
    subscription: {
      processUnsubscribe: vi.fn().mockResolvedValue({
        success: true,
        responseMessage: 'You have been unsubscribed.',
      }),
      processResubscribe: vi.fn().mockResolvedValue({
        success: true,
        responseMessage: 'Welcome back!',
      }),
    },
  } as any;
}

describe('MessageService', () => {
  let service: MessageServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;
  let deps: ReturnType<typeof makeMockDeps>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    deps = makeMockDeps();
    service = createMessageService(repos, deps);
  });

  describe('handleKeyword', () => {
    const user = makeUser();

    it('should handle STOP keyword', async () => {
      const result = await service.handleKeyword({
        user,
        content: 'STOP',
        from: user.phone!,
        to: '+15555550000',
      });
      expect(result.handled).toBe(true);
      expect(result.keyword).toBe('stop');
      expect(deps.subscription.processUnsubscribe).toHaveBeenCalledWith(user.id);
      expect(repos.message.create).toHaveBeenCalled();
    });

    it('should handle STOP case-insensitively', async () => {
      const result = await service.handleKeyword({
        user,
        content: 'stop',
        from: user.phone!,
        to: '+15555550000',
      });
      expect(result.handled).toBe(true);
      expect(result.keyword).toBe('stop');
    });

    it('should handle all STOP variants', async () => {
      for (const keyword of ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']) {
        vi.clearAllMocks();
        const result = await service.handleKeyword({
          user,
          content: keyword,
          from: user.phone!,
          to: '+15555550000',
        });
        expect(result.handled).toBe(true);
        expect(result.keyword).toBe('stop');
      }
    });

    it('should handle START keyword', async () => {
      const result = await service.handleKeyword({
        user,
        content: 'START',
        from: user.phone!,
        to: '+15555550000',
      });
      expect(result.handled).toBe(true);
      expect(result.keyword).toBe('start');
      expect(deps.subscription.processResubscribe).toHaveBeenCalledWith(user.id);
    });

    it('should handle all START variants', async () => {
      for (const keyword of ['START', 'UNSTOP', 'RESUME', 'SUBSCRIBE']) {
        vi.clearAllMocks();
        const result = await service.handleKeyword({
          user,
          content: keyword,
          from: user.phone!,
          to: '+15555550000',
        });
        expect(result.handled).toBe(true);
        expect(result.keyword).toBe('start');
      }
    });

    it('should handle HELP keyword', async () => {
      const result = await service.handleKeyword({
        user,
        content: 'HELP',
        from: user.phone!,
        to: '+15555550000',
      });
      expect(result.handled).toBe(true);
      expect(result.keyword).toBe('help');
      expect(result.responseMessage).toBeTruthy();
    });

    it('should not handle regular messages', async () => {
      const result = await service.handleKeyword({
        user,
        content: 'What workout should I do today?',
        from: user.phone!,
        to: '+15555550000',
      });
      expect(result.handled).toBe(false);
      expect(result.keyword).toBeUndefined();
    });

    it('should handle keywords with whitespace', async () => {
      const result = await service.handleKeyword({
        user,
        content: '  STOP  ',
        from: user.phone!,
        to: '+15555550000',
      });
      expect(result.handled).toBe(true);
      expect(result.keyword).toBe('stop');
    });

    it('should store keyword messages with correct messageType', async () => {
      await service.handleKeyword({
        user,
        content: 'STOP',
        from: user.phone!,
        to: '+15555550000',
      });
      expect(repos.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messageType: 'keyword',
        })
      );
    });
  });

  describe('storeInboundMessage', () => {
    it('should store a message with correct fields', async () => {
      const result = await service.storeInboundMessage({
        clientId: 'user-1',
        from: '+15551234567',
        to: '+15555550000',
        content: 'Hello trainer!',
      });
      expect(result).toBeTruthy();
      expect(repos.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'user-1',
          direction: 'inbound',
          content: 'Hello trainer!',
          phoneFrom: '+15551234567',
          phoneTo: '+15555550000',
          provider: 'twilio',
          messageType: 'conversation',
        })
      );
    });

    it('should pass through Twilio metadata', async () => {
      await service.storeInboundMessage({
        clientId: 'user-1',
        from: '+15551234567',
        to: '+15555550000',
        content: 'Hi',
        twilioData: { MessageSid: 'SM123', NumMedia: '0' },
      });
      expect(repos.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          providerMessageId: 'SM123',
          metadata: { MessageSid: 'SM123', NumMedia: '0' },
        })
      );
    });
  });

  describe('storeOutboundMessage', () => {
    it('should store outbound message with defaults', async () => {
      const result = await service.storeOutboundMessage({
        clientId: 'user-1',
        to: '+15551234567',
        content: 'Here is your workout!',
      });
      expect(result).toBeTruthy();
      expect(repos.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'user-1',
          direction: 'outbound',
          content: 'Here is your workout!',
          phoneTo: '+15551234567',
          provider: 'twilio',
          deliveryStatus: 'queued',
        })
      );
    });

    it('should return null for unknown user', async () => {
      deps.user.getUser.mockResolvedValue(null);
      const result = await service.storeOutboundMessage({
        clientId: 'unknown-user',
        to: '+15551234567',
        content: 'Hello',
      });
      expect(result).toBeNull();
    });
  });

  describe('splitMessages', () => {
    it('should split messages into pending and context', () => {
      const now = new Date();
      const recentTime = new Date(now.getTime() - 5 * 60 * 1000); // 5 min ago
      const messages = [
        makeMessage({ id: 'msg-1', direction: 'inbound', createdAt: recentTime }),
        makeMessage({ id: 'msg-2', direction: 'outbound', createdAt: recentTime }),
        makeMessage({ id: 'msg-3', direction: 'inbound', createdAt: now }),
      ];

      const { pending, context } = service.splitMessages(messages, 30);
      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe('msg-3');
      expect(context).toHaveLength(2);
    });

    it('should return all inbound as pending when no outbound exists', () => {
      const messages = [
        makeMessage({ id: 'msg-1', direction: 'inbound' }),
        makeMessage({ id: 'msg-2', direction: 'inbound' }),
      ];
      const { pending, context } = service.splitMessages(messages, 30);
      expect(pending).toHaveLength(2);
      expect(context).toHaveLength(0);
    });

    it('should exclude old context messages', () => {
      const oldTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const messages = [
        makeMessage({ id: 'msg-1', direction: 'outbound', createdAt: oldTime }),
        makeMessage({ id: 'msg-2', direction: 'inbound', createdAt: new Date() }),
      ];
      const { pending, context } = service.splitMessages(messages, 30);
      expect(pending).toHaveLength(1);
      expect(context).toHaveLength(0); // outbound is too old
    });
  });

  describe('ingestMessage', () => {
    it('should store message and trigger Inngest event', async () => {
      const user = makeUser();
      const result = await service.ingestMessage({
        user,
        content: 'I want a harder workout',
        from: user.phone!,
        to: '+15555550000',
      });

      expect(result.jobId).toBe('job-123');
      expect(result.action).toBe('fullChatAgent');
      expect(repos.message.create).toHaveBeenCalled();
    });

    it('should throw if message storage fails', async () => {
      repos.message.create.mockResolvedValue(null);
      const user = makeUser();
      await expect(
        service.ingestMessage({
          user,
          content: 'hello',
          from: user.phone!,
          to: '+15555550000',
        })
      ).rejects.toThrow('Failed to store inbound message');
    });
  });

  describe('getPendingMessages', () => {
    it('should return only inbound messages after last outbound', async () => {
      repos.message.findRecentByClientId.mockResolvedValue([
        makeMessage({ id: 'msg-1', direction: 'inbound' }),
        makeMessage({ id: 'msg-2', direction: 'outbound' }),
        makeMessage({ id: 'msg-3', direction: 'inbound' }),
        makeMessage({ id: 'msg-4', direction: 'inbound' }),
      ]);

      const pending = await service.getPendingMessages('user-1');
      expect(pending).toHaveLength(2);
      expect(pending.map((m) => m.id)).toEqual(['msg-3', 'msg-4']);
    });

    it('should return empty when last message is outbound', async () => {
      repos.message.findRecentByClientId.mockResolvedValue([
        makeMessage({ id: 'msg-1', direction: 'inbound' }),
        makeMessage({ id: 'msg-2', direction: 'outbound' }),
      ]);

      const pending = await service.getPendingMessages('user-1');
      expect(pending).toHaveLength(0);
    });
  });
});
