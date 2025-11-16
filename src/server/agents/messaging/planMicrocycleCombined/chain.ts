import { z } from 'zod';
import { initializeModel, createRunnableAgent } from '@/server/agents/base';
import { planMicrocycleCombinedPrompt } from './prompts';
import type { PlanMicrocycleCombinedInput, PlanMicrocycleCombinedOutput, PlanMicrocycleCombinedAgentDeps } from './types';

// Schema for the output
const PlanMicrocycleCombinedSchema = z.object({
  message: z.string().describe("Combined plan overview + first week breakdown SMS message with blank lines between days (under 500 chars)")
});

/**
 * Plan + Microcycle Combined Message Agent Factory
 *
 * Generates a two-paragraph SMS message combining:
 * 1. Plan completion announcement + brief overview
 * 2. First week training breakdown with:
 *    - "Let's take a look at your first week"
 *    - One-sentence week summary
 *    - Daily breakdown with blank lines between each day
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates combined plan+microcycle message
 */
export const createPlanMicrocycleCombinedAgent = (deps?: PlanMicrocycleCombinedAgentDeps) => {
  return createRunnableAgent<PlanMicrocycleCombinedInput, PlanMicrocycleCombinedOutput>(async (input) => {
    const { user, plan, microcycle } = input;

    // Initialize model with structured output
    const model = initializeModel(PlanMicrocycleCombinedSchema, deps?.config);

    // Generate prompt
    const prompt = planMicrocycleCombinedPrompt(user, plan, microcycle);

    // Invoke model
    const result = await model.invoke(prompt);

    return {
      message: result.message
    };
  });
};