import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { buildFormattedWorkoutSystemPrompt, createFormattedWorkoutUserPrompt } from './prompt';
import type { FormattedWorkoutConfig } from './types';
import { WorkoutChainContext } from '../../types';

/**
 * Formatted Workout Agent Factory
 *
 * Converts long-form workout descriptions to beautifully formatted markdown text.
 * This replaces the complex structured JSON approach with a more flexible text-based format.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that converts long-form workouts to formatted markdown strings
 */
export const createFormattedWorkoutAgent = (
  config: FormattedWorkoutConfig
) => {
  // Initialize model without schema (returns string)
  const model = initializeModel(undefined);

  return createRunnableAgent<WorkoutChainContext, string>(async (input) => {
    const { description } = input;

    // Build system and user prompts using config
    const systemPrompt = buildFormattedWorkoutSystemPrompt(config.includeModifications);
    const userPrompt = createFormattedWorkoutUserPrompt(description, config.includeModifications);

    // Invoke model with system and user prompts
    const formattedWorkout = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]) as string;

    return formattedWorkout;
  });
};
