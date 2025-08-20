import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingChatService } from '@/server/services/onboardingChatService';

const makeService = () => {
  const chatAgent = vi.fn().mockResolvedValue({ response: 'Hello there! Let\'s get started.' });
  const userProfileAgent = vi.fn().mockResolvedValue({ profile: null, wasUpdated: false });
  const userRepository: any = { findWithProfile: vi.fn().mockResolvedValue(null) };
  const service = new OnboardingChatService({
    // @ts-expect-error partial deps for test
    chatAgent,
    // @ts-expect-error partial deps for test
    userProfileAgent,
    // @ts-expect-error partial deps for test
    userRepository,
  });
  return { service, chatAgent, userProfileAgent, userRepository };
};

describe('OnboardingChatService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('streams token chunks and milestone events', async () => {
    const { service } = makeService();
    const events = [] as Array<{ type: string; data: any }>; 

    for await (const evt of service.streamMessage({ message: 'Hi', tempSessionId: 'temp' })) {
      events.push(evt);
    }

    const tokenEvents = events.filter(e => e.type === 'token');
    const milestone = events.find(e => e.type === 'milestone');

    expect(tokenEvents.length).toBeGreaterThan(0);
    expect(milestone).toBeDefined();
    expect(['essentials_complete','ask_next']).toContain(milestone?.data);
  });
});
