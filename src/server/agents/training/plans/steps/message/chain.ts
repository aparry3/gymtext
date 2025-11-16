import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { z } from 'zod';
import { planSummaryMessageUserPrompt, PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT } from './prompt';
import type { PlanMessageConfig } from './types';
import type { FitnessPlanChainContext } from '../generation/types';

// Schema for SMS message generation
const PlanSummaryMessageSchema = z.object({
  message: z.string().describe("SMS-formatted plan summary message")
});

/**
 * Fitness Plan Message Agent Factory
 *
 * Generates SMS-formatted plan summary messages from long-form fitness plan descriptions.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that generates SMS messages from long-form plans
 */
export const createPlanMessageAgent = (config: PlanMessageConfig) => {
  // Initialize model with message schema
  const model = initializeModel(PlanSummaryMessageSchema, config.agentConfig);

  return createRunnableAgent<FitnessPlanChainContext, string>(async (input) => {
    const { longFormPlan, user } = input;

    // Build user prompt from long-form description and full user object (with profile)
    const userPrompt = planSummaryMessageUserPrompt(user, longFormPlan.description);

    // Invoke model
    const result = await model.invoke([
      { role: 'system', content: PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);

    console.log(`[${config.operationName}] Generated SMS message for fitness plan`);

    return result.message;
  });
};
