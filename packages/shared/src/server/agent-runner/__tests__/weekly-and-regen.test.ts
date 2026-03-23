import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNewWeeklyMessageService } from '../services/newWeeklyMessageService.js';
import { createNewRegenerationService } from '../services/newRegenerationService.js';
import type { Runner } from '@agent-runner/core';

function createMockRunner(): Runner {
  return {
    invoke: vi.fn().mockImplementation((agentId: string) => {
      if (agentId === 'update-fitness') {
        return Promise.resolve({
          output: 'Context updated',
          invocationId: 'inv-1',
          toolCalls: [],
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
          duration: 1000,
          model: 'gpt-4o',
        });
      }
      if (agentId === 'get-workout') {
        return Promise.resolve({
          output: JSON.stringify({ isRestDay: false, workoutType: 'Push Day' }),
          invocationId: 'inv-2',
          toolCalls: [],
          usage: { promptTokens: 80, completionTokens: 60, totalTokens: 140 },
          duration: 800,
          model: 'gpt-4o',
        });
      }
      if (agentId === 'format-workout') {
        return Promise.resolve({
          output: JSON.stringify({
            message: "This week: Push/Pull/Legs. Monday starts with Push Day! 🔥",
          }),
          invocationId: 'inv-3',
          toolCalls: [],
          usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
          duration: 500,
          model: 'gpt-4o-mini',
        });
      }
      return Promise.reject(new Error(`Unknown agent: ${agentId}`));
    }),
    sessions: {
      append: vi.fn().mockResolvedValue(undefined),
      getMessages: vi.fn().mockResolvedValue([]),
      deleteSession: vi.fn().mockResolvedValue(undefined),
      listSessions: vi.fn().mockResolvedValue([]),
    },
    context: {
      get: vi.fn().mockResolvedValue([]),
      add: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    },
    registerAgent: vi.fn(),
    registerTool: vi.fn(),
  } as unknown as Runner;
}

describe('NewWeeklyMessageService', () => {
  let mockRunner: Runner;

  beforeEach(() => {
    mockRunner = createMockRunner();
  });

  it('should generate weekly message through 3-step pipeline', async () => {
    const service = createNewWeeklyMessageService({ runner: mockRunner });
    const result = await service.generateWeeklyMessage('user-1');

    expect(result.success).toBe(true);
    expect(result.message).toContain('Push/Pull/Legs');

    expect(mockRunner.invoke).toHaveBeenCalledTimes(3);
    expect((mockRunner.invoke as any).mock.calls[0][0]).toBe('update-fitness');
    expect((mockRunner.invoke as any).mock.calls[1][0]).toBe('get-workout');
    expect((mockRunner.invoke as any).mock.calls[2][0]).toBe('format-workout');
  });

  it('should pass weekPreview flag to get-workout', async () => {
    const service = createNewWeeklyMessageService({ runner: mockRunner });
    await service.generateWeeklyMessage('user-1');

    const getWorkoutCall = (mockRunner.invoke as any).mock.calls[1];
    const payload = JSON.parse(getWorkoutCall[1]);
    expect(payload.weekPreview).toBe(true);
  });

  it('should inject weekly message into chat session', async () => {
    const service = createNewWeeklyMessageService({ runner: mockRunner });
    await service.generateWeeklyMessage('user-1');

    expect(mockRunner.sessions.append).toHaveBeenCalledWith(
      'chat:user-1',
      expect.arrayContaining([
        expect.objectContaining({
          role: 'assistant',
          content: expect.stringContaining('Push/Pull/Legs'),
        }),
      ])
    );
  });

  it('should use provided timezone', async () => {
    const service = createNewWeeklyMessageService({ runner: mockRunner });
    await service.generateWeeklyMessage('user-1', 'America/Chicago');

    const getWorkoutCall = (mockRunner.invoke as any).mock.calls[1];
    const payload = JSON.parse(getWorkoutCall[1]);
    expect(payload.timezone).toBe('America/Chicago');
  });

  it('should handle errors gracefully', async () => {
    (mockRunner.invoke as any).mockRejectedValue(new Error('DB connection lost'));

    const service = createNewWeeklyMessageService({ runner: mockRunner });
    const result = await service.generateWeeklyMessage('user-1');

    expect(result.success).toBe(false);
    expect(result.error).toContain('DB connection lost');
  });

  it('should handle non-JSON format output', async () => {
    (mockRunner.invoke as any).mockImplementation((agentId: string) => {
      if (agentId === 'format-workout') {
        return Promise.resolve({
          output: 'Week ahead: 3 workouts planned!',
          invocationId: 'inv-3',
          toolCalls: [],
          usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
          duration: 500,
          model: 'gpt-4o-mini',
        });
      }
      return Promise.resolve({
        output: 'OK',
        invocationId: 'inv-1',
        toolCalls: [],
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        duration: 500,
        model: 'gpt-4o',
      });
    });

    const service = createNewWeeklyMessageService({ runner: mockRunner });
    const result = await service.generateWeeklyMessage('user-1');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Week ahead: 3 workouts planned!');
  });
});

describe('NewRegenerationService', () => {
  let mockRunner: Runner;

  beforeEach(() => {
    mockRunner = createMockRunner();
  });

  it('should clear context and regenerate', async () => {
    const service = createNewRegenerationService({ runner: mockRunner });
    const result = await service.regenerateUser('user-1');

    expect(result.success).toBe(true);

    // Should clear existing context first
    expect(mockRunner.context.clear).toHaveBeenCalledWith('users/user-1/fitness');

    // Then invoke update-fitness to rebuild
    expect(mockRunner.invoke).toHaveBeenCalledWith(
      'update-fitness',
      expect.stringContaining('Regenerate'),
      expect.objectContaining({
        contextIds: ['users/user-1/fitness'],
      })
    );
  });

  it('should handle errors gracefully', async () => {
    (mockRunner.context.clear as any).mockRejectedValue(new Error('Permission denied'));

    const service = createNewRegenerationService({ runner: mockRunner });
    const result = await service.regenerateUser('user-1');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Permission denied');
  });

  it('should not invoke agent if clear fails', async () => {
    (mockRunner.context.clear as any).mockRejectedValue(new Error('DB error'));

    const service = createNewRegenerationService({ runner: mockRunner });
    await service.regenerateUser('user-1');

    expect(mockRunner.invoke).not.toHaveBeenCalled();
  });
});
