import { createRunnableAgent } from '@/server/agents/base';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { createModifyMicrocycleRunnable } from './steps/generation/chain';
import type { ModifyMicrocycleInput } from './steps/generation/types';
import { BaseMicrocycleAgentOutput } from '../../types';
import { createFormattedMicrocycleAgent } from '../../shared';

export type { ModifyMicrocycleInput } from './steps/generation/types';

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
export const createModifyMicrocycleAgent = () => {
  return createRunnableAgent<ModifyMicrocycleInput, BaseMicrocycleAgentOutput>(async (input) => {
    // Step 1: Create modify runnable (modify-specific)
    const modifyMicrocycleRunnable = createModifyMicrocycleRunnable({
      config: {
        model: 'gpt-5.1'
      }
    });

    // Step 2: Create shared post-processing chain
    const formattedAgent = createFormattedMicrocycleAgent({
      operationName: `modify formatted microcycle`,
    });


    // Compose the full chain: modify → post-processing
    const sequence = RunnableSequence.from([
      modifyMicrocycleRunnable,
      RunnablePassthrough.assign({
        formatted: formattedAgent,
      })
    ]);

    // Execute the chain
    const result =await sequence.invoke(input);
    return {
      days: result.microcycle.days,
      description: result.microcycle.overview,
      isDeload: result.microcycle.isDeload,
      formatted: result.formatted,
      wasModified: result.wasModified,
      modifications: result.modifications,
    };
  });
};
