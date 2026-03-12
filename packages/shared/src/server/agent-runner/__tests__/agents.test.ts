import { describe, it, expect } from 'vitest';
import { chatAgent, updateFitnessAgent, getWorkoutAgent, formatWorkoutAgent } from '../agents/index.js';

describe('agent definitions', () => {
  it('should define chat agent with correct properties', () => {
    expect(chatAgent.id).toBe('chat');
    expect(chatAgent.name).toBe('Chat Coach');
    expect(chatAgent.systemPrompt).toContain('personal trainer');
    expect(chatAgent.model.provider).toBe('openai');
    expect(chatAgent.model.name).toBe('gpt-4o');
    expect(chatAgent.tools).toHaveLength(3);
  });

  it('should define update-fitness agent', () => {
    expect(updateFitnessAgent.id).toBe('update-fitness');
    expect(updateFitnessAgent.contextWrite).toBe(true);
    expect(updateFitnessAgent.systemPrompt).toContain('fitness context manager');
  });

  it('should define get-workout agent with output schema', () => {
    expect(getWorkoutAgent.id).toBe('get-workout');
    expect(getWorkoutAgent.outputSchema).toBeDefined();
    expect(getWorkoutAgent.outputSchema?.type).toBe('object');
    expect(getWorkoutAgent.outputSchema?.required).toContain('isRestDay');
    expect(getWorkoutAgent.outputSchema?.required).toContain('workoutType');
  });

  it('should define format-workout agent with lightweight model', () => {
    expect(formatWorkoutAgent.id).toBe('format-workout');
    expect(formatWorkoutAgent.model.name).toBe('gpt-4o-mini');
    expect(formatWorkoutAgent.outputSchema).toBeDefined();
    expect(formatWorkoutAgent.outputSchema?.required).toContain('message');
    expect(formatWorkoutAgent.outputSchema?.required).toContain('details');
  });

  it('should have valid timestamps on all agents', () => {
    for (const agent of [chatAgent, updateFitnessAgent, getWorkoutAgent, formatWorkoutAgent]) {
      expect(agent.createdAt).toBeDefined();
      expect(agent.updatedAt).toBeDefined();
      // Timestamps should be valid ISO strings
      expect(() => new Date(agent.createdAt!)).not.toThrow();
    }
  });

  it('chat agent tools should reference inline tools', () => {
    for (const tool of chatAgent.tools!) {
      expect(tool).toHaveProperty('type', 'inline');
      expect(tool).toHaveProperty('name');
    }
  });

  it('all tool references should match registered tool names', () => {
    const expectedToolNames = ['update_fitness_context', 'get_todays_workout', 'modify_plan'];
    const chatToolNames = chatAgent.tools!.map((t: any) => t.name);
    expect(chatToolNames).toEqual(expectedToolNames);
  });
});
