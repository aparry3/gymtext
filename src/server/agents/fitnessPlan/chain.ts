import { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlanModel, FitnessPlanOverview } from '@/server/models/fitnessPlan';
import { FITNESS_PLAN_SYSTEM_PROMPT, fitnessPlanUserPrompt } from '@/server/agents/fitnessPlan/prompts';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { createLongFormPlanRunnable } from './longFormPlan/chain';
import { createStructuredPlanAgent } from './structuredPlan/chain';
import { createPlanMessageAgent } from './planMessage/chain';

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
 * 1. Generate long-form plan description and reasoning
 * 2. Convert to structured JSON (parallel with step 3)
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

      // Step 2: Create structured plan agent
      const structuredAgent = createStructuredPlanAgent({
        schema: FitnessPlanModel.schema,
        operationName: 'generate fitness plan'
      });

      // Step 3: Create message agent
      const messageAgent = createPlanMessageAgent({
        operationName: 'generate plan message'
      });

      // Compose the chain: long-form → parallel (structured + message)
      const sequence = RunnableSequence.from([
        longFormRunnable,
        RunnablePassthrough.assign({
          structured: structuredAgent,
          message: messageAgent
        })
      ]);

      // Execute the chain
      const result = await sequence.invoke({
        user,
        fitnessProfile,
        prompt: userPrompt
      });

      // Combine structured result with plan description, reasoning, and message
      const finalResult: FitnessPlanOverview = {
        ...result.structured,
        planDescription: result.longFormPlan.description,
        reasoning: result.longFormPlan.reasoning,
        message: result.message
      };

      console.log(`[FitnessPlan] Generated fitness plan with message for user ${user.id}`);

      return finalResult as FitnessPlanOverview;
    } catch (error) {
      console.error('[FitnessPlan] Error generating fitness plan:', error);
      throw error;
    }
  };
};
