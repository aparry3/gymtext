import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance, UpdatedWorkoutInstance } from '@/server/models/workout';
import { _UpdatedWorkoutInstanceSchema, LongFormWorkoutSchema, LongFormWorkout } from '@/server/models/workout/schema';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { longFormPrompt, structuredPrompt, messagePrompt, type ReplaceWorkoutParams } from './prompts';
import { initializeModel } from '@/server/agents/base';
import { RunnableLambda, RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';

export type { ReplaceWorkoutParams };

export interface ReplaceWorkoutContext {
  workout: WorkoutInstance;
  user: UserWithProfile;
  params: ReplaceWorkoutParams;
}

export interface ReplacedWorkoutResult {
  workout: UpdatedWorkoutInstance;
  message: string;
  description: string;
  reasoning: string;
}

/**
 * Replace workout using two-step process:
 * 1. Generate long-form replacement workout description + reasoning
 * 2. In parallel: convert to JSON structure + SMS message
 */
export const replaceWorkout = async (context: ReplaceWorkoutContext): Promise<ReplacedWorkoutResult> => {
  const {
    workout,
    user,
    params,
  } = context;

  // Get fitness profile context
  const fitnessProfileContext = new FitnessProfileContext();
  const fitnessProfile = await fitnessProfileContext.getContext(user);

  // Step 1: Generate long-form replacement workout description and reasoning
  const longFormRunnable = RunnableLambda.from(async () => {
    const prompt = longFormPrompt(
      fitnessProfile,
      params,
      workout,
      user
    );

    const model = initializeModel(LongFormWorkoutSchema);
    const result = await model.invoke(prompt);

    console.log(`Generated long-form replacement workout (description: ${result.description.length} chars, reasoning: ${result.reasoning.length} chars)`);

    return result;
  });

  // Step 2a: Convert long-form to structured JSON
  const structuredRunnable = RunnableLambda.from(async (longForm: LongFormWorkout) => {
    const prompt = structuredPrompt(longForm, user, fitnessProfile);
    const model = initializeModel(_UpdatedWorkoutInstanceSchema);
    const updatedWorkout = await model.invoke(prompt) as UpdatedWorkoutInstance;

    // Validate the workout structure
    const validatedWorkout = _UpdatedWorkoutInstanceSchema.parse(updatedWorkout);

    if (!validatedWorkout.blocks || validatedWorkout.blocks.length === 0) {
      throw new Error('Workout has no blocks');
    }

    console.log(`Generated structured replacement workout with ${validatedWorkout.blocks.length} blocks and ${validatedWorkout.modificationsApplied?.length || 0} modifications`);

    // Add date to workout
    return {
      ...validatedWorkout,
      date: workout.date
    } as UpdatedWorkoutInstance;
  });

  // Step 2b: Convert long-form to SMS message
  const messageRunnable = RunnableLambda.from(async (longForm: LongFormWorkout) => {
    const prompt = messagePrompt(longForm, user, fitnessProfile, params.reason);
    const model = initializeModel(undefined);
    const response = await model.invoke(prompt);
    const message = typeof response.content === 'string'
      ? response.content
      : String(response.content);

    console.log(`Generated SMS message (${message.length} characters)`);

    return message;
  });

  // Create sequence with retry mechanism
  const maxRetries = 2;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempting to replace workout (attempt ${attempt + 1}/${maxRetries})`);

      // Execute the sequence
      const sequence = RunnableSequence.from([
        longFormRunnable,
        RunnablePassthrough.assign({
          workout: structuredRunnable,
          message: messageRunnable,
        })
      ]);

      const result = await sequence.invoke({});

      console.log('Successfully replaced workout with description, reasoning, JSON, and message');

      return result as ReplacedWorkoutResult;
    } catch (error) {
      console.error(`Error replacing workout (attempt ${attempt + 1}):`, error);

      // Log more details about the error for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack?.substring(0, 500),
          name: error.name,
          attempt: attempt + 1
        });
      }

      // If it's the last attempt, break out of the loop
      if (attempt === maxRetries - 1) {
        break;
      }

      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
    }
  }

  throw new Error('Failed to replace workout after all attempts');
};
