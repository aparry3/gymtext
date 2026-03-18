import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMessagingOrchestrator } from '../orchestration/messagingOrchestrator';
import type { MessagingOrchestratorInstance } from '../orchestration/messagingOrchestrator';
import type { UserWithProfile } from '../../models/user';
import type { Message } from '../../models/message';

// Mock inngest
vi.mock('@/server/connections/inngest/client', () => ({
  inngest: {
    send: vi.fn().mockResolvedValue({ ids: ['evt-123'] }),
  },
}));

// Mock messaging client
vi.mock('@/server/connections/messaging', () => ({
  messagingClient: {
    provider: 'twilio',
    sendMessage: vi.fn().mockResolvedValue({ messageId: 'SM123', status: 'sent' }),
  },
  getSafeMessagingClient: vi.fn().mockReturnValue({
    sendMessage: vi.fn().mockResolvedValue({ messageId: 'SM123', status: 'sent' }),
  }),
}));

// Mock messaging types
vi.mock('@/server/connections/messaging/types', () => ({
  MessageProvider: {
    TWILIO: 'twilio',
    WHATSAPP: 'whatsapp',
    LOCAL: 'local',
  },
}));

// Mock config
vi.mock('@/shared/config', () => ({
  getMessagingConfig: () => ({ provider: 'twilio' }),
}));

// Mock SMS validation
vi.mock('@/server/utils/smsValidation', () => ({
  isMessageTooLong: (text: string) => text.length > 1600,
  getSmsMaxLength: () => 1600,
}));

// Mock Twilio error utils
vi.mock('@/server/utils/twilioErrors', () => ({
  isNonRetryableError: (msg: string) => msg.includes('21610') || msg.includes('invalid'),
  isUnsubscribedError: (msg: string) => msg.includes('21610'),
}));

function makeUser(overrides: Partial<UserWithProfile> = {}): UserWithProfile {
  return {
    id: 'user-1',
    phone: '+15551234567',
    phoneNumber: '+15551234567',
    name: 'Test User',
    email: null,
    timezone: 'America/New_York',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: null,
    subscriptionStatus: 'active',
    preferredWorkoutTime: null,
    preferredMessagingProvider: null,
    fitnessProfile: null,
    ...overrides,
  } as UserWithProfile;
}

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: `msg-${Date.now()}-${Math.random()}`,
    clientId: 'user-1',
    direction: 'outbound' as const,
    content: 'Test message',
    phoneFrom: '+15555550000',
    phoneTo: '+15551234567',
    provider: 'twilio',
    providerMessageId: null,
    metadata: {},
    messageType: 'conversation',
    deliveryStatus: 'queued' as const,
    deliveryAttempts: 0,
    lastDeliveryAttemptAt: null,
    deliveryError: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Message;
}

function makeMockDeps() {
  return {
    message: {
      storeOutboundMessage: vi.fn().mockImplementation(async (params: Record<string, unknown>) =>
        makeMessage({ content: params.content as string, clientId: params.clientId as string })
      ),
      updateDeliveryStatus: vi.fn().mockImplementation(async (id: string, status: string) =>
        makeMessage({ id, deliveryStatus: status as Message['deliveryStatus'] })
      ),
      updateProviderMessageId: vi.fn().mockImplementation(async (id: string, pid: string) =>
        makeMessage({ id, providerMessageId: pid })
      ),
      markCancelled: vi.fn().mockImplementation(async (id: string) =>
        makeMessage({ id, deliveryStatus: 'cancelled' as Message['deliveryStatus'] })
      ),
      getMessageById: vi.fn().mockResolvedValue(makeMessage()),
    },
    queue: {
      enqueue: vi.fn().mockImplementation(async (_clientId: string, messageId: string) => ({
        id: `q-${Date.now()}`,
        clientId: _clientId,
        messageId,
        queueName: 'daily',
        status: 'pending',
        sequenceNumber: 1,
      })),
      enqueueMany: vi.fn().mockImplementation(async (_clientId: string, messageIds: string[]) =>
        messageIds.map((id, i) => ({
          id: `q-${i}`,
          clientId: _clientId,
          messageId: id,
          queueName: 'daily',
          status: 'pending',
          sequenceNumber: i + 1,
        }))
      ),
      getNextPending: vi.fn().mockResolvedValue(null),
      findById: vi.fn().mockResolvedValue(null),
      markProcessing: vi.fn(),
      markCompleted: vi.fn(),
      markFailed: vi.fn(),
      clearCompleted: vi.fn(),
      cancelAllForClient: vi.fn().mockResolvedValue(0),
      deleteStalePending: vi.fn().mockResolvedValue([]),
    },
    user: {
      getUser: vi.fn().mockResolvedValue(makeUser()),
    },
    subscription: {
      immediatelyCancelSubscription: vi.fn(),
      processUnsubscribe: vi.fn(),
    },
    twilioClient: {
      sendMessage: vi.fn().mockResolvedValue({ messageId: 'SM123', status: 'sent' }),
    },
  } as any;
}

