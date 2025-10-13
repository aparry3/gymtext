import { z } from 'zod';
import { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlanModel, FitnessPlanOverview } from '@/server/models/fitnessPlan';
import { longFormPrompt, structuredPrompt } from '@/server/agents/fitnessPlan/prompts';
import { FitnessProfileContext } from '@/server/services/context/fitnessProfileContext';
import { initializeModel } from '@/server/agents/base';

// Schema for step 1: long-form plan and reasoning
const LongFormSchema = z.object({
  plan: z.string().describe("Long-form description of the fitness plan"),
  reasoning: z.string().describe("Detailed explanation of all decisions made")
});

export const generateFitnessPlan = async (user: UserWithProfile): Promise<FitnessPlanOverview> => {
    const fitnessProfileContextService = new FitnessProfileContext();
    const fitnessProfile = await fitnessProfileContextService.getContext(user);

    // Step 1: Generate long-form plan and reasoning
    const longFormModel = initializeModel(LongFormSchema);
    const step1Prompt = longFormPrompt(user, fitnessProfile);
    const longFormResult = await longFormModel.invoke(step1Prompt);

    // Step 2: Convert to structured JSON with mesocycles
    const structuredModel = initializeModel(FitnessPlanModel.schema);
    const step2Prompt = structuredPrompt(longFormResult.plan, user, fitnessProfile);
    const structuredResult = await structuredModel.invoke(step2Prompt);

    // Combine structured result with plan description and reasoning
    const finalResult: FitnessPlanOverview = {
      ...structuredResult,
      planDescription: longFormResult.plan,
      reasoning: longFormResult.reasoning,
    };

    return finalResult as FitnessPlanOverview;
}