import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { createAgent } from '@/server/agents/configurable/createAgent';
import * as base from '@/server/agents/base';

// Mock the base module
vi.mock('@/server/agents/base', () => ({
  initializeModel: vi.fn(),
}));

describe('createAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic agent creation', () => {
    it('should create an agent with name and invoke method', () => {
      const mockModel = { invoke: vi.fn().mockResolvedValue('test response') };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      const agent = createAgent({
        name: 'test-agent',
        systemPrompt: 'You are a test assistant.',
        userPrompt: 'Hello',
      });

      expect(agent.name).toBe('test-agent');
      expect(typeof agent.invoke).toBe('function');
    });

    it('should invoke the model with correct message structure', async () => {
      const mockModel = { invoke: vi.fn().mockResolvedValue('test response') };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      const agent = createAgent({
        name: 'test-agent',
        systemPrompt: 'System prompt',
        userPrompt: 'User prompt',
      });

      await agent.invoke({});

      expect(mockModel.invoke).toHaveBeenCalledWith([
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'User prompt' },
      ]);
    });

    it('should wrap result in response property', async () => {
      const mockModel = { invoke: vi.fn().mockResolvedValue('model output') };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      const agent = createAgent({
        name: 'test-agent',
        systemPrompt: 'System',
        userPrompt: 'User',
      });

      const result = await agent.invoke({});

      expect(result).toEqual({ response: 'model output' });
    });
  });

  describe('dynamic userPrompt', () => {
    it('should support function userPrompt', async () => {
      const mockModel = { invoke: vi.fn().mockResolvedValue('response') };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      const agent = createAgent<{ name: string }>({
        name: 'test-agent',
        systemPrompt: 'System',
        userPrompt: (input) => `Hello, ${input.name}!`,
      });

      await agent.invoke({ name: 'World' });

      expect(mockModel.invoke).toHaveBeenCalledWith([
        { role: 'system', content: 'System' },
        { role: 'user', content: 'Hello, World!' },
      ]);
    });
  });

  describe('context support', () => {
    it('should include context messages between system and user', async () => {
      const mockModel = { invoke: vi.fn().mockResolvedValue('response') };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      const agent = createAgent({
        name: 'test-agent',
        systemPrompt: 'System',
        userPrompt: 'User',
        context: ['Context 1', 'Context 2'],
      });

      await agent.invoke({});

      expect(mockModel.invoke).toHaveBeenCalledWith([
        { role: 'system', content: 'System' },
        { role: 'user', content: 'Context 1' },
        { role: 'user', content: 'Context 2' },
        { role: 'user', content: 'User' },
      ]);
    });
  });

  describe('schema support', () => {
    it('should pass schema to initializeModel', () => {
      const TestSchema = z.object({ message: z.string() });
      const mockModel = { invoke: vi.fn().mockResolvedValue({ message: 'test' }) };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      createAgent({
        name: 'test-agent',
        systemPrompt: 'System',
        userPrompt: 'User',
        schema: TestSchema,
      });

      expect(base.initializeModel).toHaveBeenCalledWith(
        TestSchema,
        undefined
      );
    });
  });

  describe('subAgents support', () => {
    it('should execute subAgents and combine results', async () => {
      const mockModel = { invoke: vi.fn().mockResolvedValue('main response') };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      const subAgent = {
        name: 'sub-agent',
        invoke: vi.fn().mockResolvedValue('sub response'),
      };

      const agent = createAgent({
        name: 'main-agent',
        systemPrompt: 'System',
        userPrompt: 'User',
        subAgents: [{ formatted: subAgent }],
      });

      const result = await agent.invoke({});

      expect(result).toEqual({
        response: 'main response',
        formatted: 'sub response',
      });
      expect(subAgent.invoke).toHaveBeenCalled();
    });

    it('should pass main response to subAgents', async () => {
      const mockModel = { invoke: vi.fn().mockResolvedValue('main response') };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      const capturedInput: unknown[] = [];
      const subAgent = {
        name: 'sub-agent',
        invoke: vi.fn().mockImplementation((input) => {
          capturedInput.push(input);
          return Promise.resolve('sub response');
        }),
      };

      const agent = createAgent({
        name: 'main-agent',
        systemPrompt: 'System',
        userPrompt: 'User',
        subAgents: [{ sub: subAgent }],
      });

      await agent.invoke({ originalInput: 'value' });

      expect(capturedInput[0]).toEqual({
        originalInput: 'value',
        response: 'main response',
      });
    });

    it('should execute multiple batches sequentially', async () => {
      const mockModel = { invoke: vi.fn().mockResolvedValue('main') };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      const executionOrder: string[] = [];

      const batch1Agent = {
        name: 'batch1',
        invoke: vi.fn().mockImplementation(async () => {
          executionOrder.push('batch1');
          return 'result1';
        }),
      };

      const batch2Agent = {
        name: 'batch2',
        invoke: vi.fn().mockImplementation(async () => {
          executionOrder.push('batch2');
          return 'result2';
        }),
      };

      const agent = createAgent({
        name: 'main-agent',
        systemPrompt: 'System',
        userPrompt: 'User',
        subAgents: [
          { first: batch1Agent },
          { second: batch2Agent },
        ],
      });

      const result = await agent.invoke({});

      expect(executionOrder).toEqual(['batch1', 'batch2']);
      expect(result).toEqual({
        response: 'main',
        first: 'result1',
        second: 'result2',
      });
    });
  });

  describe('model configuration', () => {
    it('should pass model config to initializeModel', () => {
      const mockModel = { invoke: vi.fn().mockResolvedValue('response') };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      createAgent({
        name: 'test-agent',
        systemPrompt: 'System',
        userPrompt: 'User',
      }, {
        model: 'gpt-5.1',
        maxTokens: 4000,
        temperature: 0.5,
      });

      expect(base.initializeModel).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          model: 'gpt-5.1',
          maxTokens: 4000,
          temperature: 0.5,
        })
      );
    });
  });

  describe('error handling', () => {
    it('should propagate errors from model invocation', async () => {
      const mockModel = {
        invoke: vi.fn().mockRejectedValue(new Error('Model error')),
      };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      const agent = createAgent({
        name: 'test-agent',
        systemPrompt: 'System',
        userPrompt: 'User',
      });

      await expect(agent.invoke({})).rejects.toThrow('Model error');
    });

    it('should propagate errors from subAgents', async () => {
      const mockModel = { invoke: vi.fn().mockResolvedValue('main') };
      vi.mocked(base.initializeModel).mockReturnValue(mockModel);

      const failingSubAgent = {
        name: 'failing',
        invoke: vi.fn().mockRejectedValue(new Error('SubAgent error')),
      };

      const agent = createAgent({
        name: 'main-agent',
        systemPrompt: 'System',
        userPrompt: 'User',
        subAgents: [{ failing: failingSubAgent }],
      });

      await expect(agent.invoke({})).rejects.toThrow('SubAgent error');
    });
  });
});
