import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance, UpdatedWorkoutInstance } from '@/server/models/workout';
import { _UpdatedWorkoutInstanceSchema, LongFormWorkoutSchema, LongFormWorkout } from '@/server/models/workout/schema';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { longFormPrompt, structuredPrompt, messagePrompt, type Modification } from './prompts';
import { initializeModel } from '@/server/agents/base';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';

export type { Modification };

export interface SubstituteExercisesContext {
  workout: WorkoutInstance;
  user: UserWithProfile;
  modifications: Modification[];
}

export interface SubstitutedWorkoutResult {
  workout: UpdatedWorkoutInstance;
  message: string;
  description: string;
  reasoning: string;
}

/**
 * Substitute exercises using two-step process:
 * 1. Generate long-form workout with substitutions + reasoning
 * 2. In parallel: convert to JSON structure + SMS message
 */
export const substituteExercises = async (context: SubstituteExercisesContext): Promise<SubstitutedWorkoutResult> => {
  const {
    workout,
    user,
    modifications,
  } = context;

  // Get fitness profile context
  const fitnessProfileContext = new FitnessProfileContext();
  const fitnessProfile = await fitnessProfileContext.getContext(user);

  // Step 1: Generate long-form workout with substitutions and reasoning
  const longFormRunnable = RunnableLambda.from(async () => {
    const prompt = longFormPrompt(
      fitnessProfile,
      modifications,
      workout,
      user
    );

    const model = initializeModel(LongFormWorkoutSchema);
    const result = await model.invoke(prompt);

    console.log(`Generated long-form workout with substitutions (description: ${result.description.length} chars, reasoning: ${result.reasoning.length} chars)`);

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

    console.log(`Generated structured workout with substitutions: ${validatedWorkout.blocks.length} blocks and ${validatedWorkout.modificationsApplied?.length || 0} modifications`);

    // Add date to workout
    return {
      ...validatedWorkout,
      date: workout.date
    } as UpdatedWorkoutInstance;
  });

  // Step 2b: Convert long-form to SMS message
  const messageRunnable = RunnableLambda.from(async (longForm: LongFormWorkout) => {
    const prompt = messagePrompt(longForm, user, fitnessProfile, modifications);
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
      console.log(`Attempting to substitute exercises (attempt ${attempt + 1}/${maxRetries})`);

      // Execute the sequence
      const sequence = RunnableSequence.from([
        longFormRunnable,
        async (longForm: LongFormWorkout) => {
          // Execute structured and message generation in parallel
          const [workout, message] = await Promise.all([
            structuredRunnable.invoke(longForm),
            messageRunnable.invoke(longForm)
          ]);

          return {
            workout,
            message,
            description: longForm.description,
            reasoning: longForm.reasoning
          };
        }
      ]);

      const result = await sequence.invoke({});

      console.log('Successfully substituted exercises with description, reasoning, JSON, and message');

      return result as SubstitutedWorkoutResult;
    } catch (error) {
      console.error(`Error substituting exercises (attempt ${attempt + 1}):`, error);

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

  throw new Error('Failed to substitute exercises after all attempts');
};
