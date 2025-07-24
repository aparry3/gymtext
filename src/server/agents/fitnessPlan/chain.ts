import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlanModel, FitnessPlanOverview } from '@/server/models/fitnessPlan';
import { outlinePrompt } from '@/server/agents/fitnessPlan/prompts';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.3, model: "gemini-2.0-flash" });

export const fitnessPlanAgent = {
  invoke: async ({ user, context }: { user: UserWithProfile, context?: object }): Promise<{ user: UserWithProfile, context?: object, program: FitnessPlanOverview }> => {
    const fitnessProfileContextService = new FitnessProfileContext(user);
    const fitnessProfile = await fitnessProfileContextService.getContext();
    
    const prompt = outlinePrompt(user, fitnessProfile);
    const structuredModel = llm.withStructuredOutput(FitnessPlanModel.schema);
    
    const result = await structuredModel.invoke(prompt);
    return { user, context, program: result as unknown as FitnessPlanOverview };
}};