describe('MessagingOrchestrator', () => {
  let service: MessagingOrchestratorInstance;
  let deps: ReturnType<typeof makeMockDeps>;
  const user = makeUser();

  beforeEach(() => {
    vi.clearAllMocks();
    deps = makeMockDeps();
    service = createMessagingOrchestrator(deps);
  });

  describe('queueMessage', () => {
    it('should store message, enqueue, and trigger Inngest', async () => {
      const result = await service.queueMessage(user, { content: 'Your workout!' }, 'daily');

      expect(result.messageId).toBeTruthy();
      expect(result.queueEntryId).toBeTruthy();
      expect(deps.message.storeOutboundMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'user-1',
          content: 'Your workout!',
          deliveryStatus: 'queued',
        })
      );
      expect(deps.queue.enqueue).toHaveBeenCalled();
    });

    it('should reject messages that are too long', async () => {
      const longMessage = 'x'.repeat(1601);
      await expect(
        service.queueMessage(user, { content: longMessage }, 'daily')
      ).rejects.toThrow('Message too long');
    });

    it('should throw if message storage fails', async () => {
      deps.message.storeOutboundMessage.mockResolvedValue(null);
      await expect(
        service.queueMessage(user, { content: 'Hello' }, 'daily')
      ).rejects.toThrow('Failed to store message');
    });
  });

  describe('queueMessages', () => {
    it('should store and enqueue multiple messages', async () => {
      const result = await service.queueMessages(
        user,
        [{ content: 'Plan summary' }, { content: 'Today\'s workout' }],
        'onboarding'
      );
      expect(result.messageIds).toHaveLength(2);
      expect(result.queueEntryIds).toHaveLength(2);
      expect(deps.message.storeOutboundMessage).toHaveBeenCalledTimes(2);
      expect(deps.queue.enqueueMany).toHaveBeenCalled();
    });

    it('should return empty arrays for empty input', async () => {
      const result = await service.queueMessages(user, [], 'onboarding');
      expect(result.messageIds).toHaveLength(0);
      expect(result.queueEntryIds).toHaveLength(0);
    });

    it('should reject if any message is too long', async () => {
      await expect(
        service.queueMessages(
          user,
          [{ content: 'Short' }, { content: 'x'.repeat(1601) }],
          'daily'
        )
      ).rejects.toThrow('Message too long');
    });
  });

  describe('sendImmediate', () => {
    it('should store and send message directly', async () => {
      const result = await service.sendImmediate(user, 'Quick reply');
      expect(result.success).toBe(true);
      expect(result.messageId).toBeTruthy();
      expect(deps.message.storeOutboundMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Quick reply',
          deliveryStatus: 'sent',
        })
      );
    });

    it('should return failure if message storage fails', async () => {
      deps.message.storeOutboundMessage.mockResolvedValue(null);
      const result = await service.sendImmediate(user, 'Hello');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to store message');
    });
  });

  describe('processNext', () => {
    it('should clean up stale entries and find next pending', async () => {
      deps.queue.getNextPending.mockResolvedValue(null);
      await service.processNext('user-1', 'daily');
      expect(deps.queue.deleteStalePending).toHaveBeenCalled();
      expect(deps.queue.clearCompleted).toHaveBeenCalledWith('user-1', 'daily');
    });

    it('should trigger send for next pending message', async () => {
      deps.queue.getNextPending.mockResolvedValue({
        id: 'q-1',
        clientId: 'user-1',
        messageId: 'msg-1',
        queueName: 'daily',
        status: 'pending',
        sequenceNumber: 1,
      });

      await service.processNext('user-1', 'daily');

      const { inngest } = await import('@/server/connections/inngest/client');
      expect(inngest.send).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'message-queue/send-message',
          data: expect.objectContaining({
            queueEntryId: 'q-1',
            clientId: 'user-1',
          }),
        })
      );
    });

    it('should cancel messages for stale entries', async () => {
      deps.queue.deleteStalePending.mockResolvedValue([
        { id: 'q-stale-1', messageId: 'msg-stale-1' },
        { id: 'q-stale-2', messageId: 'msg-stale-2' },
      ]);
      deps.queue.getNextPending.mockResolvedValue(null);

      await service.processNext('user-1', 'daily');
      expect(deps.message.markCancelled).toHaveBeenCalledTimes(2);
    });
  });
});
