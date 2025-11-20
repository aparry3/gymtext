import { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlanOverview } from '@/server/models/fitnessPlan';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import {
  FITNESS_PLAN_SYSTEM_PROMPT,
  fitnessPlanUserPrompt,
  createFitnessPlanGenerationRunnable,
  createFitnessPlanMessageAgent,
  createFormattedFitnessPlanAgent,
} from './steps';

export type { FitnessProfileContextService } from './types';

/**
 * Creates a fitness plan agent with injected dependencies
 *
 * Uses a composable chain for generating fitness plans:
 * 1. Generate structured plan with overview and mesocycles array
 * 2. Generate formatted markdown for frontend display (parallel with step 3)
 * 3. Generate SMS-formatted summary message (parallel with step 2)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 *
 * @param deps - Dependencies including context service
 * @returns Function that generates fitness plans with summary message
 */
export const createFitnessPlanAgent = () => {
  return async (user: UserWithProfile): Promise<FitnessPlanOverview> => {

    try {
      // Step 1: Create long-form runnable (with structured output)
      const fitnessPlanGenerationRunnable = createFitnessPlanGenerationRunnable({
        systemPrompt: FITNESS_PLAN_SYSTEM_PROMPT,
        agentConfig: {
          model: 'gpt-5-mini',
        }
      });

      // Step 2: Create formatting agent
      const formattedAgent = createFormattedFitnessPlanAgent({
        operationName: 'format fitness plan',
      });

      // Step 3: Create message agent
      const messageAgent = createFitnessPlanMessageAgent({
        operationName: 'generate plan message'
      });

      // Compose the chain: structured generation → parallel (formatted + message)
      const sequence = RunnableSequence.from([
        fitnessPlanGenerationRunnable,
        RunnablePassthrough.assign({
          formatted: formattedAgent,
          message: messageAgent
        })
      ]);

      // Execute the chain
      const result = await sequence.invoke({
        user
      });

      // Combine results into final overview
      const finalResult: FitnessPlanOverview = {
        description: result.fitnessPlan.overview,
        mesocycles: result.fitnessPlan.mesocycles,
        totalWeeks: result.fitnessPlan.total_weeks,
        formatted: result.formatted,
        message: result.message
      };

      console.log(`[FitnessPlan] Generated fitness plan with ${result.fitnessPlan.mesocycles.length} mesocycles for user ${user.id}`);

      return finalResult;
    } catch (error) {
      console.error('[FitnessPlan] Error generating fitness plan:', error);
      throw error;
    }
  };
};
