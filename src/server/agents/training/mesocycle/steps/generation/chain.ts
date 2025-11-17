import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { MesocycleAgentConfig, MesocycleGenerationInput, MesocycleChainContext, MesocycleGenerationOutput } from './types';
import { MesocycleGenerationOutputSchema } from './types';
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
export const createMesocycleGenerationRunnable = (config: MesocycleAgentConfig) => {
  const model = initializeModel(MesocycleGenerationOutputSchema, config.agentConfig);

  return createRunnableAgent(async (input: MesocycleGenerationInput): Promise<MesocycleChainContext> => {
    const systemMessage = config.systemPrompt;
    const userPrompt = mesocycleUserPrompt(
      input.mesocycleOverview,
      input.user,
      input.fitnessProfile
    );


    const mesocycle = await model.invoke([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userPrompt }
    ]) as MesocycleGenerationOutput;

    console.log(`[MesocycleGenerationRunnable] Generated mesocycle with ${mesocycle.microcycles.length} microcycles`);

    return {
      mesocycle,
      mesocycleOverview: input.mesocycleOverview,
      user: input.user,
      fitnessProfile: input.fitnessProfile
    };
  });
};
