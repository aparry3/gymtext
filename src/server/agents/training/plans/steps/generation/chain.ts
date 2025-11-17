import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { LongFormPlanConfig, LongFormPlanInput, FitnessPlanChainContext } from './types';

/**
 * Long-Form Fitness Plan Agent Factory
 *
 * Generates comprehensive fitness plan descriptions in natural language form,
 * including both detailed structure and reasoning.
 *
 * Used as the first step in the fitness plan generation chain to produce long-form output,
 * which can then be structured or summarized for other uses.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings
 * @returns Agent (runnable) that produces a long-form plan string
 */
export const createLongFormPlanRunnable = (config: LongFormPlanConfig) => {
  const model = initializeModel(undefined, config.agentConfig);

  return createRunnableAgent(async (input: LongFormPlanInput): Promise<FitnessPlanChainContext> => {
    const systemMessage = config.systemPrompt;
    const longFormPlan = await model.invoke([
      { role: 'system', content: systemMessage },
      { role: 'user', content: input.prompt }
    ]);

    console.log(`[LongFormPlan] Generated long-form plan: ${longFormPlan}`);

    return {
      longFormPlan,
      user: input.user,
      fitnessProfile: input.fitnessProfile
    };
  });
};
