import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { FormattedMesocycleConfig, FormattedMesocycleOutput } from './types';
import type { MesocycleChainContext } from '../generation/chain';
import { buildFormattedMesocycleSystemPrompt, createFormattedMesocycleUserPrompt } from './prompt';

/**
 * Formatted Mesocycle Agent Factory
 *
 * Converts long-form mesocycle descriptions into markdown-formatted documents
 * optimized for frontend display.
 *
 * This agent runs in parallel with microcycle extraction after the long-form
 * mesocycle description is generated.
 *
 * @param config - Configuration containing schema and agent settings
 * @returns Agent (runnable) that produces formatted mesocycle markdown
 */
export const createFormattedMesocycleAgent = <TMesocycle = unknown>(
  config: FormattedMesocycleConfig
) => {
  const agentConfig = config.agentConfig || {
    modelType: 'openai',
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
  };

  const model = initializeModel(config.schema, agentConfig);

  return createRunnableAgent<MesocycleChainContext, FormattedMesocycleOutput<TMesocycle>>(async (input) => {
    const { longFormMesocycle, durationWeeks } = input;

    // Extract mesocycle index from overview string if needed
    // Assuming mesocycle overview might contain index info, otherwise default to 0
    const mesocycleIndex = 0; // TODO: Extract from context if available

    const systemPrompt = buildFormattedMesocycleSystemPrompt();
    const userPrompt = createFormattedMesocycleUserPrompt(
      longFormMesocycle,
      mesocycleIndex,
      durationWeeks
    );

    const mesocycle = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    // Validate schema
    const validatedMesocycle = config.schema.parse(mesocycle);

    console.log(`[Mesocycle Formatting] Generated formatted mesocycle markdown (${durationWeeks} weeks)`);

    return validatedMesocycle as FormattedMesocycleOutput<TMesocycle>;
  });
};
