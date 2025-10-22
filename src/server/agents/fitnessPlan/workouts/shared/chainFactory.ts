import { z } from 'zod';
import { UserWithProfile } from '@/server/models/userModel';
import { LongFormWorkout, LongFormWorkoutSchema } from '@/server/models/workout/schema';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { initializeModel } from '@/server/agents/base';
import { RunnableLambda, RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { WORKOUT_MESSAGE_SYSTEM_PROMPT, createWorkoutMessageUserPrompt } from './promptHelpers';

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
 * Creates a runnable that converts long-form workout to structured JSON
 *
 * @param user - User with profile information
 * @param fitnessProfile - Formatted fitness profile string
 * @param structuredPrompt - Function that generates the structured prompt
 * @param structuredSchema - Zod schema for validation
 * @param workoutDate - Date for the workout
 * @param operationName - Operation name for logging
 * @returns Runnable that converts LongFormWorkout to structured workout object with date
 */
export function createStructuredWorkoutRunnable<TWorkout>(
  user: UserWithProfile,
  fitnessProfile: string,
  structuredPrompt: (longForm: LongFormWorkout, user: UserWithProfile, fitnessProfile: string) => string,
  structuredSchema: z.ZodTypeAny,
  workoutDate: Date,
  operationName: string
): RunnableLambda<LongFormWorkout, TWorkout & { date: Date }> {
  return RunnableLambda.from(async (longForm: LongFormWorkout) => {
    const prompt = structuredPrompt(longForm, user, fitnessProfile);
    const model = initializeModel(structuredSchema);
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
    } as TWorkout & { date: Date };
  });
}

/**
 * Creates a runnable that converts long-form workout to SMS message
 *
 * Fetches fitness profile internally from user and generates SMS-friendly
 * workout message containing ONLY the workout structure (no greetings or motivational messages).
 * Used by workout generation chains and fallback message generation.
 *
 * @param user - User with profile information
 * @param operationName - Operation name for logging (e.g., 'generate workout', 'fallback message')
 * @returns Runnable that converts LongFormWorkout to SMS string
 */
export function createWorkoutMessageRunnable(
  user: UserWithProfile,
  operationName?: string
): RunnableLambda<LongFormWorkout, string> {
  return RunnableLambda.from(async (longForm: LongFormWorkout) => {
    const fitnessProfileContext = new FitnessProfileContext();
    const fitnessProfile = await fitnessProfileContext.getContext(user);

    const userPrompt = createWorkoutMessageUserPrompt(longForm, user, fitnessProfile);
    const model = initializeModel(undefined);
    const response = await model.invoke([
      { role: 'system', content: WORKOUT_MESSAGE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);
    const message = typeof response.content === 'string' ? response.content : String(response.content);

    console.log(`[${operationName || 'generate message'}] Generated SMS message (${message.length} characters)`);
    return message;
  });
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
  const structuredRunnable = createStructuredWorkoutRunnable<TWorkout>(
    user,
    fitnessProfile,
    config.structuredPrompt,
    config.structuredSchema,
    workoutDate,
    config.operationName
  );

  // Step 2b: Convert long-form to SMS message
  const messageRunnable = createWorkoutMessageRunnable(user, config.operationName);

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
