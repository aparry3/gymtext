import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { createStructuredPrompt } from './prompts';
import type { StructuredWorkoutInput, StructuredWorkoutOutput } from './types';

/**
 * Structured Workout Agent Factory
 *
 * Converts long-form workout descriptions to structured JSON format.
 * Validates the workout structure and adds date information.
 *
 * @returns Agent that converts long-form workouts to structured JSON
 */
export const createStructuredWorkoutAgent = <TWorkout = unknown>() => {
  return createRunnableAgent<StructuredWorkoutInput, StructuredWorkoutOutput<TWorkout>>(async (input) => {
    const { longFormWorkout, user, fitnessProfile, structuredSchema, workoutDate, operationName } = input;

    // Generate the structured prompt
    const prompt = createStructuredPrompt(longFormWorkout, user, fitnessProfile);

    // Initialize model with schema for structured output
    const model = initializeModel(structuredSchema);

    // Invoke model to convert long-form to structured format
    const workout = await model.invoke(prompt) as TWorkout;

    // Validate the workout structure
    const validatedWorkout = structuredSchema.parse(workout);

    // Basic validation - ensure workout has blocks
    if ('blocks' in validatedWorkout && (!validatedWorkout.blocks || (validatedWorkout.blocks as unknown[]).length === 0)) {
      throw new Error('Workout has no blocks');
    }

    const blockCount = 'blocks' in validatedWorkout ? (validatedWorkout.blocks as unknown[]).length : 'N/A';
    const modCount = 'modificationsApplied' in validatedWorkout
      ? (validatedWorkout.modificationsApplied as unknown[] | undefined)?.length || 0
      : 'N/A';

    console.log(`[${operationName}] Generated structured workout (blocks: ${blockCount}, modifications: ${modCount})`);

    // Add date to workout
    return {
      ...validatedWorkout,
      date: workoutDate
    } as StructuredWorkoutOutput<TWorkout>;
  });
};

/**
 * Create structured workout with modificationsApplied field
 * Used by substitute/replace agents
 *
 * @returns Agent that converts long-form workouts to structured JSON with modifications tracking
 */
export const createStructuredWorkoutWithModificationsAgent = <TWorkout = unknown>() => {
  return createRunnableAgent<StructuredWorkoutInput, StructuredWorkoutOutput<TWorkout>>(async (input) => {
    const { longFormWorkout, user, fitnessProfile, structuredSchema, workoutDate, operationName } = input;

    // Generate the structured prompt with modificationsApplied field
    const prompt = createStructuredPrompt(longFormWorkout, user, fitnessProfile, true);

    // Initialize model with schema for structured output
    const model = initializeModel(structuredSchema);

    // Invoke model to convert long-form to structured format
    const workout = await model.invoke(prompt) as TWorkout;

    // Validate the workout structure
    const validatedWorkout = structuredSchema.parse(workout);

    // Basic validation - ensure workout has blocks
    if ('blocks' in validatedWorkout && (!validatedWorkout.blocks || (validatedWorkout.blocks as unknown[]).length === 0)) {
      throw new Error('Workout has no blocks');
    }

    const blockCount = 'blocks' in validatedWorkout ? (validatedWorkout.blocks as unknown[]).length : 'N/A';
    const modCount = 'modificationsApplied' in validatedWorkout
      ? (validatedWorkout.modificationsApplied as unknown[] | undefined)?.length || 0
      : 'N/A';

    console.log(`[${operationName}] Generated structured workout (blocks: ${blockCount}, modifications: ${modCount})`);

    // Add date to workout
    return {
      ...validatedWorkout,
      date: workoutDate
    } as StructuredWorkoutOutput<TWorkout>;
  });
};
