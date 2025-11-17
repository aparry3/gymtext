import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { LongFormMesocycleConfig, LongFormMesocycleInput, MesocycleChainContext, LongFormMesocycleOutput } from './types';
import { LongFormMesocycleOutputSchema } from './types';
import { mesocycleUserPrompt } from './prompt';

/**
 * Long-Form Mesocycle Agent Factory
 *
 * Generates comprehensive mesocycles with structured output containing
 * an overview and array of weekly microcycle strings.
 *
 * Used as the first step in the mesocycle generation chain to produce structured output
 * that can be used directly without string parsing.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings
 * @returns Agent (runnable) that produces structured mesocycle data
 */
export const createLongFormMesocycleRunnable = (config: LongFormMesocycleConfig) => {
  const model = initializeModel(LongFormMesocycleOutputSchema, config.agentConfig);

  return createRunnableAgent(async (input: LongFormMesocycleInput): Promise<MesocycleChainContext> => {
    const systemMessage = config.systemPrompt;
    const userPrompt = mesocycleUserPrompt(
      input.mesocycleOverview,
      input.user,
      input.fitnessProfile
    );


    const longFormMesocycle = await model.invoke([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userPrompt }
    ]) as LongFormMesocycleOutput;

    console.log(`[LongFormMesocycle] Generated mesocycle with ${longFormMesocycle.microcycles.length} microcycles`);

    return {
      longFormMesocycle,
      mesocycleOverview: input.mesocycleOverview,
      user: input.user,
      fitnessProfile: input.fitnessProfile
    };
  });
};
