import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { microcycleUserPrompt } from './prompt';
import type { MicrocycleGenerationConfig, MicrocycleChainContext, MicrocycleGenerationOutput } from './types';
import { MicrocycleGenerationOutputSchema } from './types';
import { MicrocycleGenerationInput } from '../../types';

/**
 * Microcycle Generation Agent Factory
 *
 * Generates comprehensive weekly training patterns with structured output containing
 * an overview and array of exactly 7 day strings (Monday-Sunday).
 *
 * Uses the fitness plan text and user profile to generate the weekly pattern.
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
      planText: input.planText,
      clientProfile: input.userProfile || '',
      absoluteWeek: input.absoluteWeek,
    });

    const microcycle = await model.invoke([
      { role: 'system', content: systemMessage },
      { role: 'user', content: userPrompt }
    ]) as MicrocycleGenerationOutput;

    console.log(`[MicrocycleGenerationRunnable] Generated microcycle with ${microcycle.days.length} days for week ${input.absoluteWeek}`);

    return {
      microcycle,
      planText: input.planText,
      userProfile: input.userProfile,
      absoluteWeek: input.absoluteWeek,
      isDeload: input.isDeload
    };
  });
};
