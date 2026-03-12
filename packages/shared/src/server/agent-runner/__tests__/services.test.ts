import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNewChatService } from '../services/newChatService.js';
import { createNewDailyWorkoutService } from '../services/newDailyWorkoutService.js';
import type { Runner } from '@agent-runner/core';

// Mock runner
function createMockRunner(invokeResponse = 'Test response'): Runner {
  return {
    invoke: vi.fn().mockResolvedValue({
      output: invokeResponse,
      invocationId: 'test-inv-1',
      toolCalls: [],
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      duration: 1000,
      model: 'gpt-4o',
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

// Mock message service
function createMockMessageService() {
  return {
    getRecentMessages: vi.fn().mockResolvedValue([
      { id: '1', content: 'Hello coach!', direction: 'inbound', createdAt: new Date(), responded: false },
    ]),
    splitMessages: vi.fn().mockReturnValue({
      pending: [{ content: 'Hello coach!', direction: 'inbound' }],
      context: [],
    }),
  };
}

describe('NewChatService', () => {
  let mockRunner: Runner;
  let mockMessage: ReturnType<typeof createMockMessageService>;

  beforeEach(() => {
    mockRunner = createMockRunner("Hey! Great to hear from you! Here's what I suggest...");
    mockMessage = createMockMessageService();
  });

  it('should invoke chat agent with correct parameters', async () => {
    const chatService = createNewChatService({
      runner: mockRunner,
      message: mockMessage as any,
    });

    const user = { id: 'user-1', timezone: 'America/New_York' } as any;
    const result = await chatService.handleIncomingMessage(user);

    expect(result).toHaveLength(1);
    expect(result[0]).toContain('Great to hear from you');
    expect(mockRunner.invoke).toHaveBeenCalledWith(
      'chat',
      'Hello coach!',
      expect.objectContaining({
        contextIds: ['users/user-1/fitness'],
        sessionId: 'chat:user-1',
        toolContext: expect.objectContaining({
          userId: 'user-1',
        }),
      })
    );
  });

  it('should return empty array when no pending messages', async () => {
    mockMessage.splitMessages.mockReturnValue({ pending: [], context: [] });

    const chatService = createNewChatService({
      runner: mockRunner,
      message: mockMessage as any,
    });

    const user = { id: 'user-1' } as any;
    const result = await chatService.handleIncomingMessage(user);

    expect(result).toEqual([]);
    expect(mockRunner.invoke).not.toHaveBeenCalled();
  });

  it('should return fallback on error', async () => {
    (mockRunner.invoke as any).mockRejectedValue(new Error('LLM timeout'));

    const chatService = createNewChatService({
      runner: mockRunner,
      message: mockMessage as any,
    });

    const user = { id: 'user-1' } as any;
    const result = await chatService.handleIncomingMessage(user);

    expect(result).toHaveLength(1);
    expect(result[0]).toContain('having trouble');
  });

  it('should truncate long responses', async () => {
    const longResponse = 'a'.repeat(2000);
    mockRunner = createMockRunner(longResponse);

    const chatService = createNewChatService({
      runner: mockRunner,
      message: mockMessage as any,
    });

    const user = { id: 'user-1' } as any;
    const result = await chatService.handleIncomingMessage(user);

    expect(result[0].length).toBeLessThanOrEqual(1600);
    expect(result[0].endsWith('...')).toBe(true);
  });
});

describe('NewDailyWorkoutService', () => {
  let mockRunner: Runner;

  beforeEach(() => {
    const workoutJson = JSON.stringify({
      isRestDay: false,
      workoutType: 'Upper Body',
      exercises: [{ name: 'Bench Press', sets: 4, reps: '8-10' }],
    });
    mockRunner = createMockRunner(workoutJson);

    // Second call returns formatted message
    (mockRunner.invoke as any)
      .mockResolvedValueOnce({
        output: workoutJson,
        invocationId: 'test-1',
        toolCalls: [],
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        duration: 1000,
        model: 'gpt-4o',
      })
      .mockResolvedValueOnce({
        output: JSON.stringify({
          message: "Hey! Upper body day! Bench Press 4x8-10. Let's go! 💪",
          details: { workoutType: 'Upper Body' },
        }),
        invocationId: 'test-2',
        toolCalls: [],
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        duration: 500,
        model: 'gpt-4o-mini',
      });
  });

  it('should generate and format workout', async () => {
    const service = createNewDailyWorkoutService({ runner: mockRunner });
    const result = await service.generateDailyWorkout('user-1');

    expect(result.success).toBe(true);
    expect(result.message).toContain('Upper body day');
    expect(result.isRestDay).toBe(false);

    // Should have called get-workout then format-workout
    expect(mockRunner.invoke).toHaveBeenCalledTimes(2);
    expect((mockRunner.invoke as any).mock.calls[0][0]).toBe('get-workout');
    expect((mockRunner.invoke as any).mock.calls[1][0]).toBe('format-workout');
  });

  it('should inject workout into chat session', async () => {
    const service = createNewDailyWorkoutService({ runner: mockRunner });
    await service.generateDailyWorkout('user-1');

    expect(mockRunner.sessions.append).toHaveBeenCalledWith(
      'chat:user-1',
      expect.arrayContaining([
        expect.objectContaining({
          role: 'assistant',
          content: expect.stringContaining('Upper body day'),
        }),
      ])
    );
  });

  it('should handle errors gracefully', async () => {
    const errorRunner = createMockRunner('');
    (errorRunner.invoke as any).mockRejectedValue(new Error('Context not found'));

    const service = createNewDailyWorkoutService({ runner: errorRunner });
    const result = await service.generateDailyWorkout('user-1');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Context not found');
  });
});
