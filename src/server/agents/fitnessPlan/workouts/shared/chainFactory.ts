import { z } from 'zod';
import { UserWithProfile } from '@/server/models/userModel';
import { LongFormWorkout } from '@/server/models/workout/schema';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { createStructuredWorkoutAgent } from './structuredWorkout/chain';
import { createWorkoutMessageAgent } from './workoutMessage/chain';
import { createLongFormatWorkoutRunnable } from './longFormWorkout/chain';


export interface BaseWorkoutChainInput {
  user: UserWithProfile;
  date: Date;
}

/**
 * Runtime context that flows through the workout chain
 * Contains all dynamic data needed by downstream agents
 */
export interface WorkoutChainContext extends BaseWorkoutChainInput {
  longFormWorkout: LongFormWorkout;
  fitnessProfile: string;
}

/**
 * Configuration for the workout chain factory
 *
 * @template TContext - The context type for the specific workout operation
 * @template TWorkoutSchema - The Zod schema type for the structured workout
 */
export interface WorkoutChainConfig<TWorkoutSchema extends z.ZodTypeAny> {
  // Prompts
  systemPrompt: string;  // Static system prompt
  userPrompt: (fitnessProfile: string) => string;  // Dynamic user prompt

  // Schema for step 2a (structured JSON generation)
  structuredSchema: TWorkoutSchema;

  // Whether to include modificationsApplied field (for substitute/replace)
  includeModifications?: boolean;

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
export async function executeWorkoutChain<TContext extends BaseWorkoutChainInput, TWorkoutSchema extends z.ZodTypeAny>(
  context: TContext,
  config: WorkoutChainConfig<TWorkoutSchema>
): Promise<WorkoutChainResult<z.infer<TWorkoutSchema>>> {
  type TWorkout = z.infer<TWorkoutSchema>;

  // Get fitness profile context once
  const fitnessProfileContext = new FitnessProfileContext();
  const fitnessProfile = await fitnessProfileContext.getContext(context.user);

  const systemMessage = config.systemPrompt;
  const userMessage = config.userPrompt(fitnessProfile);

  // Step 1: Generate long-form workout and build context object
  const contextRunnable = createLongFormatWorkoutRunnable({systemPrompt: systemMessage});

  // Step 2a: Create structured agent with config (returns runnable)
  const structuredAgent = createStructuredWorkoutAgent<TWorkout>({
    schema: config.structuredSchema,
    includeModifications: config.includeModifications || false,
    operationName: config.operationName,
  });

  // Step 2b: Create message agent with config (returns runnable)
  const messageAgent = createWorkoutMessageAgent({
    operationName: config.operationName
  });

  // Create sequence with retry mechanism
  const maxRetries = 2;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[${config.operationName}] Attempting operation (attempt ${attempt + 1}/${maxRetries})`);

      // Execute the sequence - agents receive context directly (no wrappers!)
      const sequence = RunnableSequence.from([
        contextRunnable,
        RunnablePassthrough.assign({
          workout: structuredAgent,
          message: messageAgent,
        })
      ]);

      const result = await sequence.invoke({...context, fitnessProfile, prompt: userMessage});

      console.log(`[${config.operationName}] Successfully completed with workout, reasoning, JSON, and message`);
      // Flatten the result to match WorkoutChainResult type
      return {
        workout: result.workout,
        message: result.message,
        description: result.longFormWorkout.workout,
        reasoning: result.longFormWorkout.reasoning
      };
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
