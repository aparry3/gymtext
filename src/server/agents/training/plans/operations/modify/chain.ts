import { modifyFitnessPlanUserPrompt, FITNESS_PLAN_MODIFY_SYSTEM_PROMPT } from './prompt';
import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import type { ModifyFitnessPlanInput, ModifyFitnessPlanAgentDeps, ModifyFitnessPlanAgentOutput } from './types';
import { ModifyFitnessPlanOutputSchema, type ModifyFitnessPlanOutput } from './types';
import { createFormattedFitnessPlanAgent, createFitnessPlanMessageAgent } from '../../steps';

export type { ModifyFitnessPlanInput } from './types';

/**
 * Creates the modify-specific first step runnable
 * Takes ModifyFitnessPlanInput and produces ModifyFitnessPlanContext
 */
const createModifyFitnessPlanRunnable = (deps?: ModifyFitnessPlanAgentDeps) => {
  const model = initializeModel(ModifyFitnessPlanOutputSchema, deps?.config);

  return createRunnableAgent<ModifyFitnessPlanInput, ModifyFitnessPlanOutput>(async (input) => {
    const { user, currentPlan, changeRequest } = input;

    // Build the current plan structure
    const currentPlanFormatted = {
      overview: currentPlan.description || '',
      mesocycles: currentPlan.mesocycles || [],
      totalWeeks: currentPlan.lengthWeeks || 0,
    };

    // Generate prompt
    const prompt = modifyFitnessPlanUserPrompt({
      user,
      currentPlan: currentPlanFormatted,
      changeRequest,
    });

    // Retry mechanism for transient errors
    const maxRetries = 2;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[ModifyFitnessPlan] Attempting to modify fitness plan (attempt ${attempt + 1}/${maxRetries})`);

        // Generate the modified fitness plan
        const fitnessPlan = await model.invoke([
          { role: 'system', content: FITNESS_PLAN_MODIFY_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ]) as ModifyFitnessPlanOutput;

        // Ensure we have a valid response
        if (!fitnessPlan) {
          throw new Error('AI returned null/undefined fitness plan');
        }

        console.log(`[ModifyFitnessPlan] Successfully modified fitness plan with ${fitnessPlan.mesocycles.length} mesocycles (wasModified: ${fitnessPlan.wasModified})`);

        return fitnessPlan;
      } catch (error) {
        console.error(`[ModifyFitnessPlan] Error modifying fitness plan (attempt ${attempt + 1}):`, error);

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

    throw new Error('Failed to modify fitness plan after all attempts');
  });
};

/**
 * Fitness Plan Modification Agent Factory
 *
 * Modifies fitness plans based on user change requests using a composable chain:
 * 1. Modify structured output based on change request (modify-specific step)
 * 2. In parallel: generate formatted markdown + SMS message (shared steps)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 * Implements retry logic (max 2 attempts in first step).
 * Structured output ensures reliable parsing without regex.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that modifies fitness plan with formatted markdown and messages
 */
export const createModifyFitnessPlanAgent = (deps?: ModifyFitnessPlanAgentDeps) => {
  return createRunnableAgent<ModifyFitnessPlanInput, ModifyFitnessPlanAgentOutput>(async (input) => {
    // Step 1: Create modify runnable (modify-specific)
    const modifyFitnessPlanRunnable = createModifyFitnessPlanRunnable(deps);

    // Step 2a: Create formatted fitness plan agent (shared step)
    const formattedAgent = createFormattedFitnessPlanAgent({
      operationName: 'modify fitness plan',
    });

    // Step 2b: Create message agent (shared step)
    const messageAgent = createFitnessPlanMessageAgent({
      operationName: 'modify fitness plan',
    });

    // Compose the full chain: modify → parallel (formatted + message)
    const sequence = RunnableSequence.from([
      modifyFitnessPlanRunnable,
      RunnablePassthrough.assign({
        formatted: formattedAgent,
        message: messageAgent,
      })
    ]);

    // Execute the chain
    const result = await sequence.invoke(input);

    // Return final output with all fields
    return {
      description: result.overview,
      mesocycles: result.mesocycles,
      totalWeeks: result.total_weeks,
      formatted: result.formatted,
      message: result.message,
      wasModified: result.wasModified,
      modifications: result.modifications,
    };
  });
};
