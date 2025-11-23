import { createRunnableAgent } from '@/server/agents/base';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import {
  createFormattedWorkoutAgent,
  createWorkoutMessageAgent,
} from '../../shared';
import { createModifyWorkoutGenerationRunnable } from './steps/generation/chain';
import type { ModifyWorkoutInput, ModifyWorkoutAgentDeps, ModifyWorkoutOutput } from './types';

/**
 * Workout Modification Agent Factory
 *
 * Modifies an existing workout based on user constraints using a composable chain:
 * 1. Generate modified long-form workout description (modify-specific generation step)
 * 2. In parallel: convert to formatted markdown + SMS message (shared steps)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 * Implements retry logic (max 2 attempts) with validation.
 * Tracks modifications made to the original workout.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that modifies workouts with formatted text and message
 */
export const createModifyWorkoutAgent = (deps?: ModifyWorkoutAgentDeps) => {
  return createRunnableAgent<ModifyWorkoutInput, ModifyWorkoutOutput>(async (input) => {
    // Validation
    if (!input.workout.description) {
      throw new Error('Workout description is required');
    }
    if (!input.changeRequest) {
      throw new Error('Change request is required');
    }

    // Step 1: Create generation runnable (modify-specific)
    const generationRunnable = createModifyWorkoutGenerationRunnable({
      agentConfig: { model: 'gpt-5-mini' }
    });

    // Step 2a: Create formatted workout agent (shared step, with modifications tracking)
    const formattedAgent = createFormattedWorkoutAgent({
      includeModifications: true,
      operationName: 'modify workout',
      agentConfig: deps?.config
    });

    // Step 2b: Create message agent (shared step)
    const messageAgent = createWorkoutMessageAgent({
      operationName: 'modify workout',
      agentConfig: deps?.config
    });

    // Compose the full chain: generation → parallel (formatted + message)
    const sequence = RunnableSequence.from([
      generationRunnable,
      RunnablePassthrough.assign({
        formatted: formattedAgent,
        message: messageAgent,
      })
    ]);

    // Execute with retry mechanism
    const maxRetries = 2;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[modify workout] Attempting operation (attempt ${attempt + 1}/${maxRetries})`);

        const result = await sequence.invoke(input);

        console.log(`[modify workout] Successfully completed with modified workout, formatted text, and message`);

        return {
          formatted: result.formatted,
          message: result.message,
          description: result.description,
          modifications: result.modifications,
          wasModified: result.wasModified,
        };
      } catch (error) {
        console.error(`[modify workout] Error on attempt ${attempt + 1}:`, error);

        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack?.substring(0, 500),
            name: error.name,
            attempt: attempt + 1
          });
        }

        if (attempt === maxRetries - 1) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
      }
    }

    throw new Error(`[modify workout] Failed after all retry attempts`);
  });
};
