import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { FormattedFitnessPlanConfig, FormattedFitnessPlanOutput } from './types';
import type { FitnessPlanChainContext } from '../generation/chain';
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
export const createFormattedFitnessPlanAgent = <TFitnessPlan = unknown>(
  config: FormattedFitnessPlanConfig
) => {
  const agentConfig = config.agentConfig || {
    modelType: 'openai',
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
  };

  const model = initializeModel(config.schema, agentConfig);

  return createRunnableAgent<FitnessPlanChainContext, FormattedFitnessPlanOutput<TFitnessPlan>>(async (input) => {
    const { longFormPlan } = input;

    const systemPrompt = buildFormattedFitnessPlanSystemPrompt();
    const userPrompt = createFormattedFitnessPlanUserPrompt(longFormPlan);

    const fitnessPlan = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    // Validate schema
    const validatedFitnessPlan = config.schema.parse(fitnessPlan);

    console.log(`[Fitness Plan Formatting] Generated formatted fitness plan markdown`);

    return validatedFitnessPlan as FormattedFitnessPlanOutput<TFitnessPlan>;
  });
};
