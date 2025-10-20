import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createRunnableAgent } from '@/server/agents/base';
import { conversationSummaryPrompt } from './prompts';
import type { SummaryInput, SummaryOutput, SummaryAgentDeps } from './types';

/**
 * Summary Agent Factory
 *
 * Creates concise summaries of conversation message batches.
 * Uses Gemini 2.0 Flash for efficient summarization.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates conversation summaries
 */
export const createSummaryAgent = (deps?: SummaryAgentDeps) => {
  const llm = new ChatGoogleGenerativeAI({
    temperature: deps?.config?.temperature ?? 0.7,
    model: deps?.config?.model ?? "gemini-2.0-flash"
  });

  return createRunnableAgent<SummaryInput, SummaryOutput>(async (input) => {
    const { user, messages } = input;

    const summaryPrompt = conversationSummaryPrompt(user, messages);
    const summaryResponse = await llm.invoke(summaryPrompt);
    const summary = typeof summaryResponse.content === 'string'
      ? summaryResponse.content
      : String(summaryResponse.content);

    return { summary };
  });
};

/**
 * @deprecated Legacy export for backward compatibility - use createSummaryAgent instead
 */
export const summaryAgent = {
  invoke: async ({ user, context }: { user: any, context: { messages: string } }): Promise<{ user: any, context: { messages: string }, value: string }> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const agent = createSummaryAgent();
    const result = await agent.invoke({ user, messages: context.messages });
    return { user, context, value: result.summary };
  }
};