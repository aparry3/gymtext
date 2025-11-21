import { initializeModel, createRunnableAgent } from '@/server/agents/base';
import { UPDATED_MICROCYCLE_SYSTEM_PROMPT, updatedMicrocycleUserPrompt } from './prompts';
import type { UpdatedMicrocycleMessageInput, UpdatedMicrocycleMessageOutput, UpdatedMicrocycleMessageAgentDeps } from './types';

/**
 * Updated Microcycle Message Agent Factory
 *
 * Creates an "updated week" SMS message when a microcycle is modified:
 * 1. Acknowledges the change was made
 * 2. Briefly explains what changed
 * 3. Shows remaining days only (today → Sunday)
 *
 * Uses separate system and user prompts for better control over tone and structure.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates microcycle update messages
 */
export const createUpdatedMicrocycleMessageAgent = (deps?: UpdatedMicrocycleMessageAgentDeps) => {
  return createRunnableAgent<UpdatedMicrocycleMessageInput, UpdatedMicrocycleMessageOutput>(async (input) => {
    const { modifiedMicrocycle, modifications, currentWeekday } = input;

    // Initialize model without schema for plain text output
    const model = initializeModel(undefined, deps?.config);

    // Build user prompt from input parameters
    const userPrompt = updatedMicrocycleUserPrompt({
      modifications,
      modifiedMicrocycle,
      currentWeekday,
    });

    // Construct messages array with system and user prompts
    const messages = [
      {
        role: 'system',
        content: UPDATED_MICROCYCLE_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userPrompt,
      }
    ];

    // Invoke model with messages array
    const result = await model.invoke(messages);

    return result;
  });
};
