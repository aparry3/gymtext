import { createRunnableAgent } from '@/server/agents/base';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { createModifyFitnessPlanRunnable } from './steps/generation/chain';
import type { ModifyFitnessPlanInput } from './steps/generation/types';
import {
  createFormattedFitnessPlanAgent,
  createStructuredPlanAgent,
} from '../../shared/steps';
import type { PlanStructure } from '@/server/agents/training/schemas';

export type { ModifyFitnessPlanInput } from './steps/generation/types';

/**
 * Output from the modify fitness plan agent
 */
export interface ModifyFitnessPlanResult {
  description: string;
  formatted: string;
  wasModified: boolean;
  modifications: string;
  structure?: PlanStructure;
}

/**
 * Fitness Plan Modification Agent Factory
 *
 * Modifies fitness plans based on user change requests using a composable chain:
 * 1. Modify structured plan description based on change request (modify-specific step)
 * 2. Generate formatted markdown for frontend display (parallel with step 3)
 * 3. Generate SMS-formatted summary message (parallel with step 2)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 * Implements retry logic (max 2 attempts).
 *
 * @returns Agent that modifies fitness plans with formatted markdown and messages
 */
export const createModifyFitnessPlanAgent = () => {
  return createRunnableAgent<ModifyFitnessPlanInput, ModifyFitnessPlanResult>(async (input) => {
    // Step 1: Create modify runnable (modify-specific)
    const modifyFitnessPlanRunnable = createModifyFitnessPlanRunnable({
      config: {
        model: 'gpt-5-mini'
      }
    });

    // Step 2: Create formatting agent (reuse from generation)
    const formattedAgent = createFormattedFitnessPlanAgent({
      operationName: 'format modified fitness plan',
    });

    // Step 3: Create structured agent
    const structuredAgent = createStructuredPlanAgent({
      operationName: 'structured modified plan'
    });

    // Compose the chain: modify → parallel (formatted + structure)
    const sequence = RunnableSequence.from([
      modifyFitnessPlanRunnable,
      RunnablePassthrough.assign({
        formatted: formattedAgent,
        structure: structuredAgent,
      })
    ]);

    // Execute the chain
    const result = await sequence.invoke(input);

    // Return the final result
    return {
      description: result.fitnessPlan,
      formatted: result.formatted,
      wasModified: result.wasModified,
      modifications: result.modifications,
      structure: result.structure,
    };
  });
};
