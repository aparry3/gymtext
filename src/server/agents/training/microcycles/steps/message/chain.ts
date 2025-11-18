import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { microcycleMessageUserPrompt, MICROCYCLE_MESSAGE_SYSTEM_PROMPT } from './prompt';
import type { MicrocycleMessageConfig } from './types';
import type { MicrocycleChainContext } from '../generation/types';

/**
 * Microcycle Message Agent Factory
 *
 * Generates SMS-formatted weekly breakdown messages from long-form microcycle descriptions.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that generates SMS message strings from long-form microcycles
 */
export const createMicrocycleMessageAgent = (config: MicrocycleMessageConfig) => {
  // Initialize model without schema for plain text output
  const model = initializeModel(undefined, config.agentConfig);

  return createRunnableAgent<MicrocycleChainContext, string>(async (input) => {
    const { microcycle } = input;

    // Build user prompt from long-form description
    const userPrompt = microcycleMessageUserPrompt(microcycle);
    console.log(`[MicrocycleMessageAgent] User prompt: ${userPrompt}`);
    // Invoke model
    const result = await model.invoke([
      { role: 'system', content: MICROCYCLE_MESSAGE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]);

    console.log(`[${config.operationName}] Generated SMS message for microcycle`);

    return result;
  });
};
