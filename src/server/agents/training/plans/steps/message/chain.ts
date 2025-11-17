import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { planSummaryMessageUserPrompt, PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT } from './prompt';
import type { PlanMessageConfig } from './types';
import type { FitnessPlanChainContext } from '../generation/types';

/**
 * Fitness Plan Message Agent Factory
 *
 * Generates SMS-formatted plan summary messages from long-form fitness plan descriptions.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that generates SMS message strings from long-form plans
 */
export const createPlanMessageAgent = (config: PlanMessageConfig) => {
  // Initialize model without schema for plain text output
  const model = initializeModel(undefined, config.agentConfig);

  return createRunnableAgent<FitnessPlanChainContext, string>(async (input) => {
    const { longFormPlan, user } = input;

    // Build user prompt from long-form description and full user object (with profile)
    const userPrompt = planSummaryMessageUserPrompt(user, longFormPlan);

    // Invoke model
    const result = await model.invoke([
      { role: 'system', content: PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);

    console.log(`[${config.operationName}] Generated SMS message for fitness plan`);

    return result;
  });
};
