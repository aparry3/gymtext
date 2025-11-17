import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { FormattedMesocycleConfig, FormattedMesocycleOutput } from './types';
import type { MesocycleChainContext } from '../generation/types';
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
export const createFormattedMesocycleAgent = (
  config: FormattedMesocycleConfig
) => {

  const model = initializeModel(undefined, config.agentConfig);

  return createRunnableAgent<MesocycleChainContext, string>(async (input) => {
    const { mesocycle } = input;

    const durationWeeks = mesocycle.microcycles.length

    // Extract mesocycle index from overview string if needed
    // Assuming mesocycle overview might contain index info, otherwise default to 0
    const mesocycleIndex = 0; // TODO: Extract from context if available

    const systemPrompt = buildFormattedMesocycleSystemPrompt();
    const userPrompt = createFormattedMesocycleUserPrompt(
      mesocycle,
      mesocycleIndex,
      durationWeeks
    );

    const formattedMesocycle = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    console.log(`[Mesocycle Formatting] Generated formatted mesocycle markdown (${durationWeeks} weeks)`);

    return formattedMesocycle;
  });
};
