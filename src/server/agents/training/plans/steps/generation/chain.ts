import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { FitnessPlanConfig, FitnessPlanInput, FitnessPlanChainContext, FitnessPlanOutput } from './types';
import { FitnessPlanOutputSchema } from './types';

/**
 * Fitness Plan Generation Agent Factory
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
export const createFitnessPlanGenerationRunnable = (config: FitnessPlanConfig) => {
  const model = initializeModel(FitnessPlanOutputSchema, config.agentConfig);

  return createRunnableAgent(async (input: FitnessPlanInput): Promise<FitnessPlanChainContext> => {
    const systemMessage = config.systemPrompt;
    const fitnessPlan = await model.invoke([
      { role: 'system', content: systemMessage },
      { role: 'user', content: input.prompt }
    ]) as FitnessPlanOutput;

    console.log(`[FitnessPlanGenerationRunnable] Generated plan with ${fitnessPlan.mesocycles.length} mesocycles`);

    return {
      fitnessPlan,
      user: input.user,
      fitnessProfile: input.fitnessProfile
    };
  });
};
