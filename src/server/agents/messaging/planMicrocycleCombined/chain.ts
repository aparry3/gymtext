import { initializeModel, createRunnableAgent } from '@/server/agents/base';
import { planMicrocycleCombinedPrompt } from './prompts';
import type { PlanMicrocycleCombinedInput, PlanMicrocycleCombinedOutput, PlanMicrocycleCombinedAgentDeps } from './types';

/**
 * Plan + Microcycle Combined Message Agent Factory
 *
 * Combines pre-generated plan and microcycle SMS messages into a cohesive onboarding message:
 * 1. "Just finished putting your plan together" + plan message content
 * 2. "Let's take a look at your first week" + microcycle message content
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that combines pre-generated messages into onboarding message string
 */
export const createPlanMicrocycleCombinedAgent = (deps?: PlanMicrocycleCombinedAgentDeps) => {
  return createRunnableAgent<PlanMicrocycleCombinedInput, PlanMicrocycleCombinedOutput>(async (input) => {
    const { planMessage, microcycleMessage } = input;

    // Initialize model without schema for plain text output
    const model = initializeModel(undefined, deps?.config);

    // Generate prompt from pre-written messages
    const prompt = planMicrocycleCombinedPrompt(planMessage, microcycleMessage);

    // Invoke model
    const result = await model.invoke(prompt);

    return result;
  });
};