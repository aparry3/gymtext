import { z } from 'zod';
import { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlanModel, FitnessPlanOverview } from '@/server/models/fitnessPlan';
import { longFormPrompt, structuredPrompt } from '@/server/agents/fitnessPlan/prompts';
import { initializeModel } from '@/server/agents/base';

/**
 * Interface for fitness profile context service (DI)
 */
export interface FitnessProfileContextService {
  getContext: (user: UserWithProfile) => Promise<string>;
}

/**
 * Dependencies for FitnessPlan Agent (DI)
 */
export interface FitnessPlanAgentDeps {
  contextService: FitnessProfileContextService;
}

// Schema for step 1: long-form plan and reasoning
const LongFormSchema = z.object({
  plan: z.string().describe("Long-form description of the fitness plan"),
  reasoning: z.string().describe("Detailed explanation of all decisions made")
});

/**
 * Creates a fitness plan agent with injected dependencies
 *
 * @param deps - Dependencies including context service
 * @returns Function that generates fitness plans
 */
export const createFitnessPlanAgent = (deps: FitnessPlanAgentDeps) => {
  return async (user: UserWithProfile): Promise<FitnessPlanOverview> => {
    const fitnessProfile = await deps.contextService.getContext(user);

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
  };
};

/**
 * Legacy export for backward compatibility
 * @deprecated Use createFitnessPlanAgent with dependency injection instead
 */
export const generateFitnessPlan = async (): Promise<FitnessPlanOverview> => {
  throw new Error('generateFitnessPlan is deprecated. Use createFitnessPlanAgent with dependencies injection instead.');
};