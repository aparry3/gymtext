import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingChatService } from '@/server/services/onboardingChatService';
import type { User, FitnessProfile } from '@/server/models/userModel';

const makeService = () => {
  const chatAgent = vi.fn().mockResolvedValue({ response: 'Hello there! Let\'s get started.' });
  const userProfileAgent = vi.fn().mockResolvedValue({ profile: {}, wasUpdated: false });
  const userRepository: any = { 
    create: vi.fn().mockResolvedValue({ id: 'user-123', name: 'Test User' }),
    createOrUpdateFitnessProfile: vi.fn().mockResolvedValue({})
  };
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

describe('OnboardingChatService (Phase 4 - Pass-through)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('streams token chunks and milestone events with partial objects', async () => {
    const { service } = makeService();
    const events = [] as Array<{ type: string; data: any }>; 

    const currentUser: Partial<User> = { name: 'Bob' };
    const currentProfile: Partial<FitnessProfile> = { primaryGoal: 'muscle_gain' };

    for await (const evt of service.streamMessage({ 
      message: 'Hi', 
      currentUser,
      currentProfile,
      saveWhenReady: false
    })) {
      events.push(evt);
    }

    const tokenEvents = events.filter(e => e.type === 'token');
    const readyToSave = events.find(e => e.type === 'ready_to_save');
    const milestone = events.find(e => e.type === 'milestone');

    expect(tokenEvents.length).toBeGreaterThan(0);
    expect(readyToSave).toBeDefined();
    expect(readyToSave?.data).toHaveProperty('canSave');
    expect(readyToSave?.data).toHaveProperty('missing');
    expect(milestone).toBeDefined();
    expect(['essentials_complete', 'ask_next', 'summary']).toContain(milestone?.data);
  });
});
