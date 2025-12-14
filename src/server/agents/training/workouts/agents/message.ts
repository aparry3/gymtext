import { createAgent, type ConfigurableAgent } from '@/server/agents/configurable';
import { WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT, workoutSmsUserPrompt } from '../prompts';
import type { WorkoutMessageConfig, WorkoutMessageInput } from '../types';

/**
 * Workout Message Agent Factory
 *
 * Converts long-form workout descriptions to SMS-friendly messages.
 * Uses the configurable agent pattern for consistent model configuration.
 *
 * @param config - Static configuration for the agent
 * @returns ConfigurableAgent that converts workouts to SMS strings
 */
export const createWorkoutMessageAgent = (
  config?: WorkoutMessageConfig
): ConfigurableAgent<WorkoutMessageInput, { response: string }> => {
  return createAgent({
    name: `workout-message-${config?.operationName || 'default'}`,
    systemPrompt: WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
    userPrompt: (input: WorkoutMessageInput) => workoutSmsUserPrompt(input.response),
  }, { model: 'gpt-5-nano', ...config?.agentConfig });
};
