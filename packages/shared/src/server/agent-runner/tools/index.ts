/**
 * GymText Agent Tools
 *
 * Tools available to agents during execution.
 * These are registered with the Runner on startup.
 */
import { defineTool, type Runner } from '@agent-runner/core';
import { z } from 'zod';

/**
 * Tool: update_fitness_context
 *
 * Called by the chat agent when the user wants to change their
 * profile, goals, equipment, schedule, or training plan.
 */
const updateFitnessContextTool = defineTool({
  name: 'update_fitness_context',
  description: 'Update the user\'s fitness profile, goals, equipment, schedule, or training plan based on their request.',
  input: z.object({
    updateDescription: z.string().describe('Description of what the user wants to change'),
  }),
  execute: async (input: { updateDescription: string }, ctx: any) => {
    const runner = ctx.runner as Runner;
    const userId = ctx.userId as string;
    if (!runner || !userId) {
      return { success: false, error: 'Missing runner or userId in tool context' };
    }
    const contextId = `users/${userId}/fitness`;
    const result = await runner.invoke('update-fitness', input.updateDescription, {
      contextIds: [contextId],
    });
    return { success: true, summary: 'Fitness context updated', output: result.output.substring(0, 200) + '...' };
  },
});

/**
 * Tool: get_todays_workout
 *
 * Called by the chat agent when the user asks about today's workout.
 */
const getTodaysWorkoutTool = defineTool({
  name: 'get_todays_workout',
  description: 'Get today\'s workout for the user. Use when they ask about their workout or schedule.',
  input: z.object({
    date: z.string().optional().describe('Date to get workout for (ISO format). Defaults to today.'),
  }),
  execute: async (input: { date?: string }, ctx: any) => {
    const runner = ctx.runner as Runner;
    const userId = ctx.userId as string;
    const timezone = (ctx.timezone as string) || 'America/New_York';
    if (!runner || !userId) {
      return { success: false, error: 'Missing runner or userId in tool context' };
    }
    const date = input.date || new Date().toISOString().split('T')[0];
    const contextId = `users/${userId}/fitness`;
    const result = await runner.invoke('get-workout', JSON.stringify({ date, timezone }), {
      contextIds: [contextId],
    });
    return { success: true, workout: result.output };
  },
});

/**
 * Tool: modify_plan
 *
 * Called by the chat agent when the user wants specific plan modifications.
 */
const modifyPlanTool = defineTool({
  name: 'modify_plan',
  description: 'Modify the user\'s training plan. Use when they want to swap exercises, adjust volume, change workout days, etc.',
  input: z.object({
    modification: z.string().describe('What the user wants to change about their plan'),
  }),
  execute: async (input: { modification: string }, ctx: any) => {
    const runner = ctx.runner as Runner;
    const userId = ctx.userId as string;
    if (!runner || !userId) {
      return { success: false, error: 'Missing runner or userId in tool context' };
    }
    const contextId = `users/${userId}/fitness`;
    const result = await runner.invoke('update-fitness', `Plan modification request: ${input.modification}`, {
      contextIds: [contextId],
    });
    return { success: true, summary: 'Plan updated', output: result.output.substring(0, 200) + '...' };
  },
});

/**
 * Register all gymtext tools with the Runner.
 */
export function registerGymtextTools(runner: Runner): void {
  runner.registerTool(updateFitnessContextTool);
  runner.registerTool(getTodaysWorkoutTool);
  runner.registerTool(modifyPlanTool);
}
