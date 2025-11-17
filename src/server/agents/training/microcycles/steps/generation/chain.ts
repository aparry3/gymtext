import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { microcycleUserPrompt } from './prompt';
import type { LongFormMicrocycleConfig, LongFormMicrocycleInput, MicrocycleChainContext } from './types';

/**
 * Long-Form Microcycle Agent Factory
 *
 * Generates comprehensive weekly training pattern descriptions in natural language form.
 *
 * Used as the first step in the microcycle generation chain to produce long-form output,
 * which can then be structured or summarized for other uses.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings
 * @returns Agent (runnable) that produces a long-form microcycle string
 */
export const createLongFormMicrocycleRunnable = (config: LongFormMicrocycleConfig) => {
  const model = initializeModel(undefined, config.agentConfig);

  return createRunnableAgent(async (input: LongFormMicrocycleInput): Promise<MicrocycleChainContext> => {
    const systemMessage = config.systemPrompt;

    // Generate user prompt from input
    const userPrompt = microcycleUserPrompt({
      microcycleOverview: input.microcycleOverview,
      weekNumber: input.weekNumber
    });
    console.log(`[LongFormMicrocycleRunnable] User prompt: ${userPrompt}`);

    const longFormMicrocycle = await model.invoke([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userPrompt }
    ]);

    console.log(`[LongFormMicrocycleRunnable] Long-form microcycle: ${JSON.stringify(longFormMicrocycle)}`);

    return {
      longFormMicrocycle,
      microcycleOverview: input.microcycleOverview,
      weekNumber: input.weekNumber
    };
  });
};
