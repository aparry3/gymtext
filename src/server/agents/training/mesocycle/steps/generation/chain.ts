import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { LongFormMesocycleConfig, LongFormMesocycleInput, MesocycleChainContext } from './types';
import { mesocycleUserPrompt } from './prompt';

/**
 * Long-Form Mesocycle Agent Factory
 *
 * Generates comprehensive mesocycle descriptions in natural language form,
 * breaking down the mesocycle into detailed weekly microcycle descriptions.
 *
 * Used as the first step in the mesocycle generation chain to produce long-form output,
 * which can then be parsed to extract microcycle strings.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings
 * @returns Agent (runnable) that produces a long-form mesocycle string
 */
export const createLongFormMesocycleRunnable = (config: LongFormMesocycleConfig) => {
  const model = initializeModel(undefined, config.agentConfig);

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
    ]);

    return {
      longFormMesocycle,
      mesocycleOverview: input.mesocycleOverview,
      user: input.user,
      fitnessProfile: input.fitnessProfile
    };
  });
};
