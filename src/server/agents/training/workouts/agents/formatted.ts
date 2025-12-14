import { createAgent, type ConfigurableAgent } from '@/server/agents/configurable';
import { buildFormattedWorkoutSystemPrompt, createFormattedWorkoutUserPrompt } from '../prompts';
import type { FormattedWorkoutConfig, FormattedWorkoutInput } from '../types';

/**
 * Formatted Workout Agent Factory
 *
 * Converts long-form workout descriptions to beautifully formatted markdown text.
 * Uses the configurable agent pattern for consistent model configuration.
 *
 * @param config - Static configuration for the agent
 * @returns ConfigurableAgent that converts workouts to formatted markdown strings
 */
export const createFormattedWorkoutAgent = (
  config: FormattedWorkoutConfig
): ConfigurableAgent<FormattedWorkoutInput, { response: string }> => {
  return createAgent({
    name: `formatted-workout-${config.operationName || 'default'}`,
    systemPrompt: buildFormattedWorkoutSystemPrompt(config.includeModifications),
    userPrompt: (input: FormattedWorkoutInput) => createFormattedWorkoutUserPrompt(
      input.response,
      config.includeModifications
    ),
  }, config.agentConfig);
};
