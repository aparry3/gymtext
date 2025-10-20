import { z } from 'zod';
import { initializeModel, createRunnableAgent } from '@/server/agents/base';
import { planSummaryPrompt } from './prompts';
import type { PlanSummaryInput, PlanSummaryOutput, PlanSummaryAgentDeps } from './types';

// Schema for the output
const PlanSummarySchema = z.object({
  messages: z.array(z.string()).describe("Array of SMS messages (each under 160 chars)")
});

/**
 * Plan Summary Agent Factory
 *
 * Generates SMS-friendly fitness plan summaries split into multiple messages.
 * Each message is under 160 characters for optimal SMS delivery.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates plan summary messages
 */
export const createPlanSummaryAgent = (deps?: PlanSummaryAgentDeps) => {
  return createRunnableAgent<PlanSummaryInput, PlanSummaryOutput>(async (input) => {
    const { user, plan, previousMessages } = input;

    // Initialize model with structured output
    const model = initializeModel(PlanSummarySchema, deps?.config);

    // Generate prompt
    const prompt = planSummaryPrompt(user, plan, previousMessages);

    // Invoke model
    const result = await model.invoke(prompt);

    return {
      messages: result.messages
    };
  });
};

/**
 * @deprecated Legacy export for backward compatibility - use createPlanSummaryAgent instead
 */
export const planSummaryMessageAgent = async (
  input: PlanSummaryInput
): Promise<PlanSummaryOutput> => {
  const agent = createPlanSummaryAgent();
  return agent.invoke(input);
};
