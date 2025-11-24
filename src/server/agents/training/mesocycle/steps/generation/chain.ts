import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { MesocycleAgentConfig, MesocycleGenerationInput, MesocycleGenerationOutput } from './types';
import { MESOCYCLE_SYSTEM_PROMPT, mesocycleUserPrompt } from './prompt';

/**
 * Mesocycle Text Generation Agent Factory
 *
 * Generates comprehensive mesocycle descriptions as plain text containing
 * an overview and week-by-week microcycle breakdowns.
 *
 * Used as the first step in the mesocycle generation chain to produce descriptive text
 * that will be structured by the downstream structured agent.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings
 * @returns Agent (runnable) that produces mesocycle text
 */
export const createMesocycleGenerationRunnable = (config: MesocycleAgentConfig) => {
  const model = initializeModel(undefined, config.agentConfig);
  const maxRetries = config.maxRetries ?? 3;

  return createRunnableAgent(async (input: MesocycleGenerationInput): Promise<MesocycleGenerationOutput> => {
    const userPrompt = mesocycleUserPrompt(
      input.mesocycleOverview,
      input.user,
    );

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const mesocycleText = await model.invoke([
        { role: 'system', content: MESOCYCLE_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ]) as string;

      return {
        mesocycleText,
        mesocycleOverview: input.mesocycleOverview,
        user: input.user,
      };
    }

    // All retries exhausted
    throw new Error(`Failed to generate mesocycle text after ${maxRetries} attempts.`);
  });
};
