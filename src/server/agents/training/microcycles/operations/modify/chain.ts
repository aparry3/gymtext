import { modifyMicrocycleUserPrompt, MICROCYCLE_MODIFY_SYSTEM_PROMPT } from './prompt';
import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { RunnableSequence } from '@langchain/core/runnables';
import type { ModifyMicrocycleInput } from './types';
import { ModifyMicrocycleOutputSchema, type ModifyMicrocycleOutput } from './types';
import { MicrocycleAgentDeps, MicrocycleAgentOutput } from '../../types';
import { createMicrocyclePostProcessChain } from '../../steps';
import type { MicrocycleChainContext } from '../../steps';
import { formatFitnessProfile } from '@/server/utils/formatters';

export type { ModifyMicrocycleInput } from './types';

/**
 * Creates the modify-specific first step runnable
 * Takes ModifyMicrocycleInput and produces MicrocycleChainContext (with wasModified)
 */
const createModifyMicrocycleRunnable = (deps?: MicrocycleAgentDeps) => {
  const model = initializeModel(ModifyMicrocycleOutputSchema, deps?.config);

  return createRunnableAgent<ModifyMicrocycleInput, MicrocycleChainContext & { wasModified: boolean }>(async (input) => {
    const { user, currentMicrocycle, changeRequest, currentDayOfWeek } = input;

    // Generate prompt
    const prompt = modifyMicrocycleUserPrompt({
      fitnessProfile: formatFitnessProfile(user),
      currentMicrocycle,
      changeRequest,
      currentDayOfWeek,
    });

    // Retry mechanism for transient errors
    const maxRetries = 2;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[Modify] Attempting to modify microcycle (attempt ${attempt + 1}/${maxRetries})`);

        // Generate the modified microcycle
        const microcycle = await model.invoke([
          { role: 'system', content: MICROCYCLE_MODIFY_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ]) as ModifyMicrocycleOutput;

        // Ensure we have a valid response
        if (!microcycle) {
          throw new Error('AI returned null/undefined microcycle');
        }

        console.log(`[Modify] Successfully modified microcycle with ${microcycle.days.length} days (wasModified: ${microcycle.wasModified})`);

        // Extract wasModified and modifications, return MicrocycleChainContext for post-processing
        const { wasModified, modifications, ...baseMicrocycle } = microcycle;

        return {
          microcycle: baseMicrocycle,
          // Use currentMicrocycle.description as stand-in for plan context in modify flow
          planText: currentMicrocycle.description ?? '',
          userProfile: formatFitnessProfile(user),
          absoluteWeek: currentMicrocycle.absoluteWeek,
          isDeload: currentMicrocycle.isDeload,
          wasModified,
          modifications
        };
      } catch (error) {
        console.error(`[Modify] Error modifying microcycle (attempt ${attempt + 1}):`, error);

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

    throw new Error('Failed to modify microcycle after all attempts');
  });
};

/**
 * Microcycle Modification Agent Factory
 *
 * Modifies weekly training patterns based on user change requests using a composable chain:
 * 1. Modify structured output based on change request (modify-specific step)
 * 2. Post-process: formatted markdown + SMS message + validation + transformation (shared step)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 * Implements retry logic (max 2 attempts in first step, max 3 in post-processing).
 * Structured output ensures reliable parsing without regex.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that modifies microcycle day overviews, formatted markdown, and messages
 */
export const createModifyMicrocycleAgent = (deps?: MicrocycleAgentDeps) => {
  return createRunnableAgent<ModifyMicrocycleInput, MicrocycleAgentOutput>(async (input) => {
    // Step 1: Create modify runnable (modify-specific)
    const modifyMicrocycleRunnable = createModifyMicrocycleRunnable({
      config: {
        model: 'gpt-5.1'
      }
    });

    // Step 2: Create shared post-processing chain
    const postProcessChain = createMicrocyclePostProcessChain(deps, 'modify');

    // Compose the full chain: modify → post-processing
    const sequence = RunnableSequence.from([
      modifyMicrocycleRunnable,
      postProcessChain
    ]);

    // Execute the chain
    return await sequence.invoke(input);
  });
};
