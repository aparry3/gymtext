import { createAgent, type ConfigurableAgent } from '@/server/agents/configurable';
import { WorkoutStructureSchema, type WorkoutStructure } from '@/server/agents/training/schemas';
import { STRUCTURED_WORKOUT_SYSTEM_PROMPT, structuredWorkoutUserPrompt } from '../prompts';
import type { StructuredWorkoutConfig } from '../types';

/**
 * Structured Workout Agent Factory
 *
 * Parses long-form workout descriptions into structured WorkoutStructure objects.
 * Uses the configurable agent pattern with schema for structured output.
 *
 * @param config - Static configuration for the agent
 * @returns ConfigurableAgent that produces structured workout data
 */
export const createStructuredWorkoutAgent = (
  config?: StructuredWorkoutConfig
): ConfigurableAgent<{ response: WorkoutStructure }> => {
  return createAgent({
    name: `structured-workout-${config?.operationName || 'default'}`,
    systemPrompt: STRUCTURED_WORKOUT_SYSTEM_PROMPT,
    userPrompt: (input: string) => structuredWorkoutUserPrompt(input),
    schema: WorkoutStructureSchema,
  }, { model: 'gpt-5-nano', maxTokens: 32000, ...config?.agentConfig });
};
