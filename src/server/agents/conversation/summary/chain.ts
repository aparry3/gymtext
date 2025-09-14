import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { UserWithProfile } from '@/server/models/userModel';
import { conversationSummaryPrompt } from './prompts';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.7, model: "gemini-2.0-flash" });

export const summaryAgent = {
  invoke: async ({ user, context }: { user: UserWithProfile, context: { messages: string } }): Promise<{ user: UserWithProfile, context: { messages: string }, value: string }> => {
    const summaryPrompt = conversationSummaryPrompt(user, context.messages);
    const summaryResponse = await llm.invoke(summaryPrompt);
    const summary = typeof summaryResponse.content === 'string'
      ? summaryResponse.content
      : String(summaryResponse.content);
    
    return { user, context, value: summary };
  }
}