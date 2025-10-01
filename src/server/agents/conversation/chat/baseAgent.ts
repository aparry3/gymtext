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
 * @param promptBuilder - Function that builds the system prompt
 * @param outputSchema - Zod schema for structured output
 * @param config - Optional agent configuration
 * @returns RunnableLambda that processes the input and returns structured output
 */
export const createChatSubagentRunnable = <T extends z.ZodType>(
  promptBuilder: (input: ChatSubagentInput) => string,
  outputSchema?: T,
  config?: AgentConfig
): RunnableLambda<ChatSubagentInput, z.infer<T>> => {
  return RunnableLambda.from(async (input: ChatSubagentInput) => {
    const model = initializeModel(outputSchema, config);

    const messages = [
      {
        role: 'system',
        content: promptBuilder(input),
      },
      {
        role: 'user',
        content: input.message,
      }
    ];

    return await model.invoke(messages) as z.infer<T>;
  });
};
