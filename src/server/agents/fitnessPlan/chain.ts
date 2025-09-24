import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlanModel, FitnessPlanOverview } from '@/server/models/fitnessPlan';
import { outlinePrompt } from '@/server/agents/fitnessPlan/prompts';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.3, model: "gemini-2.0-flash" });

export const generateFitnessPlan = async (user: UserWithProfile, config?: object): Promise<FitnessPlanOverview> => {
    const fitnessProfileContextService = new FitnessProfileContext();
    const fitnessProfile = await fitnessProfileContextService.getContext(user);
    
    const prompt = outlinePrompt(user, fitnessProfile);
    const structuredModel = llm.withStructuredOutput(FitnessPlanModel.schema);
    
    const result = await structuredModel.invoke(prompt);
    return result as unknown as FitnessPlanOverview;
}