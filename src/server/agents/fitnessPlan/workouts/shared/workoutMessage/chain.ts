import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { WORKOUT_MESSAGE_SYSTEM_PROMPT, createWorkoutMessageUserPrompt } from './prompts';
import type { WorkoutMessageInput, WorkoutMessageOutput } from './types';

/**
 * Workout Message Agent Factory
 *
 * Converts long-form workout descriptions to SMS-friendly messages.
 * Fetches fitness profile internally and generates messages containing
 * ONLY the workout structure (no greetings or motivational content).
 *
 * Used by workout generation chains and fallback message generation.
 *
 * @returns Agent that converts long-form workouts to SMS strings
 */
export const createWorkoutMessageAgent = () => {
  return createRunnableAgent<WorkoutMessageInput, WorkoutMessageOutput>(async (input) => {
    const { longFormWorkout, user, operationName } = input;

    // Fetch fitness profile for context
    const fitnessProfileContext = new FitnessProfileContext();
    const fitnessProfile = await fitnessProfileContext.getContext(user);

    // Create the user prompt with workout and context
    const userPrompt = createWorkoutMessageUserPrompt(longFormWorkout, user, fitnessProfile);

    // Initialize model without schema (for text generation)
    const model = initializeModel(undefined);

    // Invoke model with system and user prompts
    const response = await model.invoke([
      { role: 'system', content: WORKOUT_MESSAGE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);

    // Extract message content
    const message = typeof response.content === 'string' ? response.content : String(response.content);

    console.log(`[${operationName || 'generate message'}] Generated SMS message (${message.length} characters)`);

    return message;
  });
};
