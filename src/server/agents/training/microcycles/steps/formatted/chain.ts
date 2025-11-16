import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { buildFormattedMicrocycleSystemPrompt, createFormattedMicrocycleUserPrompt } from './prompt';
import type { FormattedMicrocycleConfig, FormattedMicrocycleOutput } from './types';
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
export const createFormattedMicrocycleAgent = <TMicrocycle = unknown>(
  config: FormattedMicrocycleConfig
) => {
  const agentConfig = config.agentConfig || {
    model: 'gemini-2.5-flash',
    maxTokens: 16384
  };

  // Initialize model with schema from config
  const model = initializeModel(config.schema, agentConfig);

  return createRunnableAgent<MicrocycleChainContext, FormattedMicrocycleOutput<TMicrocycle>>(async (input) => {
    const { longFormMicrocycle, weekNumber } = input;

    // Detect if this is a deload week from the description
    const isDeload = /deload/i.test(longFormMicrocycle.description);

    // Build system and user prompts
    const systemPrompt = buildFormattedMicrocycleSystemPrompt();
    const userPrompt = createFormattedMicrocycleUserPrompt(longFormMicrocycle, weekNumber, isDeload);

    // Invoke model with system and user prompts
    const microcycle = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]) as TMicrocycle;

    // Validate the microcycle structure
    const validatedMicrocycle = config.schema.parse(microcycle);

    // Basic validation - ensure formatted text exists and is not empty
    if ('formatted' in validatedMicrocycle) {
      const formatted = validatedMicrocycle.formatted as string;
      if (!formatted || formatted.trim().length < 200) {
        throw new Error('Formatted microcycle is too short or empty');
      }
      // Check for required markdown headers
      if (!formatted.includes('# Week') || !formatted.includes('## ')) {
        throw new Error('Formatted microcycle missing required headers');
      }
      // Validate all 7 days are present
      const requiredDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const missingDays = requiredDays.filter(day => !formatted.includes(`### ${day}`));
      if (missingDays.length > 0) {
        throw new Error(`Formatted microcycle missing required days: ${missingDays.join(', ')}`);
      }
    }

    console.log(`[${config.operationName}] Generated formatted microcycle for week ${weekNumber}`);

    return validatedMicrocycle as FormattedMicrocycleOutput<TMicrocycle>;
  });
};
