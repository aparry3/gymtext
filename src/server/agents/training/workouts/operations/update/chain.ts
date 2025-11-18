import { createRunnableAgent } from '@/server/agents/base';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { formatFitnessProfile } from '@/server/utils/formatters';
import { WorkoutInstance } from '@/server/models/workout';
import { UserWithProfile } from '@/server/models';
import {
  createWorkoutGenerationRunnable,
  createFormattedWorkoutAgent,
  createWorkoutMessageAgent,
  type WorkoutChainResult,
} from '../../shared';
import { SYSTEM_PROMPT, userPrompt } from './steps/generation/prompt';
import { createWorkoutUpdateGenerationRunnable } from './steps/generation/chain';

export interface UpdateWorkoutContext {
  user: UserWithProfile;
  workout: WorkoutInstance;
  changeRequest: string;
}

/**
 * Update Workout Agent
 *
 * Updates an existing workout based on user constraints using a composable chain:
 * 1. Generate updated long-form workout description (generation step)
 * 2. In parallel: convert to formatted markdown + SMS message (shared steps)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 * Implements retry logic (max 2 attempts) with validation.
 * Tracks modifications made to the original workout.
 */
export const updateWorkout = async (context: UpdateWorkoutContext): Promise<WorkoutChainResult> => {
  if (!context.workout.description) {
    throw new Error('Workout description is required');
  }
  if (!context.changeRequest) {
    throw new Error('Change request is required');
  }

  const agent = createRunnableAgent<UpdateWorkoutContext & { date: Date }, WorkoutChainResult>(async (input) => {
    // Step 1: Create generation runnable (update-specific)
    const generationRunnable = createWorkoutUpdateGenerationRunnable({
      agentConfig: deps?.config
    });

    // Step 2a: Create formatted workout agent (shared step, with modifications tracking)
    const formattedAgent = createFormattedWorkoutAgent({
      includeModifications: true,
      operationName: 'update workout',
    });

    // Step 2b: Create message agent (shared step)
    const messageAgent = createWorkoutMessageAgent({
      operationName: 'update workout',
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

    // Execute with retry mechanism
    const maxRetries = 2;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[update workout] Attempting operation (attempt ${attempt + 1}/${maxRetries})`);

        const result = await sequence.invoke({
          ...input,
          fitnessProfile,
          prompt
        });

        console.log(`[update workout] Successfully completed with updated workout, formatted text, and message`);

        return {
          formatted: result.formatted,
          message: result.message,
          description: result.description,
        };
      } catch (error) {
        console.error(`[update workout] Error on attempt ${attempt + 1}:`, error);

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

    throw new Error(`[update workout] Failed after all retry attempts`);
  });

  return agent.invoke({...context, date: context.workout.date as Date});
};
