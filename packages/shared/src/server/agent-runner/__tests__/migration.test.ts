import { describe, it, expect, vi } from 'vitest';
import { migrateUserContext, migrateUserContextViaAgent, migrateChatHistory, migrateUsers } from '../migration/migrate-user-context.js';
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

describe('migrateUserContextViaAgent', () => {
  function createAgentMockRunner(): Runner {
    return {
      invoke: vi.fn().mockResolvedValue({
        output: 'Structured fitness context',
        invocationId: 'inv-1',
        toolCalls: [],
        usage: { promptTokens: 200, completionTokens: 300, totalTokens: 500 },
        duration: 2000,
        model: 'gpt-4o',
      }),
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

  it('should use update-fitness agent to normalize data', async () => {
    const runner = createAgentMockRunner();
    const markdown = createMockMarkdown({
      profile: 'Name: John\nAge: 30',
      plan: { content: '4-day split' },
      week: { content: 'Monday: Upper' },
    });

    const result = await migrateUserContextViaAgent(runner as any, markdown as any, 'user-1');

    expect(result.success).toBe(true);
    // Should call update-fitness agent instead of context.add
    expect(runner.invoke).toHaveBeenCalledWith(
      'update-fitness',
      expect.stringContaining('Migrating existing user'),
      expect.objectContaining({
        contextIds: ['users/user-1/fitness'],
      })
    );
    // Input should include all existing data
    const invokeInput = (runner.invoke as any).mock.calls[0][1];
    expect(invokeInput).toContain('Existing Profile');
    expect(invokeInput).toContain('Existing Training Plan');
    expect(invokeInput).toContain('Current Week Schedule');
  });

  it('should fail gracefully when no data exists', async () => {
    const runner = createAgentMockRunner();
    const markdown = createMockMarkdown();

    const result = await migrateUserContextViaAgent(runner as any, markdown as any, 'user-2');

    expect(result.success).toBe(false);
    expect(result.error).toContain('No profile or plan data');
    expect(runner.invoke).not.toHaveBeenCalled();
  });

  it('should handle agent errors gracefully', async () => {
    const runner = createAgentMockRunner();
    (runner.invoke as any).mockRejectedValue(new Error('Rate limited'));
    const markdown = createMockMarkdown({
      profile: 'Name: Jane',
    });

    const result = await migrateUserContextViaAgent(runner as any, markdown as any, 'user-3');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Rate limited');
  });
});

describe('migrateUsers batch', () => {
  it('should migrate multiple users with direct strategy', async () => {
    const runner = createMockRunner();
    const markdown = createMockMarkdown({
      profile: 'Name: Test',
      plan: { content: 'Plan content' },
    });

    const results = await migrateUsers(
      runner as any,
      markdown as any,
      ['user-1', 'user-2', 'user-3'],
      { strategy: 'direct' }
    );

    expect(results).toHaveLength(3);
    expect(results.every(r => r.success)).toBe(true);
    expect(runner.context.add).toHaveBeenCalledTimes(3);
  });

  it('should report progress', async () => {
    const runner = createMockRunner();
    const markdown = createMockMarkdown({ profile: 'Name: Test' });
    const progress: Array<{ completed: number; total: number }> = [];

    await migrateUsers(
      runner as any,
      markdown as any,
      ['user-1', 'user-2'],
      {
        strategy: 'direct',
        onProgress: (completed, total) => progress.push({ completed, total }),
      }
    );

    expect(progress).toHaveLength(2);
    expect(progress[0]).toEqual({ completed: 1, total: 2 });
    expect(progress[1]).toEqual({ completed: 2, total: 2 });
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
