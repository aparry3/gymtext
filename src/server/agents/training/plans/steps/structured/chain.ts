import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { FitnessPlanChainContext, FitnessPlanOutput, StructuredFitnessPlanInput } from './types';
import { FitnessPlanOutputSchema } from './types';
import { validateFitnessPlanOutput } from './validation';
import { STRUCTURED_FITNESS_PLAN_SYSTEM_PROMPT, fitnessPlanUserPrompt } from './prompt';
import { FitnessPlanConfig } from '../../types';

/**
 * Fitness Plan Generation Agent Factory
 *
 * Generates comprehensive fitness plans with structured output containing
 * an overview and array of mesocycle strings.
 *
 * Used as the first step in the fitness plan generation chain to produce structured output
 * that can be used directly without string parsing.
 *
 * Includes validation and retry logic to ensure mesocycle count consistency.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings
 * @returns Agent (runnable) that produces structured plan data
 */
export const createStructuredFitnessPlanAgent = (config: FitnessPlanConfig) => {
  const model = initializeModel(FitnessPlanOutputSchema, config.agentConfig);
  const maxRetries = config.maxRetries ?? 3;

  return createRunnableAgent(async (input: StructuredFitnessPlanInput): Promise<FitnessPlanChainContext> => {
    let lastError: string | undefined;

    const userPrompt = fitnessPlanUserPrompt(input.fitnessPlan);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const fitnessPlan = await model.invoke([
        { role: 'system', content: STRUCTURED_FITNESS_PLAN_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ]) as FitnessPlanOutput;

      // Validate the output
      const validationResult = validateFitnessPlanOutput(fitnessPlan);

      if (validationResult.isValid) {
        console.log(`[FitnessPlanGenerationRunnable] Generated valid plan with ${fitnessPlan.mesocycles.length} mesocycles`);
        return {
          fitnessPlan,
          user: input.user,
        };
      }

      // Validation failed
      lastError = validationResult.error;
      console.warn(`[FitnessPlanGenerationRunnable] Attempt ${attempt}/${maxRetries} failed validation: ${validationResult.error}`);

      // Continue to next attempt if retries remain
      if (attempt < maxRetries) {
        console.log(`[FitnessPlanGenerationRunnable] Retrying generation...`);
      }
    }

    // All retries exhausted
    throw new Error(`Failed to generate valid fitness plan after ${maxRetries} attempts. Last error: ${lastError}`);
  });
};
