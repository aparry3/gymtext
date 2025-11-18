import { createRunnableAgent } from '@/server/agents/base';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { formatFitnessProfile } from '@/server/utils/formatters';
import {
  createWorkoutGenerationRunnable,
  createFormattedWorkoutAgent,
  createWorkoutMessageAgent,
  type WorkoutChainResult,
} from '../../shared';
import { SYSTEM_PROMPT, userPrompt } from './prompt';
import type { DailyWorkoutInput, DailyWorkoutAgentDeps } from './types';

/**
 * Daily Workout Agent Factory
 *
 * Generates personalized daily workouts using a composable chain:
 * 1. Generate long-form workout description (generation step)
 * 2. In parallel: convert to formatted markdown + SMS message (shared steps)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 * Implements retry logic (max 2 attempts) with validation.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates daily workouts with formatted text and message
 */
export const createDailyWorkoutAgent = (deps?: DailyWorkoutAgentDeps) => {
  return createRunnableAgent<DailyWorkoutInput, WorkoutChainResult>(async (input) => {
    // Step 1: Create generation runnable (generate-specific)
    const generationRunnable = createWorkoutGenerationRunnable({
      systemPrompt: SYSTEM_PROMPT,
      agentConfig: deps?.config
    });

    // Step 2a: Create formatted workout agent (shared step)
    const formattedAgent = createFormattedWorkoutAgent({
      includeModifications: false,
      operationName: 'generate workout',
      agentConfig: deps?.config
    });

    // Step 2b: Create message agent (shared step)
    const messageAgent = createWorkoutMessageAgent({
      operationName: 'generate workout',
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

    // Prepare input with fitness profile and prompt
    const fitnessProfile = formatFitnessProfile(input.user);
    const prompt = userPrompt(input)(fitnessProfile);

    // Execute with retry mechanism
    const maxRetries = 2;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[generate workout] Attempting operation (attempt ${attempt + 1}/${maxRetries})`);

        const result = await sequence.invoke({
          ...input,
          fitnessProfile,
          prompt
        });

        console.log(`[generate workout] Successfully completed with workout, formatted text, and message`);

        return {
          formatted: result.formatted,
          message: result.message,
          description: result.description,
        };
      } catch (error) {
        console.error(`[generate workout] Error on attempt ${attempt + 1}:`, error);

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

    throw new Error(`[generate workout] Failed after all retry attempts`);
  });
};