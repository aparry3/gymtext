import { createAgent, type SubAgentBatch } from '@/server/agents/configurable';
import { WorkoutStructureSchema } from '@/server/agents/training/schemas';
import {
  buildFormattedWorkoutSystemPrompt,
  createFormattedWorkoutUserPrompt,
  WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
  workoutSmsUserPrompt,
  STRUCTURED_WORKOUT_SYSTEM_PROMPT,
  structuredWorkoutUserPrompt,
  MODIFY_WORKOUT_SYSTEM_PROMPT,
  ModifyWorkoutGenerationOutputSchema,
} from '../prompts';
import type { ModifyWorkoutInput, ModifyWorkoutOutput, ModifyWorkoutAgentDeps } from '../types';

/**
 * Helper to extract overview from the modify response JSON string
 */
const extractOverview = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed.overview || jsonString;
  } catch {
    return jsonString;
  }
};

/**
 * Modify an existing workout based on user constraints
 *
 * Uses the configurable agent pattern:
 * 1. Main agent generates modified workout with structured output
 * 2. SubAgents run in parallel: formatted, message, structure (extracting overview)
 *
 * @param input - Workout modification input (user, date, workout, changeRequest)
 * @param deps - Optional dependencies (config)
 * @returns ModifyWorkoutOutput with response, formatted, message, and structure
 */
export const modifyWorkout = async (
  input: ModifyWorkoutInput,
  deps?: ModifyWorkoutAgentDeps
): Promise<ModifyWorkoutOutput> => {

  // SubAgents that extract overview from structured JSON response
  const subAgents: SubAgentBatch[] = [
    {
      formatted: createAgent({
        name: 'formatted-modify',
        systemPrompt: buildFormattedWorkoutSystemPrompt(true),
        userPrompt: (jsonInput: string) => createFormattedWorkoutUserPrompt(extractOverview(jsonInput), true),
      }, deps?.config),

      message: createAgent({
        name: 'message-modify',
        systemPrompt: WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
        userPrompt: (jsonInput: string) => workoutSmsUserPrompt(extractOverview(jsonInput)),
      }, { model: 'gpt-5-nano', ...deps?.config }),

      structure: createAgent({
        name: 'structure-modify',
        systemPrompt: STRUCTURED_WORKOUT_SYSTEM_PROMPT,
        userPrompt: (jsonInput: string) => structuredWorkoutUserPrompt(extractOverview(jsonInput)),
        schema: WorkoutStructureSchema,
      }, { model: 'gpt-5-nano', maxTokens: 32000, ...deps?.config }),
    },
  ];

  const agent = createAgent({
    name: 'workout-modify',
    systemPrompt: MODIFY_WORKOUT_SYSTEM_PROMPT,
    context: [
      `<WorkoutOverview>${input.workout.description || ''}</WorkoutOverview>`,
      input.user.profile ? `<Fitness Profile>${input.user.profile.trim()}</Fitness Profile>` : '',
      `<ChangesRequested>${input.changeRequest}</ChangesRequested>`,
    ].filter(Boolean),
    schema: ModifyWorkoutGenerationOutputSchema,
    subAgents,
  }, { model: 'gpt-5-mini', ...deps?.config });

  return agent.invoke(`Using the workout overview, fitness profile, and requested changes from the context, decide whether the workout needs to be modified.
- Follow the reasoning and modification rules from the system instructions.
- Preserve the original training intent and structure as much as possible.
- Apply substitutions or adjustments only when needed based on the user's request and profile.`) as Promise<ModifyWorkoutOutput>;
};

/**
 * @deprecated Use modifyWorkout() instead
 * Factory function maintained for backward compatibility
 */
export const createModifyWorkoutAgent = (deps?: ModifyWorkoutAgentDeps) => ({
  name: 'workout-modify',
  invoke: (input: ModifyWorkoutInput) => modifyWorkout(input, deps),
});
