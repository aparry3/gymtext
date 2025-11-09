import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { structuredFitnessPlanUserPrompt, STRUCTURED_FITNESS_PLAN_SYSTEM_PROMPT } from '../prompts';
import type { StructuredPlanConfig } from './types';
import type { FitnessPlanChainContext } from '../longFormPlan/chain';
import type { FitnessPlanOverview } from '@/server/models/fitnessPlan';

/**
 * Structured Fitness Plan Agent Factory
 *
 * Converts long-form fitness plan descriptions to structured JSON format.
 * Validates the plan structure with mesocycles.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that converts long-form plans to structured JSON
 */
export const createStructuredPlanAgent = <TPlan = FitnessPlanOverview>(
  config: StructuredPlanConfig
) => {
  // Initialize model with schema from config
  const model = initializeModel(config.schema, config.agentConfig);

  return createRunnableAgent<FitnessPlanChainContext, TPlan>(async (input) => {
    const { longFormPlan, user, fitnessProfile } = input;

    // Build user prompt from long-form description
    const userPrompt = structuredFitnessPlanUserPrompt(longFormPlan.description, user, fitnessProfile);

    // Invoke model
    const plan = await model.invoke([
      { role: 'system', content: STRUCTURED_FITNESS_PLAN_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]) as TPlan;

    // Validate the plan structure
    const validatedPlan = config.schema.parse(plan);

    console.log(`[${config.operationName}] Generated structured fitness plan`);

    return validatedPlan as TPlan;
  });
};
