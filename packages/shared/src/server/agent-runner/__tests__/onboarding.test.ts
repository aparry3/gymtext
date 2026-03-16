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
            message: "Welcome! Here's your first workout: Squats 3x10. Let's go! 💪",
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

  it('should onboard user through 3-step pipeline', async () => {
    const service = createNewOnboardingService({ runner: mockRunner });
    const user = { id: 'user-1', name: 'John', timezone: 'America/New_York' } as any;
    const signupData = { fitnessLevel: 'beginner', goal: 'build muscle', daysPerWeek: 4 };

    const result = await service.onboardUser(user, signupData);

    expect(result.success).toBe(true);
    expect(result.workoutMessage).toContain('first workout');
    expect(result.workoutDetails).toEqual({ workoutType: 'Full Body' });

    // Should call all 3 agents in order
    expect(mockRunner.invoke).toHaveBeenCalledTimes(3);
    expect((mockRunner.invoke as any).mock.calls[0][0]).toBe('update-fitness');
    expect((mockRunner.invoke as any).mock.calls[1][0]).toBe('get-workout');
    expect((mockRunner.invoke as any).mock.calls[2][0]).toBe('format-workout');
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

  it('should inject workout into chat session for continuity', async () => {
    const service = createNewOnboardingService({ runner: mockRunner });
    const user = { id: 'user-1', name: 'Test' } as any;

    await service.onboardUser(user, {});

    expect(mockRunner.sessions.append).toHaveBeenCalledWith(
      'chat:user-1',
      expect.arrayContaining([
        expect.objectContaining({
          role: 'assistant',
          content: expect.stringContaining('first workout'),
        }),
      ])
    );
  });

  it('should handle errors gracefully', async () => {
    (mockRunner.invoke as any).mockRejectedValue(new Error('Model unavailable'));

    const service = createNewOnboardingService({ runner: mockRunner });
    const user = { id: 'user-1' } as any;

    const result = await service.onboardUser(user, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain('Model unavailable');
  });

  it('should handle non-JSON format-workout output', async () => {
    (mockRunner.invoke as any).mockImplementation((agentId: string) => {
      if (agentId === 'format-workout') {
        return Promise.resolve({
          output: 'Plain text workout message',
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

    const service = createNewOnboardingService({ runner: mockRunner });
    const user = { id: 'user-1' } as any;

    const result = await service.onboardUser(user, {});

    expect(result.success).toBe(true);
    expect(result.workoutMessage).toBe('Plain text workout message');
  });
});
