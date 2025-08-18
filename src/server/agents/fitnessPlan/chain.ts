import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlanModel, FitnessPlanOverview } from '@/server/models/fitnessPlan';
import { outlinePrompt } from '@/server/agents/fitnessPlan/prompts';
import { AIContextService } from '@/server/services/aiContextService';
import { FitnessProfileRepository } from '@/server/repositories/fitnessProfileRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.3, model: "gemini-2.5-flash" });

export const fitnessPlanAgent = {
  invoke: async ({ user, context }: { user: UserWithProfile, context?: object }): Promise<{ user: UserWithProfile, context?: object, program: FitnessPlanOverview }> => {
    // Use new AIContextService for profile context
    const profileRepo = new FitnessProfileRepository(postgresDb);
    const profile = await profileRepo.getProfile(user.id);
    const aiContextService = new AIContextService();
    const aiContext = aiContextService.buildAIContext(profile);
    
    // Use the prose representation for the prompt
    const prompt = outlinePrompt(user, aiContext.prose);
    const structuredModel = llm.withStructuredOutput(FitnessPlanModel.schema);
    
    const result = await structuredModel.invoke(prompt);
    return { user, context, program: result as unknown as FitnessPlanOverview };
}};