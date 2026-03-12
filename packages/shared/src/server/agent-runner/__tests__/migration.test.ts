import { describe, it, expect, vi } from 'vitest';
import { migrateUserContext, migrateChatHistory } from '../migration/migrate-user-context.js';
import type { Runner } from '@agent-runner/core';

function createMockRunner(): Runner {
  return {
    context: {
      get: vi.fn().mockResolvedValue([]),
      add: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    },
    sessions: {
      append: vi.fn().mockResolvedValue(undefined),
      getMessages: vi.fn().mockResolvedValue([]),
      deleteSession: vi.fn().mockResolvedValue(undefined),
      listSessions: vi.fn().mockResolvedValue([]),
    },
  } as unknown as Runner;
}

function createMockMarkdown(data: {
  profile?: string | null;
  plan?: { content?: string } | null;
  week?: { content?: string } | null;
} = {}) {
  return {
    getProfile: vi.fn().mockResolvedValue(data.profile ?? null),
    getPlan: vi.fn().mockResolvedValue(data.plan ?? null),
    getWeek: vi.fn().mockResolvedValue(data.week ?? null),
  };
}

describe('migrateUserContext', () => {
  it('should migrate user with profile, plan, and week', async () => {
    const runner = createMockRunner();
    const markdown = createMockMarkdown({
      profile: 'Name: John\nAge: 30\nGoal: Build muscle',
      plan: { content: '4-day upper/lower split' },
      week: { content: 'Monday: Upper A\nTuesday: Lower A' },
    });

    const result = await migrateUserContext(runner as any, markdown as any, 'user-1');

    expect(result.success).toBe(true);
    expect(result.hasProfile).toBe(true);
    expect(result.hasPlan).toBe(true);
    expect(result.hasWeek).toBe(true);

    expect(runner.context.add).toHaveBeenCalledWith(
      'users/user-1/fitness',
      expect.objectContaining({
        agentId: 'migration',
        content: expect.stringContaining('## Profile'),
      })
    );
  });

  it('should fail gracefully when no data exists', async () => {
    const runner = createMockRunner();
    const markdown = createMockMarkdown();

    const result = await migrateUserContext(runner as any, markdown as any, 'user-2');

    expect(result.success).toBe(false);
    expect(result.error).toContain('No profile or plan data');
    expect(runner.context.add).not.toHaveBeenCalled();
  });

  it('should handle profile-only users', async () => {
    const runner = createMockRunner();
    const markdown = createMockMarkdown({
      profile: 'Name: Jane\nLevel: Beginner',
    });

    const result = await migrateUserContext(runner as any, markdown as any, 'user-3');

    expect(result.success).toBe(true);
    expect(result.hasProfile).toBe(true);
    expect(result.hasPlan).toBe(false);
  });
});

describe('migrateChatHistory', () => {
  it('should migrate recent messages into session', async () => {
    const runner = createMockRunner();
    const messages = [
      { content: 'Hey coach!', direction: 'inbound', createdAt: '2026-03-01' },
      { content: 'Hey! Ready to work out?', direction: 'outbound', createdAt: '2026-03-01' },
      { content: 'Yes!', direction: 'inbound', createdAt: '2026-03-01' },
    ];

    const result = await migrateChatHistory(runner as any, messages, 'user-1');

    expect(result.success).toBe(true);
    expect(result.messageCount).toBe(3);
    expect(runner.sessions.append).toHaveBeenCalledTimes(3);
  });

  it('should limit to last 20 messages', async () => {
    const runner = createMockRunner();
    const messages = Array.from({ length: 30 }, (_, i) => ({
      content: `Message ${i}`,
      direction: i % 2 === 0 ? 'inbound' : 'outbound',
      createdAt: '2026-03-01',
    }));

    const result = await migrateChatHistory(runner as any, messages, 'user-1');

    expect(result.messageCount).toBe(20);
    expect(runner.sessions.append).toHaveBeenCalledTimes(20);
  });

  it('should handle empty messages array', async () => {
    const runner = createMockRunner();
    const result = await migrateChatHistory(runner as any, [], 'user-1');

    expect(result.success).toBe(true);
    expect(result.messageCount).toBe(0);
  });

  it('should map directions to correct roles', async () => {
    const runner = createMockRunner();
    const messages = [
      { content: 'inbound msg', direction: 'inbound', createdAt: '2026-03-01' },
      { content: 'outbound msg', direction: 'outbound', createdAt: '2026-03-01' },
    ];

    await migrateChatHistory(runner as any, messages, 'user-1');

    // First call should be user role
    expect(runner.sessions.append).toHaveBeenNthCalledWith(1, 'chat:user-1', [
      expect.objectContaining({ role: 'user', content: 'inbound msg' }),
    ]);
    // Second call should be assistant role
    expect(runner.sessions.append).toHaveBeenNthCalledWith(2, 'chat:user-1', [
      expect.objectContaining({ role: 'assistant', content: 'outbound msg' }),
    ]);
  });
});
