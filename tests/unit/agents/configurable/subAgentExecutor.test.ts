import { describe, it, expect, vi } from 'vitest';
import { executeSubAgents } from '@/server/agents/subAgentExecutor';
import type { ConfigurableAgent } from '@/server/agents/types';

describe('executeSubAgents', () => {
  it('should execute agents within a batch in parallel', async () => {
    const executionOrder: string[] = [];

    const agentA: ConfigurableAgent<unknown, string> = {
      name: 'agent-a',
      invoke: async () => {
        executionOrder.push('a-start');
        await new Promise(resolve => setTimeout(resolve, 50));
        executionOrder.push('a-end');
        return 'result-a';
      },
    };

    const agentB: ConfigurableAgent<unknown, string> = {
      name: 'agent-b',
      invoke: async () => {
        executionOrder.push('b-start');
        await new Promise(resolve => setTimeout(resolve, 10));
        executionOrder.push('b-end');
        return 'result-b';
      },
    };

    const result = await executeSubAgents({
      batches: [{ a: agentA, b: agentB }],
      input: {},
      previousResults: { response: 'main-result' },
      parentName: 'test',
    });

    expect(result).toEqual({
      a: 'result-a',
      b: 'result-b',
    });

    // Both should start before either finishes (parallel execution)
    expect(executionOrder.indexOf('a-start')).toBeLessThan(executionOrder.indexOf('a-end'));
    expect(executionOrder.indexOf('b-start')).toBeLessThan(executionOrder.indexOf('b-end'));
    // B should finish before A since it has shorter delay
    expect(executionOrder.indexOf('b-end')).toBeLessThan(executionOrder.indexOf('a-end'));
  });

  it('should execute batches sequentially', async () => {
    const executionOrder: string[] = [];

    const batch1Agent: ConfigurableAgent<unknown, string> = {
      name: 'batch1',
      invoke: async () => {
        executionOrder.push('batch1');
        return 'result-1';
      },
    };

    const batch2Agent: ConfigurableAgent<{ batch1Result: string }, string> = {
      name: 'batch2',
      invoke: async (input) => {
        executionOrder.push('batch2');
        return `result-2-with-${(input as { batch1Result?: string }).batch1Result || 'none'}`;
      },
    };

    const result = await executeSubAgents({
      batches: [
        { batch1Result: batch1Agent },
        { batch2Result: batch2Agent },
      ],
      input: {},
      previousResults: { response: 'main' },
      parentName: 'test',
    });

    expect(executionOrder).toEqual(['batch1', 'batch2']);
    expect(result).toEqual({
      batch1Result: 'result-1',
      batch2Result: 'result-2-with-result-1',
    });
  });

  it('should pass accumulated results to subsequent batches', async () => {
    const capturedInputs: unknown[] = [];

    const firstAgent: ConfigurableAgent<unknown, string> = {
      name: 'first',
      invoke: async (input) => {
        capturedInputs.push({ ...input as object });
        return 'first-result';
      },
    };

    const secondAgent: ConfigurableAgent<unknown, string> = {
      name: 'second',
      invoke: async (input) => {
        capturedInputs.push({ ...input as object });
        return 'second-result';
      },
    };

    await executeSubAgents({
      batches: [
        { first: firstAgent },
        { second: secondAgent },
      ],
      input: { originalInput: 'value' },
      previousResults: { response: 'main-response' },
      parentName: 'test',
    });

    // First agent should receive original input + response
    expect(capturedInputs[0]).toEqual({
      originalInput: 'value',
      response: 'main-response',
    });

    // Second agent should receive original input + response + first result
    expect(capturedInputs[1]).toEqual({
      originalInput: 'value',
      response: 'main-response',
      first: 'first-result',
    });
  });

  it('should fail fast if any agent throws', async () => {
    const agentSuccess: ConfigurableAgent<unknown, string> = {
      name: 'success',
      invoke: async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'success';
      },
    };

    const agentFail: ConfigurableAgent<unknown, string> = {
      name: 'fail',
      invoke: async () => {
        throw new Error('Agent failed');
      },
    };

    await expect(
      executeSubAgents({
        batches: [{ success: agentSuccess, fail: agentFail }],
        input: {},
        previousResults: { response: 'main' },
        parentName: 'test',
      })
    ).rejects.toThrow('Agent failed');
  });

  it('should not include response key in returned results', async () => {
    const agent: ConfigurableAgent<unknown, string> = {
      name: 'test',
      invoke: async () => 'result',
    };

    const result = await executeSubAgents({
      batches: [{ subResult: agent }],
      input: {},
      previousResults: { response: 'main-response' },
      parentName: 'test',
    });

    expect(result).not.toHaveProperty('response');
    expect(result).toEqual({ subResult: 'result' });
  });
});
