import { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlanOverview } from '@/server/models/fitnessPlan';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import {
  FITNESS_PLAN_SYSTEM_PROMPT,
  fitnessPlanUserPrompt,
  createLongFormPlanRunnable,
  createMesocycleExtractor,
  createPlanMessageAgent,
} from './steps';

/**
 * Interface for fitness profile context service (DI)
 */
export interface FitnessProfileContextService {
  getContext: (user: UserWithProfile) => Promise<string>;
}

/**
 * Dependencies for FitnessPlan Agent (DI)
 */
export interface FitnessPlanAgentDeps {
  contextService: FitnessProfileContextService;
}

/**
 * Creates a fitness plan agent with injected dependencies
 *
 * Uses a composable chain for generating fitness plans:
 * 1. Generate long-form plan description with mesocycle delimiters
 * 2. Extract mesocycle overviews from description (parallel with step 3)
 * 3. Generate SMS-formatted summary message (parallel with step 2)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 *
 * @param deps - Dependencies including context service
 * @returns Function that generates fitness plans with summary message
 */
export const createFitnessPlanAgent = (deps: FitnessPlanAgentDeps) => {
  return async (user: UserWithProfile): Promise<FitnessPlanOverview> => {
    // Get fitness profile context from service
    const fitnessProfile = await deps.contextService.getContext(user);

    try {
      // Build user prompt for step 1
      const userPrompt = fitnessPlanUserPrompt(user, fitnessProfile);

      // Step 1: Create long-form runnable
      const longFormRunnable = createLongFormPlanRunnable({
        systemPrompt: FITNESS_PLAN_SYSTEM_PROMPT
      });

      // Step 2: Create mesocycle extractor
      const mesocycleExtractor = createMesocycleExtractor({
        operationName: 'extract mesocycles'
      });

      // Step 3: Create message agent
      const messageAgent = createPlanMessageAgent({
        operationName: 'generate plan message'
      });

      // Compose the chain: long-form → parallel (mesocycles + message)
      const sequence = RunnableSequence.from([
        longFormRunnable,
        RunnablePassthrough.assign({
          mesocycles: mesocycleExtractor,
          message: messageAgent
        })
      ]);

      // Execute the chain
      const result = await sequence.invoke({
        user,
        fitnessProfile,
        prompt: userPrompt
      });

      // Combine results into final overview
      const finalResult: FitnessPlanOverview = {
        description: result.longFormPlan.description,
        mesocycles: result.mesocycles,
        message: result.message
      };

      console.log(`[FitnessPlan] Generated fitness plan with ${result.mesocycles.length} mesocycles for user ${user.id}`);

      return finalResult;
    } catch (error) {
      console.error('[FitnessPlan] Error generating fitness plan:', error);
      throw error;
    }
  };
};
