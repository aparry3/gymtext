import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { LongFormPlanConfig, LongFormPlanInput, FitnessPlanChainContext, LongFormPlanOutput } from './types';
import { LongFormPlanOutputSchema } from './types';

/**
 * Long-Form Fitness Plan Agent Factory
 *
 * Generates comprehensive fitness plans with structured output containing
 * an overview and array of mesocycle strings.
 *
 * Used as the first step in the fitness plan generation chain to produce structured output
 * that can be used directly without string parsing.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings
 * @returns Agent (runnable) that produces structured plan data
 */
export const createLongFormPlanRunnable = (config: LongFormPlanConfig) => {
  const model = initializeModel(LongFormPlanOutputSchema, config.agentConfig);

  return createRunnableAgent(async (input: LongFormPlanInput): Promise<FitnessPlanChainContext> => {
    const systemMessage = config.systemPrompt;
    const longFormPlan = await model.invoke([
      { role: 'system', content: systemMessage },
      { role: 'user', content: input.prompt }
    ]) as LongFormPlanOutput;

    console.log(`[LongFormPlan] Generated plan with ${longFormPlan.mesocycles.length} mesocycles`);

    return {
      longFormPlan,
      user: input.user,
      fitnessProfile: input.fitnessProfile
    };
  });
};
