import { z } from 'zod';
import { UserWithProfile } from '@/server/models/userModel';
import { LongFormWorkout, LongFormWorkoutSchema } from '@/server/models/workout/schema';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { initializeModel } from '@/server/agents/base';
import { RunnableLambda, RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { createStructuredWorkoutAgent } from './structuredWorkout/chain';
import { createWorkoutMessageAgent } from './workoutMessage/chain';

/**
 * Runtime context that flows through the workout chain
 * Contains all dynamic data needed by downstream agents
 */
export interface WorkoutChainContext {
  longFormWorkout: LongFormWorkout;
  user: UserWithProfile;
  fitnessProfile: string;
  workoutDate: Date;
}

/**
 * Configuration for the workout chain factory
 *
 * @template TContext - The context type for the specific workout operation
 * @template TWorkoutSchema - The Zod schema type for the structured workout
 */
export interface WorkoutChainConfig<TContext, TWorkoutSchema extends z.ZodTypeAny> {
  // Prompts
  systemPrompt: string;  // Static system prompt
  userPrompt: (context: TContext, fitnessProfile: string) => string;  // Dynamic user prompt

  // Schema for step 2a (structured JSON generation)
  structuredSchema: TWorkoutSchema;

  // Whether to include modificationsApplied field (for substitute/replace)
  includeModifications?: boolean;

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

  // Get fitness profile context once
  const fitnessProfileContext = new FitnessProfileContext();
  const fitnessProfile = await fitnessProfileContext.getContext(user);

  // Step 1: Generate long-form workout and build context object
  const contextRunnable = RunnableLambda.from(async (): Promise<WorkoutChainContext> => {
    const systemMessage = config.systemPrompt;
    const userMessage = config.userPrompt(context, fitnessProfile);

    // Use gpt-5-nano for long-form generation - reasoning model good for complex workout planning
    // High token limit accounts for ~96% reasoning token overhead
    const model = initializeModel(LongFormWorkoutSchema, {
      model: 'gpt-5-nano',
    });
    const longFormWorkout = await model.invoke([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ]);

    console.log(`[${config.operationName}] Generated long-form workout (description: ${longFormWorkout.description.length} chars, reasoning: ${longFormWorkout.reasoning.length} chars)`);

    // Return complete context that flows through the chain
    return {
      longFormWorkout,
      user,
      fitnessProfile,
      workoutDate
    };
  });

  // Step 2a: Create structured agent with config (returns runnable)
  const structuredAgent = createStructuredWorkoutAgent<TWorkout>({
    schema: config.structuredSchema,
    includeModifications: config.includeModifications || false,
    operationName: config.operationName,
    agentConfig: {
      model: 'gemini-2.5-flash-lite',  // Fast, no reasoning token overhead, compatible with Gemini schemas
      maxTokens: 16384  // Increased from default 4096 to handle complex workouts with many blocks
    }
  });

  // Step 2b: Create message agent with config (returns runnable)
  const messageAgent = createWorkoutMessageAgent({
    operationName: config.operationName,
    agentConfig: {
      model: 'gemini-2.5-flash-lite',  // Fast, no reasoning token overhead, compatible with Gemini schemas
      maxTokens: 4096  // Increased from default 4096 to handle complex workouts with many blocks
    }
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

      const result = await sequence.invoke({});

      console.log(`[${config.operationName}] Successfully completed with description, reasoning, JSON, and message`);

      // Flatten the result to match WorkoutChainResult type
      return {
        workout: result.workout,
        message: result.message,
        description: result.longFormWorkout.description,
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
