import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { buildStructuredWorkoutSystemPrompt, createStructuredWorkoutUserPrompt } from './prompts';
import type { StructuredWorkoutConfig, StructuredWorkoutInput, StructuredWorkoutOutput } from './types';

/**
 * Structured Workout Agent Factory
 *
 * Converts long-form workout descriptions to structured JSON format.
 * Validates the workout structure and adds date information.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that converts long-form workouts to structured JSON
 */
export const createStructuredWorkoutAgent = <TWorkout = unknown>(
  config: StructuredWorkoutConfig
) => {
  return createRunnableAgent<StructuredWorkoutInput, StructuredWorkoutOutput<TWorkout>>(async (input) => {
    const { longFormWorkout, user, fitnessProfile, workoutDate } = input;

    // Build system and user prompts using config
    const systemPrompt = buildStructuredWorkoutSystemPrompt(config.includeModifications);
    const userPrompt = createStructuredWorkoutUserPrompt(longFormWorkout, user, fitnessProfile, config.includeModifications);

    // Initialize model with schema from config
    const model = initializeModel(config.schema);

    // Invoke model with system and user prompts
    const workout = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]) as TWorkout;

    // Validate the workout structure
    const validatedWorkout = config.schema.parse(workout);

    // Basic validation - ensure workout has blocks
    if ('blocks' in validatedWorkout && (!validatedWorkout.blocks || (validatedWorkout.blocks as unknown[]).length === 0)) {
      throw new Error('Workout has no blocks');
    }

    const blockCount = 'blocks' in validatedWorkout ? (validatedWorkout.blocks as unknown[]).length : 'N/A';
    const modCount = 'modificationsApplied' in validatedWorkout
      ? (validatedWorkout.modificationsApplied as unknown[] | undefined)?.length || 0
      : 'N/A';

    console.log(`[${config.operationName}] Generated structured workout (blocks: ${blockCount}, modifications: ${modCount})`);

    // Add date to workout
    return {
      ...validatedWorkout,
      date: workoutDate
    } as StructuredWorkoutOutput<TWorkout>;
  });
};
