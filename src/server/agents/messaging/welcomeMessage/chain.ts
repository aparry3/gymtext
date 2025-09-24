import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { welcomePrompt } from '@/server/agents/messaging/welcomeMessage/prompts';
import { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlan } from '@/server/models/fitnessPlan';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.7, model: "gemini-2.0-flash" });

export const welcomeMessageAgent = {
  invoke: async ({ user, context }: { user: UserWithProfile, context: { fitnessPlan: FitnessPlan } }): Promise<{ user: UserWithProfile, context: { fitnessPlan: FitnessPlan }, value: string }> => {
    const welcomePromptText = welcomePrompt(user, context.fitnessPlan);
    const welcomeResp = await llm.invoke(welcomePromptText);
    const welcomeContent = typeof welcomeResp.content === 'string'
      ? welcomeResp.content
      : String(welcomeResp.content);
    
    return { user, context, value: welcomeContent };
  }
}