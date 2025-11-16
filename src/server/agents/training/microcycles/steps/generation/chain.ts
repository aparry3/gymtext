import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { z } from 'zod';
import { microcycleUserPrompt } from './prompt';
import type { LongFormMicrocycleConfig, LongFormMicrocycleInput, MicrocycleChainContext } from './types';

// Schema for long-form microcycle description
const LongFormMicrocycleSchema = z.object({
  description: z.string().describe(
    "Complete long-form narrative containing THREE sections: " +
    "(1) WEEKLY OVERVIEW with week number, theme, split, volume/intensity trends, RIR targets, conditioning plan, and rest day placement; " +
    "(2) DAY-BY-DAY BREAKDOWN with ALL 7 days using headers like '*** MONDAY - <Session Type> ***' and including session objectives, movement patterns, volume, RIR, intensity focus, conditioning, and warm-up for each day; " +
    "(3) WEEKLY NOTES summarizing key adaptations and recovery management. " +
    "This field must contain the ACTUAL full narrative content, NOT a summary about what should be generated."
  )
});

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
