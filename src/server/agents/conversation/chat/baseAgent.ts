import { initializeModel, AgentConfig } from '@/server/agents/base';
import { RunnableLambda } from '@langchain/core/runnables';
import type { ChatSubagentInput } from './types';
import { z } from 'zod';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';

/**
 * Creates a base runnable for chat subagents
 * @param systemPrompt - Static system prompt
 * @param userMessageBuilder - Function that builds the dynamic user message
 * @param outputSchema - Zod schema for structured output
 * @param config - Optional agent configuration
 * @returns RunnableLambda that processes the input and returns structured output
 */
export const createChatSubagentRunnable = <T extends z.ZodType>(
  systemPrompt: string,
  userMessageBuilder: (input: ChatSubagentInput) => string,
  outputSchema?: T,
  config?: AgentConfig,
  agentName?: string
): RunnableLambda<ChatSubagentInput, z.infer<T>> => {
  return RunnableLambda.from(async (input: ChatSubagentInput) => {
    const name = agentName || 'SUBAGENT';

    console.log(`[${name}] Processing message:`, {
      message: input.message.substring(0, 100) + (input.message.length > 100 ? '...' : ''),
      primaryIntent: input.triage.intents[0]?.intent,
      confidence: input.triage.intents[0]?.confidence,
      hasProfileUpdates: input.profile.summary?.reason !== 'No updates detected',
      previousMessagesCount: input.previousMessages?.length || 0
    });

    const model = initializeModel(outputSchema, config);

    // Build the user message (now without conversation history)
    const userMessage = userMessageBuilder(input);

    // Construct message array with proper role structure
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      // Add previous messages as structured message objects
      ...ConversationFlowBuilder.toMessageArray(input.previousMessages || []),
      // Current user message
      {
        role: 'user',
        content: userMessage,
      }
    ];


    let result: z.infer<T>;
    try {
      result = await model.invoke(messages) as z.infer<T>;
    } catch (error) {
      console.error(`[${name}] Error generating response:`, error);
      throw error;
    }

    console.log(`[${name}] Generated response:`, {
      response: typeof result === 'object' && 'response' in result
        ? (result.response as string).substring(0, 100) + ((result.response as string).length > 100 ? '...' : '')
        : JSON.stringify(result).substring(0, 100),
      fullResult: result
    });

    return result;
  });
};
