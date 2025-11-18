import { microcycleUpdateUserPrompt, MICROCYCLE_UPDATE_SYSTEM_PROMPT } from './prompt';
import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { RunnableSequence } from '@langchain/core/runnables';
import type { MicrocycleUpdateInput } from './types';
import { MicrocycleUpdateOutputSchema, type MicrocycleUpdateOutput } from './types';
import { MicrocycleAgentDeps, MicrocycleAgentOutput } from '../../types';
import { createMicrocyclePostProcessChain } from '../../steps';
import type { MicrocycleChainContext } from '../../steps';
import { formatFitnessProfile } from '@/server/utils/formatters';

export type { MicrocycleUpdateInput } from './types';

/**
 * Creates the update-specific first step runnable
 * Takes MicrocycleUpdateInput and produces MicrocycleChainContext (with wasModified)
 */
const createMicrocycleUpdateRunnable = (deps?: MicrocycleAgentDeps) => {
  const model = initializeModel(MicrocycleUpdateOutputSchema, deps?.config);

  return createRunnableAgent<MicrocycleUpdateInput, MicrocycleChainContext & { wasModified: boolean }>(async (input) => {
    const { user, currentMicrocycle, changeRequest, currentDayOfWeek, weekNumber } = input;

    // Generate prompt
    const prompt = microcycleUpdateUserPrompt({
      fitnessProfile: formatFitnessProfile(user),
      currentMicrocycle,
      changeRequest,
      currentDayOfWeek,
    });

    // Retry mechanism for transient errors
    const maxRetries = 2;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[Update] Attempting to update microcycle (attempt ${attempt + 1}/${maxRetries})`);

        // Generate the updated microcycle
        const microcycle = await model.invoke([
          { role: 'system', content: MICROCYCLE_UPDATE_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ]) as MicrocycleUpdateOutput;

        // Ensure we have a valid response
        if (!microcycle) {
          throw new Error('AI returned null/undefined microcycle');
        }

        console.log(`[Update] Successfully updated microcycle with ${microcycle.days.length} days (wasModified: ${microcycle.wasModified})`);

        // Extract wasModified and return MicrocycleChainContext for post-processing
        const { wasModified, ...baseMicrocycle } = microcycle;

        return {
          microcycle: baseMicrocycle,
          microcycleOverview: currentMicrocycle.description ?? '',
          weekNumber,
          wasModified
        };
      } catch (error) {
        console.error(`[Update] Error updating microcycle (attempt ${attempt + 1}):`, error);

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

    throw new Error('Failed to update microcycle after all attempts');
  });
};

/**
 * Microcycle Update Agent Factory
 *
 * Updates weekly training patterns based on user change requests using a composable chain:
 * 1. Update structured output based on change request (update-specific step)
 * 2. Post-process: formatted markdown + SMS message + validation + transformation (shared step)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 * Implements retry logic (max 2 attempts in first step, max 3 in post-processing).
 * Structured output ensures reliable parsing without regex.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that updates microcycle day overviews, formatted markdown, and messages
 */
export const createMicrocycleUpdateAgent = (deps?: MicrocycleAgentDeps) => {
  return createRunnableAgent<MicrocycleUpdateInput, MicrocycleAgentOutput>(async (input) => {
    // Step 1: Create update runnable (update-specific)
    const microcycleUpdateRunnable = createMicrocycleUpdateRunnable(deps);

    // Step 2: Create shared post-processing chain
    const postProcessChain = createMicrocyclePostProcessChain(deps, 'update');

    // Compose the full chain: update → post-processing
    const sequence = RunnableSequence.from([
      microcycleUpdateRunnable,
      postProcessChain
    ]);

    // Execute the chain
    return await sequence.invoke(input);
  });
};
