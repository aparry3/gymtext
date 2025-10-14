import { UserWithProfile } from '@/server/models/userModel';
import { Microcycle } from '@/server/models/microcycle';
import { MesocycleOverview, FitnessPlan } from '@/server/models/fitnessPlan';
import { WorkoutInstance, EnhancedWorkoutInstance } from '@/server/models/workout';
import { _EnhancedWorkoutInstanceSchema, LongFormWorkoutSchema, LongFormWorkout } from '@/server/models/workout/schema';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { longFormPrompt, structuredPrompt, messagePrompt } from './prompts';
import { initializeModel } from '@/server/agents/base';
import { RunnableLambda, RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';

export interface DailyWorkoutContext {
  user: UserWithProfile;
  date: Date;
  dayPlan: {
    day: string;
    theme: string;
    load?: 'light' | 'moderate' | 'heavy';
    notes?: string;
  };
  microcycle: Microcycle;
  mesocycle: MesocycleOverview;
  fitnessPlan: FitnessPlan;
  recentWorkouts?: WorkoutInstance[];
}

export interface GeneratedWorkoutResult {
  workout: EnhancedWorkoutInstance;
  message: string;
  description: string;
  reasoning: string;
}

/**
 * Generate daily workout using two-step process:
 * 1. Generate long-form workout description + reasoning
 * 2. In parallel: convert to JSON structure + SMS message
 */
export const generateDailyWorkout = async (context: DailyWorkoutContext): Promise<GeneratedWorkoutResult> => {
  const {
    user,
    dayPlan,
    microcycle,
    mesocycle,
    fitnessPlan,
    recentWorkouts
  } = context;

  // Get fitness profile context
  const fitnessProfileContext = new FitnessProfileContext();
  const fitnessProfile = await fitnessProfileContext.getContext(user);

  // Step 1: Generate long-form workout description and reasoning
  const longFormRunnable = RunnableLambda.from(async () => {
    const prompt = longFormPrompt(
      user,
      fitnessProfile,
      dayPlan,
      microcycle.pattern,
      mesocycle,
      fitnessPlan.programType,
      recentWorkouts
    );

    const model = initializeModel(LongFormWorkoutSchema);
    const result = await model.invoke(prompt);

    console.log(`Generated long-form workout (description: ${result.description.length} chars, reasoning: ${result.reasoning.length} chars)`);

    return result;
  });

  // Step 2a: Convert long-form to structured JSON
  const structuredRunnable = RunnableLambda.from(async (longForm: LongFormWorkout) => {
    const prompt = structuredPrompt(longForm, user, fitnessProfile);
    const model = initializeModel(_EnhancedWorkoutInstanceSchema);
    const workout = await model.invoke(prompt) as EnhancedWorkoutInstance;

    // Validate the workout structure
    const validatedWorkout = _EnhancedWorkoutInstanceSchema.parse(workout);

    if (!validatedWorkout.blocks || validatedWorkout.blocks.length === 0) {
      throw new Error('Workout has no blocks');
    }

    console.log(`Generated structured workout with ${validatedWorkout.blocks.length} blocks`);

    // Add date to workout
    return {
      ...validatedWorkout,
      date: context.date
    } as EnhancedWorkoutInstance;
  });

  // Step 2b: Convert long-form to SMS message
  const messageRunnable = RunnableLambda.from(async (longForm: LongFormWorkout) => {
    const prompt = messagePrompt(longForm, user, fitnessProfile);
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
      console.log(`Attempting to generate workout (attempt ${attempt + 1}/${maxRetries})`);

      // Execute the sequence
      const sequence = RunnableSequence.from([
        longFormRunnable,
        RunnablePassthrough.assign({
          workout: structuredRunnable,
          message: messageRunnable,
        })
      ]);

      const result = await sequence.invoke({});

      console.log('Successfully generated workout with description, reasoning, JSON, and message');

      return result as GeneratedWorkoutResult;
    } catch (error) {
      console.error(`Error generating workout (attempt ${attempt + 1}):`, error);

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

  throw new Error('Failed to generate workout after all attempts');
};
