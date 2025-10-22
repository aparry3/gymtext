import { z } from 'zod';
import { UserWithProfile } from '@/server/models/userModel';
import { LongFormWorkout, LongFormWorkoutSchema } from '@/server/models/workout/schema';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { initializeModel } from '@/server/agents/base';
import { RunnableLambda, RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { createStructuredWorkoutAgent } from './structuredWorkout/chain';
import { createWorkoutMessageAgent } from './workoutMessage/chain';

/**
 * Configuration for the workout chain factory
 *
 * @template TContext - The context type for the specific workout operation
 * @template TWorkoutSchema - The Zod schema type for the structured workout
 */
export interface WorkoutChainConfig<TContext, TWorkoutSchema extends z.ZodTypeAny> {
  // Prompts - functions that generate prompts from context
  systemPrompt: () => string;
  userPrompt: (context: TContext, fitnessProfile: string) => string;
  structuredPrompt: (longForm: LongFormWorkout, user: UserWithProfile, fitnessProfile: string) => string;

  // Schema for step 2a (structured JSON generation)
  structuredSchema: TWorkoutSchema;

  // Context extractors
  getUserFromContext: (context: TContext) => UserWithProfile;
  getDateFromContext?: (context: TContext) => Date;

  // Operation name for logging
  operationName: string;
}

/**
 * Result type from the workout chain execution
 *
 * @template TWorkout - The type of the workout (inferred from schema)
 */
export interface WorkoutChainResult<TWorkout> {
  workout: TWorkout & { date: Date };
  message: string;
  description: string;
  reasoning: string;
}


/**
 * Shared workout chain factory
 *
 * Executes the standard 2-step workout generation pattern:
 * 1. Generate long-form workout description + reasoning
 * 2. In parallel: convert to JSON + generate SMS message
 *
 * This eliminates code duplication across generate/replace/substitute agents.
 *
 * @param context - The operation-specific context
 * @param config - Configuration for prompts, schemas, and extractors
 * @returns Workout result with structured workout, message, description, and reasoning
 */
export async function executeWorkoutChain<TContext, TWorkoutSchema extends z.ZodTypeAny>(
  context: TContext,
  config: WorkoutChainConfig<TContext, TWorkoutSchema>
): Promise<WorkoutChainResult<z.infer<TWorkoutSchema>>> {
  type TWorkout = z.infer<TWorkoutSchema>;

  const user = config.getUserFromContext(context);
  const workoutDate = config.getDateFromContext ? config.getDateFromContext(context) : new Date();

  // Get fitness profile context
  const fitnessProfileContext = new FitnessProfileContext();
  const fitnessProfile = await fitnessProfileContext.getContext(user);

  // Step 1: Generate long-form workout description and reasoning
  const longFormRunnable = RunnableLambda.from(async () => {
    const systemMessage = config.systemPrompt();
    const userMessage = config.userPrompt(context, fitnessProfile);

    const model = initializeModel(LongFormWorkoutSchema);
    const result = await model.invoke([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ]);

    console.log(`[${config.operationName}] Generated long-form workout (description: ${result.description.length} chars, reasoning: ${result.reasoning.length} chars)`);

    return result;
  });

  // Step 2a: Convert long-form to structured JSON
  const structuredAgent = createStructuredWorkoutAgent<TWorkout>();
  const structuredRunnable = RunnableLambda.from(async (longForm: LongFormWorkout) => {
    return structuredAgent.invoke({
      longFormWorkout: longForm,
      user,
      fitnessProfile,
      structuredSchema: config.structuredSchema,
      workoutDate,
      operationName: config.operationName
    });
  });

  // Step 2b: Convert long-form to SMS message
  const messageAgent = createWorkoutMessageAgent();
  const messageRunnable = RunnableLambda.from(async (longForm: LongFormWorkout) => {
    return messageAgent.invoke({
      longFormWorkout: longForm,
      user,
      operationName: config.operationName
    });
  });

  // Create sequence with retry mechanism
  const maxRetries = 2;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[${config.operationName}] Attempting operation (attempt ${attempt + 1}/${maxRetries})`);

      // Execute the sequence with parallel step 2
      const sequence = RunnableSequence.from([
        longFormRunnable,
        RunnablePassthrough.assign({
          workout: structuredRunnable,
          message: messageRunnable,
        })
      ]);

      const result = await sequence.invoke({});

      console.log(`[${config.operationName}] Successfully completed with description, reasoning, JSON, and message`);

      return result as WorkoutChainResult<TWorkout>;
    } catch (error) {
      console.error(`[${config.operationName}] Error on attempt ${attempt + 1}:`, error);

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

  throw new Error(`[${config.operationName}] Failed after all retry attempts`);
}
