import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { buildFormattedWorkoutSystemPrompt, createFormattedWorkoutUserPrompt } from './prompt';
import type { FormattedWorkoutConfig, FormattedWorkoutOutput } from './types';
import { WorkoutChainContext } from '../../chainFactory';

/**
 * Formatted Workout Agent Factory
 *
 * Converts long-form workout descriptions to beautifully formatted markdown text.
 * This replaces the complex structured JSON approach with a more flexible text-based format.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that converts long-form workouts to formatted markdown
 */
export const createFormattedWorkoutAgent = <TWorkout = unknown>(
  config: FormattedWorkoutConfig
) => {
  const agentConfig = config.agentConfig || {
    model: 'gemini-2.5-flash-lite',
    maxTokens: 16384
  };

  // Initialize model with schema from config
  const model = initializeModel(config.schema, agentConfig);

  return createRunnableAgent<WorkoutChainContext, FormattedWorkoutOutput<TWorkout>>(async (input) => {
    const { longFormWorkout, user, fitnessProfile, date } = input;

    // Build system and user prompts using config
    const systemPrompt = buildFormattedWorkoutSystemPrompt(config.includeModifications);
    const userPrompt = createFormattedWorkoutUserPrompt(longFormWorkout, user, fitnessProfile, config.includeModifications);

    // Invoke model with system and user prompts
    const workout = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]) as TWorkout;

    // Validate the workout structure
    const validatedWorkout = config.schema.parse(workout);

    // Basic validation - ensure formatted text exists and is not empty
    if ('formatted' in validatedWorkout) {
      const formatted = validatedWorkout.formatted as string;
      if (!formatted || formatted.trim().length < 100) {
        throw new Error('Formatted workout is too short or empty');
      }
      // Check for required markdown headers
      if (!formatted.includes('# ') || !formatted.includes('## ')) {
        throw new Error('Formatted workout missing required headers');
      }
    }

    console.log(`[${config.operationName}] Generated formatted workout (${config.includeModifications ? 'with modifications' : 'new'})`);

    // Add date to workout
    return {
      ...validatedWorkout,
      date
    } as FormattedWorkoutOutput<TWorkout>;
  });
};
