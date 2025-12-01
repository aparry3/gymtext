import { modifyFitnessPlanUserPrompt, FITNESS_PLAN_MODIFY_SYSTEM_PROMPT } from './prompt';
import { createRunnableAgent, initializeModel, type AgentDeps } from '@/server/agents/base';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import type { ModifyFitnessPlanInput } from './types';
import { ModifyFitnessPlanOutputSchema, type ModifyFitnessPlanOutput } from './types';
import {
  createFormattedFitnessPlanAgent,
  createFitnessPlanMessageAgent,
} from '../../steps';
import type { FitnessPlanChainContext } from '../../steps';

export type { ModifyFitnessPlanInput } from './types';

/**
 * Output from the modify fitness plan agent
 */
export interface ModifyFitnessPlanResult {
  description: string;
  formatted: string;
  message: string;
  wasModified: boolean;
  modifications: string;
}

/**
 * Internal context for the modify chain
 */
interface ModifyChainContext extends FitnessPlanChainContext {
  wasModified: boolean;
  modifications: string;
}

/**
 * Creates the modify-specific first step runnable
 * Takes ModifyFitnessPlanInput and produces ModifyChainContext
 */
const createModifyFitnessPlanRunnable = (deps?: AgentDeps) => {
  const model = initializeModel(ModifyFitnessPlanOutputSchema, deps?.config);

  return createRunnableAgent<ModifyFitnessPlanInput, ModifyChainContext>(async (input) => {
    const { user, currentPlan, changeRequest } = input;

    // Generate prompt - use user.profile directly (markdown from profiles table)
    const prompt = modifyFitnessPlanUserPrompt({
      userProfile: user.profile || 'No additional user notes',
      currentPlan,
      changeRequest,
    });

    // Retry mechanism for transient errors
    const maxRetries = 2;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[ModifyPlan] Attempting to modify fitness plan (attempt ${attempt + 1}/${maxRetries})`);

        // Generate the modified plan
        const result = await model.invoke([
          { role: 'system', content: FITNESS_PLAN_MODIFY_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ]) as ModifyFitnessPlanOutput;

        // Ensure we have a valid response
        if (!result) {
          throw new Error('AI returned null/undefined result');
        }

        console.log(`[ModifyPlan] Successfully modified fitness plan (wasModified: ${result.wasModified})`);

        return {
          user,
          fitnessPlan: result.description,
          wasModified: result.wasModified,
          modifications: result.modifications,
        };
      } catch (error) {
        console.error(`[ModifyPlan] Error modifying fitness plan (attempt ${attempt + 1}):`, error);

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

    throw new Error('Failed to modify fitness plan after all attempts');
  });
};

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

    // Step 3: Create message agent (reuse from generation)
    const messageAgent = createFitnessPlanMessageAgent({
      operationName: 'generate modified plan message'
    });

    // Compose the chain: modify → parallel (formatted + message)
    const sequence = RunnableSequence.from([
      modifyFitnessPlanRunnable,
      RunnablePassthrough.assign({
        formatted: formattedAgent,
        message: messageAgent
      })
    ]);

    // Execute the chain
    const result = await sequence.invoke(input);

    // Return the final result
    return {
      description: result.fitnessPlan,
      formatted: result.formatted,
      message: result.message,
      wasModified: result.wasModified,
      modifications: result.modifications,
    };
  });
};
