import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { z } from 'zod';
import { microcycleMessageUserPrompt, MICROCYCLE_MESSAGE_SYSTEM_PROMPT } from './prompt';
import type { MicrocycleMessageConfig } from './types';
import type { MicrocycleChainContext } from '../generation/types';

// Schema for SMS message generation
const MicrocycleMessageSchema = z.string().describe("SMS-formatted weekly breakdown message (under 300 characters)");

/**
 * Microcycle Message Agent Factory
 *
 * Generates SMS-formatted weekly breakdown messages from long-form microcycle descriptions.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that generates SMS messages from long-form microcycles
 */
export const createMicrocycleMessageAgent = (config: MicrocycleMessageConfig) => {
  // Initialize model with message schema
  const model = initializeModel(MicrocycleMessageSchema, config.agentConfig);

  return createRunnableAgent<MicrocycleChainContext, string>(async (input) => {
    const { longFormMicrocycle } = input;

    // Build user prompt from long-form description
    const userPrompt = microcycleMessageUserPrompt(longFormMicrocycle);
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
