import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { buildFormattedMicrocycleSystemPrompt, createFormattedMicrocycleUserPrompt } from './prompt';
import type { FormattedMicrocycleConfig } from './types';
import type { MicrocycleChainContext } from '../generation/types';

/**
 * Formatted Microcycle Agent Factory
 *
 * Converts long-form microcycle descriptions to beautifully formatted markdown text.
 * This provides a week-at-a-glance view with all 7 days structured consistently.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that converts long-form microcycles to formatted markdown
 */
export const createFormattedMicrocycleAgent = (
  config: FormattedMicrocycleConfig
) => {
  
  // Initialize model with schema from config
  const model = initializeModel(undefined, config.agentConfig);

  return createRunnableAgent<MicrocycleChainContext, string>(async (input) => {
    const { microcycle, absoluteWeek } = input;

    // Build system and user prompts
    const systemPrompt = buildFormattedMicrocycleSystemPrompt();
    const userPrompt = createFormattedMicrocycleUserPrompt(microcycle, absoluteWeek);

    // Invoke model with system and user prompts
    const formattedMicrocycle = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);


    console.log(`[${config.operationName}] Generated formatted microcycle for week ${absoluteWeek}`);

    return formattedMicrocycle;
  });
};
