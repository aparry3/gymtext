import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { WORKOUT_MESSAGE_SYSTEM_PROMPT, createWorkoutMessageUserPrompt } from './prompts';
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
  const agentConfig = config?.agentConfig || {
    model: 'gemini-2.5-flash-lite',
    maxTokens: 4096
  };
  return createRunnableAgent<WorkoutMessageInput, WorkoutMessageOutput>(async (input) => {
    const { longFormWorkout } = input;

    // Create the user prompt with workout and context
    const userPrompt = createWorkoutMessageUserPrompt(longFormWorkout);

    // Initialize model without schema (for text generation)
    const model = initializeModel(undefined, agentConfig);

    // Invoke model with system and user prompts
    const response = await model.invoke([
      { role: 'system', content: WORKOUT_MESSAGE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);

    // Extract message content
    const message = typeof response.content === 'string' ? response.content : String(response.content);

    console.log(`[${config?.operationName || 'generate message'}] Generated SMS message (${message.length} characters)`);

    return message;
  });
};
