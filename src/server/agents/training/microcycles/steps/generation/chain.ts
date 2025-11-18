import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { microcycleUserPrompt } from './prompt';
import type { MicrocycleGenerationConfig, MicrocycleChainContext, MicrocycleGenerationOutput } from './types';
import { MicrocycleGenerationOutputSchema } from './types';
import { MicrocycleGenerationInput } from '../../types';

/**
 * Long-Form Microcycle Agent Factory
 *
 * Generates comprehensive weekly training patterns with structured output containing
 * an overview and array of exactly 7 day strings (Monday-Sunday).
 *
 * Used as the first step in the microcycle generation chain to produce structured output
 * that can be used directly without string parsing.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings
 * @returns Agent (runnable) that produces structured microcycle data
 */
export const createMicrocycleGenerationRunnable = (config: MicrocycleGenerationConfig) => {
  const model = initializeModel(MicrocycleGenerationOutputSchema, config.agentConfig);

  return createRunnableAgent(async (input: MicrocycleGenerationInput): Promise<MicrocycleChainContext> => {
    const systemMessage = config.systemPrompt;

    // Generate user prompt from input
    const userPrompt = microcycleUserPrompt({
      microcycleOverview: input.microcycleOverview,
      weekNumber: input.weekNumber
    });

    const microcycle = await model.invoke([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userPrompt }
    ]) as MicrocycleGenerationOutput;

    console.log(`[MicrocycleGenerationRunnable] Generated microcycle with ${microcycle.days.length} days for week ${input.weekNumber + 1}`);

    return {
      microcycle,
      microcycleOverview: input.microcycleOverview,
      weekNumber: input.weekNumber
    };
  });
};
