import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { WorkoutStructureSchema } from '@/server/agents/training/schemas';
import { STRUCTURED_WORKOUT_SYSTEM_PROMPT, structuredWorkoutUserPrompt } from './prompt';
import type { StructuredWorkoutConfig, StructuredWorkoutInput, StructuredWorkoutOutput } from './types';

/**
 * Structured Workout Agent Factory
 *
 * Parses long-form workout descriptions into structured WorkoutStructure objects.
 * Uses LLM with structured output for reliable parsing.
 *
 * @param config - Static configuration for the agent
 * @returns Agent that produces structured workout data
 */
export const createStructuredWorkoutAgent = (config?: StructuredWorkoutConfig) => {
  // Initialize model WITH schema for structured output
  const model = initializeModel(WorkoutStructureSchema, {
    model: 'gpt-5-nano',
    maxTokens: 32000,
    ...config?.agentConfig
  });

  return createRunnableAgent<StructuredWorkoutInput, StructuredWorkoutOutput>(async (input) => {
    const { description } = input;

    const userPrompt = structuredWorkoutUserPrompt(description);

    const structure = await model.invoke([
      { role: 'system', content: STRUCTURED_WORKOUT_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]) as StructuredWorkoutOutput;

    const exerciseCount = structure.sections.reduce(
      (sum, section) => sum + section.exercises.length,
      0
    );
    console.log(
      `[${config?.operationName || 'structured workout'}] Parsed workout with ${structure.sections.length} sections, ${exerciseCount} exercises`
    );

    return structure;
  });
};
