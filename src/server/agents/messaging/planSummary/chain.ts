import { z } from 'zod';
import { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlan } from '@/server/models/fitnessPlan';
import { Message } from '@/server/models/conversation';
import { initializeModel } from '@/server/agents/base';
import { planSummaryPrompt } from './prompts';

// Schema for the output
const PlanSummarySchema = z.object({
  messages: z.array(z.string()).describe("Array of SMS messages (each under 160 chars)")
});

export interface PlanSummaryInput {
  user: UserWithProfile;
  plan: FitnessPlan;
  previousMessages?: Message[];
}

export interface PlanSummaryOutput {
  messages: string[];
}

export const planSummaryMessageAgent = async (
  input: PlanSummaryInput
): Promise<PlanSummaryOutput> => {
  const { user, plan, previousMessages } = input;

  // Initialize model with structured output
  const model = initializeModel(PlanSummarySchema);

  // Generate prompt
  const prompt = planSummaryPrompt(user, plan, previousMessages);

  // Invoke model
  const result = await model.invoke(prompt);

  return {
    messages: result.messages
  };
};
