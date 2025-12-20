import { describe, it, expect } from 'vitest';
import { buildMessages } from '@/server/agents/utils';

describe('buildMessages', () => {
  it('should build messages in correct order: system, context, previous, user', () => {
    const result = buildMessages({
      systemPrompt: 'You are a helpful assistant.',
      userPrompt: 'Hello, how are you?',
      context: ['Context 1', 'Context 2'],
      previousMessages: [
        { role: 'user', content: 'Previous question' },
        { role: 'assistant', content: 'Previous answer' },
      ],
    });

    expect(result).toHaveLength(6);
    expect(result[0]).toEqual({ role: 'system', content: 'You are a helpful assistant.' });
    expect(result[1]).toEqual({ role: 'user', content: 'Context 1' });
    expect(result[2]).toEqual({ role: 'user', content: 'Context 2' });
    expect(result[3]).toEqual({ role: 'user', content: 'Previous question' });
    expect(result[4]).toEqual({ role: 'assistant', content: 'Previous answer' });
    expect(result[5]).toEqual({ role: 'user', content: 'Hello, how are you?' });
  });

  it('should handle empty context array', () => {
    const result = buildMessages({
      systemPrompt: 'System prompt',
      userPrompt: 'User message',
      context: [],
    });

    expect(result).toHaveLength(2);
    expect(result[0].role).toBe('system');
    expect(result[1].role).toBe('user');
  });

  it('should filter out empty context strings', () => {
    const result = buildMessages({
      systemPrompt: 'System prompt',
      userPrompt: 'User message',
      context: ['Valid context', '', '   ', 'Another valid'],
    });

    expect(result).toHaveLength(4);
    expect(result[1].content).toBe('Valid context');
    expect(result[2].content).toBe('Another valid');
  });

  it('should handle undefined context', () => {
    const result = buildMessages({
      systemPrompt: 'System prompt',
      userPrompt: 'User message',
    });

    expect(result).toHaveLength(2);
  });

  it('should handle undefined previousMessages', () => {
    const result = buildMessages({
      systemPrompt: 'System prompt',
      userPrompt: 'User message',
      context: ['Some context'],
    });

    expect(result).toHaveLength(3);
  });
});
