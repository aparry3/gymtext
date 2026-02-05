import { describe, it, expect, beforeEach } from 'vitest';
import { agentRegistry } from '@/server/agents/registry/agentRegistry';

describe('AgentRegistry', () => {
  beforeEach(() => {
    agentRegistry.clear();
  });

  describe('register', () => {
    it('should register an agent config', () => {
      agentRegistry.register({
        name: 'test:agent',
        model: 'gpt-5-nano',
        tools: ['tool_a', 'tool_b'],
      });

      expect(agentRegistry.has('test:agent')).toBe(true);
    });

    it('should throw on duplicate registration', () => {
      const config = { name: 'test:agent' };
      agentRegistry.register(config);
      expect(() => agentRegistry.register(config)).toThrow('already registered');
    });
  });

  describe('get', () => {
    it('should return the registered config', () => {
      agentRegistry.register({
        name: 'test:agent',
        model: 'gpt-5-nano',
        tools: ['tool_a'],
        callbacks: [{ name: 'send_sms', when: 'on_success' }],
      });

      const config = agentRegistry.get('test:agent');
      expect(config).toBeDefined();
      expect(config!.model).toBe('gpt-5-nano');
      expect(config!.tools).toEqual(['tool_a']);
      expect(config!.callbacks).toEqual([{ name: 'send_sms', when: 'on_success' }]);
    });

    it('should return undefined for unregistered agents', () => {
      expect(agentRegistry.get('nonexistent')).toBeUndefined();
    });
  });

  describe('transforms and conditions', () => {
    it('should register and retrieve transforms', () => {
      const transformFn = (result: unknown) => JSON.stringify(result);
      agentRegistry.registerTransform('my_transform', transformFn);

      expect(agentRegistry.getTransform('my_transform')).toBe(transformFn);
    });

    it('should register and retrieve conditions', () => {
      const conditionFn = (result: unknown) => !!(result as { wasUpdated: boolean }).wasUpdated;
      agentRegistry.registerCondition('was_updated', conditionFn);

      expect(agentRegistry.getCondition('was_updated')).toBe(conditionFn);
    });
  });

  describe('validators', () => {
    it('should register and retrieve validators', () => {
      agentRegistry.registerValidator({
        name: 'workout_validator',
        validate: (result) => ({ isValid: true }),
      });

      const validator = agentRegistry.getValidator('workout_validator');
      expect(validator).toBeDefined();
      expect(validator!.validate({})).toEqual({ isValid: true });
    });
  });

  describe('getDependencyGraph', () => {
    it('should return a graph of agent dependencies', () => {
      agentRegistry.register({
        name: 'main:agent',
        tools: ['tool_a', 'tool_b'],
        subAgents: [[{ key: 'sub', agentName: 'sub:agent' }]],
        callbacks: [{ name: 'callback_a' }],
      });

      agentRegistry.register({
        name: 'sub:agent',
        tools: ['tool_c'],
      });

      const graph = agentRegistry.getDependencyGraph();

      expect(graph['main:agent']).toEqual({
        tools: ['tool_a', 'tool_b'],
        subAgents: ['sub:agent'],
        callbacks: ['callback_a'],
      });

      expect(graph['sub:agent']).toEqual({
        tools: ['tool_c'],
        subAgents: [],
        callbacks: [],
      });
    });
  });
});
