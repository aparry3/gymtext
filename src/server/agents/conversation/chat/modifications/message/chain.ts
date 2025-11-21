import { RunnableLambda } from '@langchain/core/runnables';
import { initializeModel } from '@/server/agents/base';
import { MODIFICATIONS_MESSAGE_SYSTEM_PROMPT, buildModificationsMessageUserPrompt } from './prompt';

/**
 * Modification Message Runnable
 *
 * Converts technical modification descriptions into friendly, conversational SMS messages.
 * Uses a lightweight model to generate brief, encouraging messages suitable for SMS format.
 *
 * @returns Runnable that takes modifications string and returns conversational message string
 */
export const createModificationMessageRunnable = () => {
  return RunnableLambda.from(async (modifications: string): Promise<string> => {
    // Initialize model for plain string output (no schema)
    const model = initializeModel(undefined, { model: 'gpt-5-nano' });

    // Build user prompt
    const userPrompt = buildModificationsMessageUserPrompt(modifications);

    // Generate conversational message
    const response = await model.invoke([
      {
        role: 'system',
        content: MODIFICATIONS_MESSAGE_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userPrompt,
      }
    ]);

    // Extract the message content from the response
    // The response structure depends on the model, but typically has a content field
    const message = typeof response === 'string'
      ? response
      : (response as any).content || String(response); // eslint-disable-line @typescript-eslint/no-explicit-any

    return message;
  });
};
