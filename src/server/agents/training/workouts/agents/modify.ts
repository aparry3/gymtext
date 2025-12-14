import { createAgent, type ConfigurableAgent, type SubAgentBatch } from '@/server/agents/configurable';
import { WorkoutStructureSchema } from '@/server/agents/training/schemas';
import {
  buildFormattedWorkoutSystemPrompt,
  createFormattedWorkoutUserPrompt,
  WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
  workoutSmsUserPrompt,
  STRUCTURED_WORKOUT_SYSTEM_PROMPT,
  structuredWorkoutUserPrompt,
  MODIFY_WORKOUT_SYSTEM_PROMPT,
  modifyWorkoutUserPrompt,
  ModifyWorkoutGenerationOutputSchema,
} from '../prompts';
import type { ModifyWorkoutInput, ModifyWorkoutOutput, ModifyWorkoutAgentDeps } from '../types';

// Type for the modify response that subAgents receive
interface ModifySubAgentInput {
  response: {
    overview: string;
    wasModified: boolean;
    modifications: string;
  };
}

/**
 * Workout Modification Agent Factory
 *
 * Modifies an existing workout based on user constraints using the configurable agent pattern:
 * 1. Main agent generates modified workout with structured output
 * 2. SubAgents run in parallel: formatted, message, structure (extracting overview)
 *
 * @param deps - Optional dependencies (config)
 * @returns ConfigurableAgent that modifies workouts
 */
export const createModifyWorkoutAgent = (
  deps?: ModifyWorkoutAgentDeps
): ConfigurableAgent<ModifyWorkoutInput, ModifyWorkoutOutput> => {

  // SubAgents that extract overview from structured response
  const subAgents: SubAgentBatch[] = [
    {
      formatted: createAgent<ModifySubAgentInput, undefined>({
        name: 'formatted-modify',
        systemPrompt: buildFormattedWorkoutSystemPrompt(true),
        userPrompt: (input) => createFormattedWorkoutUserPrompt(input.response.overview, true),
      }, deps?.config),

      message: createAgent<ModifySubAgentInput, undefined>({
        name: 'message-modify',
        systemPrompt: WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
        userPrompt: (input) => workoutSmsUserPrompt(input.response.overview),
      }, { model: 'gpt-5-nano', ...deps?.config }),

      structure: createAgent<ModifySubAgentInput, typeof WorkoutStructureSchema>({
        name: 'structure-modify',
        systemPrompt: STRUCTURED_WORKOUT_SYSTEM_PROMPT,
        userPrompt: (input) => structuredWorkoutUserPrompt(input.response.overview),
        schema: WorkoutStructureSchema,
      }, { model: 'gpt-5-nano', maxTokens: 32000, ...deps?.config }),
    },
  ];

  return createAgent({
    name: 'workout-modify',
    systemPrompt: MODIFY_WORKOUT_SYSTEM_PROMPT,
    userPrompt: (input: ModifyWorkoutInput) => modifyWorkoutUserPrompt(
      input.user,
      input.workout.description!,
      input.changeRequest
    ),
    schema: ModifyWorkoutGenerationOutputSchema,
    subAgents,
  }, { model: 'gpt-5-mini', ...deps?.config }) as ConfigurableAgent<ModifyWorkoutInput, ModifyWorkoutOutput>;
};
