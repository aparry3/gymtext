import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { toolRegistry } from '@/server/agents/registry/toolRegistry';
import type { ToolContext } from '@/server/agents/registry/toolRegistry';

describe('ToolRegistry', () => {
  beforeEach(() => {
    toolRegistry.clear();
  });

  describe('register', () => {
    it('should register a tool', () => {
      toolRegistry.register({
        name: 'test_tool',
        description: 'A test tool',
        schema: z.object({}),
        priority: 1,
        toolType: 'action',
        execute: async () => ({ response: 'ok' }),
      });

      expect(toolRegistry.has('test_tool')).toBe(true);
    });

    it('should throw on duplicate registration', () => {
      const def = {
        name: 'test_tool',
        description: 'A test tool',
        schema: z.object({}),
        priority: 1,
        toolType: 'action' as const,
        execute: async () => ({ response: 'ok' }),
      };

      toolRegistry.register(def);
      expect(() => toolRegistry.register(def)).toThrow('already registered');
    });
  });

  describe('getPriority', () => {
    it('should return registered priority', () => {
      toolRegistry.register({
        name: 'high_priority',
        description: 'High priority tool',
        schema: z.object({}),
        priority: 1,
        toolType: 'action',
        execute: async () => ({ response: 'ok' }),
      });

      expect(toolRegistry.getPriority('high_priority')).toBe(1);
    });

    it('should return 99 for unregistered tools', () => {
      expect(toolRegistry.getPriority('nonexistent')).toBe(99);
    });
  });

  describe('createTools', () => {
    it('should create LangChain tools from registered definitions', () => {
      toolRegistry.register({
        name: 'tool_a',
        description: 'Tool A',
        schema: z.object({}),
        priority: 2,
        toolType: 'action',
        execute: async () => ({ response: 'a' }),
      });

      toolRegistry.register({
        name: 'tool_b',
        description: 'Tool B',
        schema: z.object({}),
        priority: 1,
        toolType: 'query',
        execute: async () => ({ response: 'b' }),
      });

      const context: ToolContext = {
        userId: 'user-1',
        message: 'hello',
        timezone: 'UTC',
      };

      const tools = toolRegistry.createTools(['tool_a', 'tool_b'], context);

      expect(tools).toHaveLength(2);
      // Should be sorted by priority (tool_b first)
      expect(tools[0].name).toBe('tool_b');
      expect(tools[1].name).toBe('tool_a');
    });

    it('should throw for unregistered tool names', () => {
      const context: ToolContext = {
        userId: 'user-1',
        message: 'hello',
        timezone: 'UTC',
      };

      expect(() => toolRegistry.createTools(['nonexistent'], context)).toThrow('not registered');
    });
  });

  describe('replace', () => {
    it('should replace an existing tool', () => {
      toolRegistry.register({
        name: 'test_tool',
        description: 'Original',
        schema: z.object({}),
        priority: 1,
        toolType: 'action',
        execute: async () => ({ response: 'original' }),
      });

      toolRegistry.replace({
        name: 'test_tool',
        description: 'Replaced',
        schema: z.object({}),
        priority: 2,
        toolType: 'query',
        execute: async () => ({ response: 'replaced' }),
      });

      expect(toolRegistry.get('test_tool')?.description).toBe('Replaced');
      expect(toolRegistry.getPriority('test_tool')).toBe(2);
    });
  });

  describe('listTools', () => {
    it('should return all registered tool names', () => {
      toolRegistry.register({
        name: 'tool_a',
        description: 'A',
        schema: z.object({}),
        priority: 1,
        toolType: 'action',
        execute: async () => ({ response: 'a' }),
      });

      toolRegistry.register({
        name: 'tool_b',
        description: 'B',
        schema: z.object({}),
        priority: 2,
        toolType: 'action',
        execute: async () => ({ response: 'b' }),
      });

      const names = toolRegistry.listTools();
      expect(names).toContain('tool_a');
      expect(names).toContain('tool_b');
    });
  });
});
