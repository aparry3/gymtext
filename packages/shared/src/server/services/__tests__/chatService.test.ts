import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createChatService } from '../orchestration/chatService';
import type { ChatServiceInstance } from '../orchestration/chatService';
import type { UserWithProfile } from '../../models/user';
import type { Message } from '../../models/message';

// Mock config
vi.mock('@/shared/config', () => ({
  getChatConfig: () => ({ smsMaxLength: 1600, contextMinutes: 30 }),
}));

vi.mock('@/server/config', () => ({
  getEnvironmentSettings: () => ({ isDevelopment: false }),
}));

vi.mock('@/shared/utils/date', () => ({
  now: () => ({
    toJSDate: () => new Date('2026-03-18T09:00:00-04:00'),
  }),
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
    profile: undefined,
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

function makeMockDeps() {
  return {
    message: {
      getRecentMessages: vi.fn().mockResolvedValue([
        makeMessage({ id: 'msg-1', direction: 'outbound', content: 'Welcome!', createdAt: new Date(Date.now() - 10 * 60 * 1000) }),
        makeMessage({ id: 'msg-2', direction: 'inbound', content: 'What workout today?', createdAt: new Date() }),
      ]),
      splitMessages: vi.fn().mockReturnValue({
        pending: [makeMessage({ id: 'msg-2', direction: 'inbound', content: 'What workout today?' })],
        context: [makeMessage({ id: 'msg-1', direction: 'outbound', content: 'Welcome!' })],
      }),
    },
    user: {
      getUser: vi.fn().mockResolvedValue(makeUser()),
    },
    markdown: {
      getContext: vi.fn().mockResolvedValue('## Profile\nBeginner\n\n## Plan\nFull body 3x/week'),
    },
    agentRunner: {
      invoke: vi.fn().mockResolvedValue({
        response: 'Here\'s your push day workout: Bench Press 3x8, Shoulder Press 3x10',
        messages: [],
      }),
    },
  } as any;
}

describe('ChatService', () => {
  let service: ChatServiceInstance;
  let deps: ReturnType<typeof makeMockDeps>;
  const user = makeUser();

  beforeEach(() => {
    vi.clearAllMocks();
    deps = makeMockDeps();
    service = createChatService(deps);
  });

  describe('handleIncomingMessage', () => {
    it('should process pending messages and return AI response', async () => {
      const result = await service.handleIncomingMessage(user);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('Bench Press');
      expect(deps.agentRunner.invoke).toHaveBeenCalledWith(
        'chat:generate',
        expect.objectContaining({
          input: 'What workout today?',
          context: expect.any(String),
        })
      );
    });

    it('should return empty array when no pending messages', async () => {
      deps.message.splitMessages.mockReturnValue({ pending: [], context: [] });
      const result = await service.handleIncomingMessage(user);
      expect(result).toEqual([]);
      expect(deps.agentRunner.invoke).not.toHaveBeenCalled();
    });

    it('should aggregate multiple pending messages', async () => {
      deps.message.splitMessages.mockReturnValue({
        pending: [
          makeMessage({ content: 'Can I modify today?' }),
          makeMessage({ content: 'I want more leg work' }),
        ],
        context: [],
      });

      await service.handleIncomingMessage(user);
      expect(deps.agentRunner.invoke).toHaveBeenCalledWith(
        'chat:generate',
        expect.objectContaining({
          input: 'Can I modify today?\n\nI want more leg work',
        })
      );
    });

    it('should fetch dossier context', async () => {
      await service.handleIncomingMessage(user);
      expect(deps.markdown.getContext).toHaveBeenCalledWith(
        'user-1',
        ['profile', 'plan', 'week'],
        expect.objectContaining({ date: expect.any(Date) })
      );
    });

    it('should pass conversation history as previousMessages', async () => {
      await service.handleIncomingMessage(user);
      expect(deps.agentRunner.invoke).toHaveBeenCalledWith(
        'chat:generate',
        expect.objectContaining({
          previousMessages: [
            { role: 'assistant', content: 'Welcome!' },
          ],
        })
      );
    });

    it('should truncate messages exceeding SMS max length', async () => {
      const longResponse = 'x'.repeat(2000);
      deps.agentRunner.invoke.mockResolvedValue({
        response: longResponse,
        messages: [],
      });

      const result = await service.handleIncomingMessage(user);
      expect(result[0].length).toBeLessThanOrEqual(1600);
      expect(result[0].endsWith('...')).toBe(true);
    });

    it('should include tool messages in response', async () => {
      deps.agentRunner.invoke.mockResolvedValue({
        response: 'Here\'s your updated plan',
        messages: ['I modified your workout to include more squats'],
      });

      const result = await service.handleIncomingMessage(user);
      expect(result).toHaveLength(2);
    });

    it('should return fallback message on error', async () => {
      deps.agentRunner.invoke.mockRejectedValue(new Error('LLM timeout'));
      const result = await service.handleIncomingMessage(user);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('trouble processing');
    });

    it('should handle agent returning empty response', async () => {
      deps.agentRunner.invoke.mockResolvedValue({
        response: '',
        messages: [],
      });

      const result = await service.handleIncomingMessage(user);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('trouble processing');
    });
  });
});
