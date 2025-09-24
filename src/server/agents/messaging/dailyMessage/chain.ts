import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance } from '@/server/models/workout';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { dailyMessagePrompt } from './prompts';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.7, model: "gemini-2.0-flash" });

export const dailyMessageAgent = {
  invoke: async ({ user, context }: { user: UserWithProfile, context: { workout: WorkoutInstance } }): Promise<{ user: UserWithProfile, context: { workout: WorkoutInstance }, value: string }> => {
    const fitnessProfileSubstring = await new FitnessProfileContext().getContext(user);
    
    const dailyMessagePromptText = dailyMessagePrompt(user, fitnessProfileSubstring, context.workout);
    const dailyMessageResp = await llm.invoke(dailyMessagePromptText);
    const dailyMessageContent = typeof dailyMessageResp.content === 'string'
      ? dailyMessageResp.content
      : String(dailyMessageResp.content);
    
    return { user, context, value: dailyMessageContent };
  }
}