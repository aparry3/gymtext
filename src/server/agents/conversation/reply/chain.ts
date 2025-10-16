import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import { initializeModel } from '../../base';
import { REPLY_AGENT_SYSTEM_PROMPT, buildReplyMessage } from './prompts';
import { z } from 'zod';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';

/**
 * Schema for reply agent structured output
 */
export const ReplyAgentResponseSchema = z.object({
  reply: z.string().describe('The reply message to send to the user'),
  needsFullPipeline: z.boolean().describe('Whether this message needs the full chat pipeline (profile extraction, triage, subagents)'),
  reasoning: z.string().describe('Explanation of why this does or does not need the full pipeline')
});

export type ReplyAgentResponse = z.infer<typeof ReplyAgentResponseSchema>;

/**
 * Reply Agent - Provides quick acknowledgments or full answers to general questions
 *
 * This agent generates immediate, natural replies that sound like a real trainer,
 * allowing for fast webhook responses. It can either:
 * 1. Provide full answers to general fitness questions (no full pipeline needed)
 * 2. Provide quick acknowledgments for updates/modifications (full pipeline needed)
 *
 * @param user - The user receiving the message
 * @param message - The incoming message content
 * @param previousMessages - Optional previous messages for conversation context
 * @returns ReplyAgentResponse with reply text and pipeline routing decision
 */
export const replyAgent = async (
  user: UserWithProfile,
  message: string,
  previousMessages?: Message[]
): Promise<ReplyAgentResponse> => {
  console.log('[REPLY AGENT] Generating quick reply for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''), {
    previousMessagesCount: previousMessages?.length || 0
  });

  // Initialize model with structured output schema
  const model = initializeModel(ReplyAgentResponseSchema);

  // Build the context message (now without conversation history)
  const userMessage = buildReplyMessage(message, user);

  // Create the messages array with proper role structure
  const messages = [
    {
      role: 'system',
      content: REPLY_AGENT_SYSTEM_PROMPT,
    },
    // Add previous messages as structured message objects (last 3 for speed)
    ...ConversationFlowBuilder.toMessageArray(previousMessages?.slice(-3) || []),
    // Current user message
    {
      role: 'user',
      content: userMessage,
    }
  ];

  // Invoke the model and get structured response
  const response = await model.invoke(messages) as ReplyAgentResponse;

  console.log('[REPLY AGENT] Generated reply:', {
    reply: response.reply.substring(0, 100) + (response.reply.length > 100 ? '...' : ''),
    needsFullPipeline: response.needsFullPipeline,
    reasoning: response.reasoning
  });

  return response;
};
