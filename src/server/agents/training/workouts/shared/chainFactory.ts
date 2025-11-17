import { UserWithProfile } from '@/server/models/userModel';
import { formatFitnessProfile } from '@/server/utils/formatters';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { createFormattedWorkoutAgent } from './steps/formatted/chain';
import { createWorkoutMessageAgent } from './steps/message/chain';
import { createWorkoutGenerationRunnable } from './steps/generation/chain';
import { WorkoutGenerationOutput } from '@/server/models/workout/schema/openAISchema';


export interface BaseWorkoutChainInput {
  user: UserWithProfile;
  date: Date;
}

/**
 * Runtime context that flows through the workout chain
 * Contains all dynamic data needed by downstream agents
 */
export interface WorkoutChainContext extends BaseWorkoutChainInput {
  workout: WorkoutGenerationOutput;
  fitnessProfile: string;
}

/**
 * Configuration for the workout chain factory
 */
export interface WorkoutChainConfig {
  // Prompts
  systemPrompt: string;  // Static system prompt
  userPrompt: (fitnessProfile: string) => string;  // Dynamic user prompt

  // Whether to include modificationsApplied field (for substitute/replace)
  includeModifications?: boolean;

  // Operation name for logging
  operationName: string;
}

/**
 * Result type from the workout chain execution
 */
export interface WorkoutChainResult {
  formatted: string;
  message: string;
  description: string;
  reasoning: string;
}

/**
 * Shared workout chain factory
 *
 * Executes the standard 2-step workout generation pattern:
 * 1. Generate long-form workout description + reasoning
 * 2. In parallel: convert to formatted markdown + generate SMS message
 *
 * This eliminates code duplication across generate/replace/substitute agents.
 *
 * @param context - The operation-specific context
 * @param config - Configuration for prompts and settings
 * @returns Workout result with formatted workout string, message, description, and reasoning
 */
export async function executeWorkoutChain<TContext extends BaseWorkoutChainInput>(
  context: TContext,
  config: WorkoutChainConfig
): Promise<WorkoutChainResult> {
  // Get fitness profile context once
  const fitnessProfile = formatFitnessProfile(context.user);

  const systemMessage = config.systemPrompt;
  const userMessage = config.userPrompt(fitnessProfile);

  // Step 1: Generate long-form workout and build context object
  const contextRunnable = createWorkoutGenerationRunnable({systemPrompt: systemMessage});

  // Step 2a: Create formatted workout agent with config (returns runnable)
  const formattedAgent = createFormattedWorkoutAgent({
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
          formatted: formattedAgent,
          message: messageAgent,
        })
      ]);

      const result: WorkoutGenerationOutput & {formatted: string, message: string} = await sequence.invoke({...context, fitnessProfile, prompt: userMessage});

      console.log(`[${config.operationName}] Successfully completed with workout, reasoning, formatted text, and message`);
      // Flatten the result to match WorkoutChainResult type
      return {
        formatted: result.formatted,
        message: result.message,
        description: result.description,
        reasoning: result.reasoning
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
