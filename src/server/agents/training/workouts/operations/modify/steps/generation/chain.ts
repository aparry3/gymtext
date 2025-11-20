import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import {
  ModifyWorkoutGenerationInput,
  ModifyWorkoutGenerationConfig,
  ModifyWorkoutGenerationOutputSchema,
  ModifyWorkoutGenerationOutput,
} from './types';
import { WorkoutChainContext } from '../../../../shared/types';
import { SYSTEM_PROMPT, userPrompt } from './prompt';

/**
 * Workout Modification Generation Runnable
 *
 * Generates modified workout text using structured output with conditional modifications tracking.
 *
 * Uses Zod schema to parse JSON output with:
 * - overview: Full workout text (modified or original)
 * - wasModified: Boolean indicating if changes were made
 * - modifications: (conditional) Explanation of changes when wasModified is true
 *
 * The overview field is extracted and returned as "description" for downstream processing.
 *
 * @param config - Configuration containing (optionally) agent/model settings
 * @returns Agent (runnable) that produces workout context with modification tracking
 */
export const createModifyWorkoutGenerationRunnable = (config: ModifyWorkoutGenerationConfig) => {
  // Initialize model with structured output schema
  const model = initializeModel(ModifyWorkoutGenerationOutputSchema, config.agentConfig);

  return createRunnableAgent(async (input: ModifyWorkoutGenerationInput): Promise<WorkoutChainContext> => {
    const prompt = userPrompt(input.user, input.workout.description!, input.changeRequest);

    // Invoke model with structured output
    const result = await model.invoke([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]) as ModifyWorkoutGenerationOutput;

    // Log modification status
    if (result.wasModified && result.modifications) {
      console.log('[modify generation] Workout was modified:', result.modifications);
    } else {
      console.log('[modify generation] Workout was not modified - original workout satisfies constraints');
    }

    // Extract overview as description for downstream processing
    // Preserve modification metadata for potential logging/debugging
    return {
      description: result.overview,
      user: input.user,
      date: input.date,
      // Metadata (modifications will be empty string if not modified)
      wasModified: result.wasModified,
      modifications: result.modifications,
    };
  });
}
