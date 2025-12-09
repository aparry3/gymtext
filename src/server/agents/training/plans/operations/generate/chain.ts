import { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlanOverview } from '@/server/models/fitnessPlan';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { createFitnessPlanGenerationRunnable } from './steps/generation/chain';
import {
  createFitnessPlanMessageAgent,
  createFormattedFitnessPlanAgent,
  createStructuredPlanAgent,
} from '../../shared/steps';

/**
 * Creates a fitness plan agent with injected dependencies
 *
 * Uses a composable chain for generating fitness plans:
 * 1. Generate structured text plan with split, deload rules, progression model
 * 2. Generate formatted markdown for frontend display (parallel with step 3)
 * 3. Generate SMS-formatted summary message (parallel with step 2)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 *
 * @returns Function that generates fitness plans with summary message
 */
export const createFitnessPlanGenerateAgent = () => {
  return async (user: UserWithProfile): Promise<FitnessPlanOverview> => {

    try {
      // Step 1: Create generation runnable (with structured output)
      const fitnessPlanGenerationRunnable = createFitnessPlanGenerationRunnable({
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

      // Step 4: Create structured agent
      const structuredAgent = createStructuredPlanAgent({
        operationName: 'structured plan'
      });

      // Compose the chain: structured generation → parallel (formatted + message + structure)
      const sequence = RunnableSequence.from([
        fitnessPlanGenerationRunnable,
        RunnablePassthrough.assign({
          formatted: formattedAgent,
          message: messageAgent,
          structure: structuredAgent
        })
      ]);

      // Execute the chain
      const result = await sequence.invoke({
        user
      });

      // Combine results into final overview
      const finalResult: FitnessPlanOverview = {
        description: result.fitnessPlan,
        formatted: result.formatted,
        message: result.message,
        structure: result.structure
      };

      console.log(`[FitnessPlan] Generated fitness plan for user ${user.id}`);

      return finalResult;
    } catch (error) {
      console.error('[FitnessPlan] Error generating fitness plan:', error);
      throw error;
    }
  };
};

// Backwards-compatible alias
export const createFitnessPlanAgent = createFitnessPlanGenerateAgent;
