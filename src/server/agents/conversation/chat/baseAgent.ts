import { initializeModel, AgentConfig } from '@/server/agents/base';
import { RunnableLambda } from '@langchain/core/runnables';
import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import type { ProfilePatchResult } from '@/server/services/fitnessProfileService';
import type { TriageResult } from './types';
import { z } from 'zod';

/**
 * Input type for chat subagent runnables
 */
export interface ChatSubagentInput {
  message: string;
  user: UserWithProfile;
  profile: ProfilePatchResult;
  triage: TriageResult;
  conversationHistory?: Message[];
}

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
      hasProfileUpdates: input.profile.summary?.reason !== 'No updates detected'
    });

    const model = initializeModel(outputSchema, config);

    const userMessage = userMessageBuilder(input);
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      }
    ];

    // Write prompts to temp file for debugging
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const tempFilePath = path.join(process.cwd(), '_temp.txt');
      const timestamp = new Date().toISOString();
      const content = `
===============================================
${name} Agent - ${timestamp}
===============================================

SYSTEM PROMPT:
${systemPrompt}

---

USER MESSAGE:
${userMessage}

---

TRIAGE INFO:
${JSON.stringify(input.triage, null, 2)}

---

PROFILE SUMMARY:
${JSON.stringify(input.profile.summary, null, 2)}

===============================================

`;
      await fs.appendFile(tempFilePath, content);
    } catch (err) {
      console.error(`[${name}] Failed to write to temp file:`, err);
    }

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
