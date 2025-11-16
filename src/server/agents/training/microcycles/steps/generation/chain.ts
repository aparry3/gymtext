import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { z } from 'zod';
import { microcycleUserPrompt } from './prompt';
import type { LongFormMicrocycleConfig, LongFormMicrocycleInput, LongFormMicrocycleOutput } from './types';
import type { MicrocyclePatternInput } from '../../types';

// Schema for long-form microcycle description
const LongFormMicrocycleSchema = z.object({
  description: z.string().describe("Long-form narrative description of the weekly microcycle")
});

/**
 * Context that flows through the microcycle chain
 */
export interface MicrocycleChainContext extends MicrocyclePatternInput {
  longFormMicrocycle: LongFormMicrocycleOutput;
}

/**
 * Long-Form Microcycle Agent Factory
 *
 * Generates comprehensive weekly training pattern descriptions in natural language form.
 *
 * Used as the first step in the microcycle generation chain to produce long-form output,
 * which can then be structured or summarized for other uses.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings
 * @returns Agent (runnable) that produces a long-form microcycle object with description
 */
export const createLongFormMicrocycleRunnable = (config: LongFormMicrocycleConfig) => {
  const model = initializeModel(LongFormMicrocycleSchema, config.agentConfig);

  return createRunnableAgent(async (input: LongFormMicrocycleInput): Promise<MicrocycleChainContext> => {
    const systemMessage = config.systemPrompt;

    // Generate user prompt from input
    const userPrompt = microcycleUserPrompt({
      fitnessPlan: input.fitnessPlan,
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
      fitnessPlan: input.fitnessPlan,
      weekNumber: input.weekNumber
    };
  });
};
