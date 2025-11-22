import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT, workoutSmsUserPrompt } from './prompt';
import type { WorkoutMessageConfig, WorkoutMessageInput, WorkoutMessageOutput } from './types';

/**
 * Workout Message Agent Factory
 *
 * Converts long-form workout descriptions to SMS-friendly messages.
 * Generates messages containing ONLY the workout structure (no greetings or motivational content).
 *
 * Used by workout generation chains and fallback message generation.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that converts long-form workouts to SMS strings
 */
export const createWorkoutMessageAgent = (config?: WorkoutMessageConfig) => {
  const model = initializeModel(undefined);
  return createRunnableAgent<WorkoutMessageInput, WorkoutMessageOutput>(async (input) => {
    const { description } = input;

    // Create the user prompt with workout and context
    const userPrompt = workoutSmsUserPrompt(description);

    // Invoke model with system and user prompts
    const message = await model.invoke([
      { role: 'system', content: WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);

    console.log(`[${config?.operationName || 'generate message'}] Generated SMS message (${message.length} characters)`);

    return message;
  });
};
