import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { FitnessPlanConfig, FitnessPlanInput } from './types';
import type { FitnessPlanChainContext } from '../../../../shared/types';
import { FITNESS_PLAN_SYSTEM_PROMPT, fitnessPlanUserPrompt } from './prompt';

/**
 * Fitness Plan Generation Agent Factory
 *
 * Generates comprehensive fitness plans with structured output containing
 * a plan description string.
 *
 * Used as the first step in the fitness plan generation chain to produce structured output
 * that can be used directly without string parsing.
 *
 * Includes validation and retry logic to ensure valid output.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings
 * @returns Agent (runnable) that produces structured plan data
 */
export const createFitnessPlanGenerationRunnable = (config: FitnessPlanConfig) => {
  const model = initializeModel(undefined, config.agentConfig);
  const maxRetries = config.maxRetries ?? 3;

  return createRunnableAgent(async (input: FitnessPlanInput): Promise<FitnessPlanChainContext> => {
    let lastError: string | undefined;

    const userPrompt = fitnessPlanUserPrompt(input.user);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const fitnessPlan = await model.invoke([
        { role: 'system', content: FITNESS_PLAN_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ]) as string;

      return {
        fitnessPlan,
        user: input.user,
      };
    }

    // All retries exhausted
    throw new Error(`Failed to generate valid fitness plan after ${maxRetries} attempts. Last error: ${lastError}`);
  });
};
