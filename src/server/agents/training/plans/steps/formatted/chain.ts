import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { FormattedFitnessPlanConfig } from './types';
import type { FitnessPlanChainContext } from '../generation/types';
import { buildFormattedFitnessPlanSystemPrompt, createFormattedFitnessPlanUserPrompt } from './prompt';

/**
 * Formatted Fitness Plan Agent Factory
 *
 * Converts long-form fitness plan descriptions into markdown-formatted documents
 * optimized for frontend display.
 *
 * This agent runs in parallel with mesocycle extraction after the long-form
 * fitness plan description is generated.
 *
 * @param config - Configuration containing schema and agent settings
 * @returns Agent (runnable) that produces formatted fitness plan markdown
 */
export const createFormattedFitnessPlanAgent = (
  config: FormattedFitnessPlanConfig
) => {
  const model = initializeModel(undefined, config.agentConfig);

  return createRunnableAgent<FitnessPlanChainContext, string>(async (input) => {
    const { fitnessPlan } = input;

    const systemPrompt = buildFormattedFitnessPlanSystemPrompt();
    const userPrompt = createFormattedFitnessPlanUserPrompt(fitnessPlan);

    const formattedFitnessPlan = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    console.log(`[Fitness Plan Formatting] Generated formatted fitness plan markdown`);

    return formattedFitnessPlan;
  });
};
