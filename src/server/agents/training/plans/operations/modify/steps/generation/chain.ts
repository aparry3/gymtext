import { modifyFitnessPlanUserPrompt, FITNESS_PLAN_MODIFY_SYSTEM_PROMPT } from './prompt';
import { createRunnableAgent, initializeModel, type AgentDeps } from '@/server/agents/base';
import type { ModifyFitnessPlanInput, ModifyFitnessPlanOutput } from './types';
import { ModifyFitnessPlanOutputSchema } from './types';
import type { FitnessPlanChainContext } from '../../../../shared/types';

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
export const createModifyFitnessPlanRunnable = (deps?: AgentDeps) => {
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
