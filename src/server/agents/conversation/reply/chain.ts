import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import { initializeModel } from '../../base';
import { REPLY_AGENT_SYSTEM_PROMPT, buildReplyMessage } from './prompts';

/**
 * Reply Agent - Provides quick acknowledgments before full message processing
 *
 * This agent generates immediate, natural replies that sound like a real trainer,
 * allowing for fast webhook responses before the full AI processing via Inngest.
 *
 * @param user - The user receiving the message
 * @param message - The incoming message content
 * @param conversationHistory - Optional recent conversation history for context
 * @returns A string containing the quick reply
 */
export const replyAgent = async (
  user: UserWithProfile,
  message: string,
  conversationHistory?: Message[]
): Promise<string> => {
  console.log('[REPLY AGENT] Generating quick reply for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

  // Initialize model without structured output - just want raw text response
  const model = initializeModel();

  // Build the context message
  const userMessage = buildReplyMessage(message, user, conversationHistory);

  // Create the messages array
  const messages = [
    {
      role: 'system',
      content: REPLY_AGENT_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: userMessage,
    }
  ];

  // Invoke the model and extract the text response
  const response = await model.invoke(messages);

  // Extract text content from the response
  const replyText = typeof response === 'string'
    ? response
    : response.content || 'Got it! Give me just a moment.';

  console.log('[REPLY AGENT] Generated reply:', replyText);

  return replyText;
};
