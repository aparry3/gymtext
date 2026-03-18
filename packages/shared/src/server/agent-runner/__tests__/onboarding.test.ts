import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNewOnboardingService } from '../services/newOnboardingService.js';
import type { Runner } from '@agent-runner/core';

function createMockRunner(): Runner {
  let callCount = 0;
  return {
    invoke: vi.fn().mockImplementation((agentId: string) => {
      callCount++;
      if (agentId === 'update-fitness') {
        return Promise.resolve({
          output: 'Context updated',
          invocationId: `inv-${callCount}`,
          toolCalls: [],
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
          duration: 1000,
          model: 'gpt-4o',
        });
      }
      if (agentId === 'chat') {
        return Promise.resolve({
          output: "Hey John! Here's your plan: 4-day upper/lower split. You'll train Mon/Tue/Thu/Fri with rest days Wed/Sat/Sun. First workout starts today! 💪",
          invocationId: `inv-${callCount}`,
          toolCalls: [],
          usage: { promptTokens: 120, completionTokens: 80, totalTokens: 200 },
          duration: 900,
          model: 'gpt-4o',
        });
      }
      if (agentId === 'get-workout') {
        return Promise.resolve({
          output: JSON.stringify({
            isRestDay: false,
            workoutType: 'Full Body',
            exercises: [{ name: 'Squats', sets: 3, reps: '10' }],
          }),
          invocationId: `inv-${callCount}`,
          toolCalls: [],
          usage: { promptTokens: 80, completionTokens: 60, totalTokens: 140 },
          duration: 800,
          model: 'gpt-4o',
        });
      }
      if (agentId === 'format-workout') {
        return Promise.resolve({
          output: JSON.stringify({
            message: "Here's your first workout: Squats 3x10. Let's go! 💪",
            details: { workoutType: 'Full Body' },
          }),
          invocationId: `inv-${callCount}`,
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

describe('NewOnboardingService', () => {
  let mockRunner: Runner;

  beforeEach(() => {
    mockRunner = createMockRunner();
  });

  it('should onboard user through 4-step pipeline', async () => {
    const service = createNewOnboardingService({ runner: mockRunner });
    const user = { id: 'user-1', name: 'John', timezone: 'America/New_York' } as any;
    const signupData = { fitnessLevel: 'beginner', goal: 'build muscle', daysPerWeek: 4 };

    const result = await service.onboardUser(user, signupData);

    expect(result.success).toBe(true);
    expect(result.workoutMessage).toContain('first workout');
    expect(result.workoutDetails).toEqual({ workoutType: 'Full Body' });
    expect(result.planSummaryMessage).toContain('plan');

    // Should call all 4 agents in order
    expect(mockRunner.invoke).toHaveBeenCalledTimes(4);
    expect((mockRunner.invoke as any).mock.calls[0][0]).toBe('update-fitness');
    expect((mockRunner.invoke as any).mock.calls[1][0]).toBe('chat');
    expect((mockRunner.invoke as any).mock.calls[2][0]).toBe('get-workout');
    expect((mockRunner.invoke as any).mock.calls[3][0]).toBe('format-workout');
  });

  it('should return 3 messages in send order: welcome, plan summary, workout', async () => {
    const service = createNewOnboardingService({ runner: mockRunner });
    const user = { id: 'user-1', name: 'John' } as any;

    const result = await service.onboardUser(user, {});

    expect(result.messages).toHaveLength(3);
    // Message 1: Welcome (static)
    expect(result.messages[0]).toContain('Welcome to GymText');
    // Message 2: Plan summary (LLM-generated)
    expect(result.messages[1]).toContain('plan');
    // Message 3: Workout (LLM-generated)
    expect(result.messages[2]).toContain('first workout');

    expect(result.welcomeMessage).toContain('Welcome to GymText');
  });

  it('should pass signup data to update-fitness agent', async () => {
    const service = createNewOnboardingService({ runner: mockRunner });
    const user = { id: 'user-1', name: 'Jane', timezone: 'America/Chicago' } as any;
    const signupData = { fitnessLevel: 'intermediate', goal: 'lose weight' };

    await service.onboardUser(user, signupData);

    const updateCall = (mockRunner.invoke as any).mock.calls[0];
    expect(updateCall[1]).toContain('Jane');
    expect(updateCall[1]).toContain('fitnessLevel: intermediate');
    expect(updateCall[1]).toContain('goal: lose weight');
  });

  it('should inject plan summary and workout into chat session for continuity', async () => {
    const service = createNewOnboardingService({ runner: mockRunner });
    const user = { id: 'user-1', name: 'Test' } as any;

    await service.onboardUser(user, {});

    // Should append plan summary AND workout to chat session
    expect(mockRunner.sessions.append).toHaveBeenCalledTimes(2);

    // First append: plan summary
    expect(mockRunner.sessions.append).toHaveBeenNthCalledWith(
      1,
      'chat:user-1',
      expect.arrayContaining([
        expect.objectContaining({
          role: 'assistant',
          content: expect.stringContaining('plan'),
        }),
      ])
    );

    // Second append: workout
    expect(mockRunner.sessions.append).toHaveBeenNthCalledWith(
      2,
      'chat:user-1',
      expect.arrayContaining([
        expect.objectContaining({
          role: 'assistant',
          content: expect.stringContaining('first workout'),
        }),
      ])
    );
  });

  it('should handle errors gracefully and still return welcome message', async () => {
    (mockRunner.invoke as any).mockRejectedValue(new Error('Model unavailable'));

    const service = createNewOnboardingService({ runner: mockRunner });
    const user = { id: 'user-1' } as any;

    const result = await service.onboardUser(user, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain('Model unavailable');
    // Should still include welcome message even on failure
    expect(result.welcomeMessage).toContain('Welcome to GymText');
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]).toContain('Welcome to GymText');
  });

  it('should handle non-JSON format-workout output', async () => {
    (mockRunner.invoke as any).mockImplementation((agentId: string) => {
      if (agentId === 'format-workout') {
        return Promise.resolve({
          output: 'Plain text workout message',
          invocationId: 'inv-4',
          toolCalls: [],
          usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
          duration: 500,
          model: 'gpt-4o-mini',
        });
      }
      if (agentId === 'chat') {
        return Promise.resolve({
          output: 'Your plan summary here',
          invocationId: 'inv-2',
          toolCalls: [],
          usage: { promptTokens: 80, completionTokens: 40, totalTokens: 120 },
          duration: 600,
          model: 'gpt-4o',
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

    const service = createNewOnboardingService({ runner: mockRunner });
    const user = { id: 'user-1' } as any;

    const result = await service.onboardUser(user, {});

    expect(result.success).toBe(true);
    expect(result.workoutMessage).toBe('Plain text workout message');
    expect(result.messages).toHaveLength(3);
  });

  it('should use chat agent with context for plan summary', async () => {
    const service = createNewOnboardingService({ runner: mockRunner });
    const user = { id: 'user-1', name: 'Jane' } as any;

    await service.onboardUser(user, {});

    // Chat agent should be called with context and session
    const chatCall = (mockRunner.invoke as any).mock.calls[1];
    expect(chatCall[0]).toBe('chat');
    expect(chatCall[1]).toContain('plan summary');
    expect(chatCall[2]).toEqual(expect.objectContaining({
      contextIds: ['users/user-1/fitness'],
      sessionId: 'chat:user-1',
    }));
  });
});
