import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { planSummaryMessageUserPrompt, PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT } from './prompt';
import type { FitnessPlanMessageConfig } from './types';
import type { FitnessPlanChainContext } from '../generation/types';

/**
 * Fitness Plan Message Agent Factory
 *
 * Generates SMS-formatted plan summary messages from long-form fitness plan descriptions.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that generates SMS message strings from long-form plans
 */
export const createFitnessPlanMessageAgent = (config: FitnessPlanMessageConfig) => {
  // Initialize model without schema for plain text output
  const model = initializeModel(undefined, config.agentConfig);

  return createRunnableAgent<FitnessPlanChainContext, string>(async (input) => {
    const { fitnessPlan, user } = input;

    // Build user prompt from plan description and full user object (with profile)
    const userPrompt = planSummaryMessageUserPrompt(user, fitnessPlan.plan);

    // Invoke model
    const result = await model.invoke([
      { role: 'system', content: PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);

    console.log(`[${config.operationName}] Generated SMS message for fitness plan`);

    return result;
  });
};
