import { initializeModel, createRunnableAgent } from '@/server/agents/base';
import { PLAN_READY_SYSTEM_PROMPT, planReadyUserPrompt } from './prompts';
import type { PlanMicrocycleCombinedInput, PlanMicrocycleCombinedOutput, PlanMicrocycleCombinedAgentDeps } from './types';

/**
 * Plan + Microcycle Combined Message Agent Factory
 *
 * Creates a "plan ready" SMS message that combines:
 * 1. Friendly confirmation that the plan is ready
 * 2. Plain-English summary of the fitness plan
 * 3. Day-by-day preview of remaining days in the current week
 *
 * Uses separate system and user prompts for better control over tone and structure.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates combined plan+week one onboarding message
 */
export const createPlanMicrocycleCombinedAgent = (deps?: PlanMicrocycleCombinedAgentDeps) => {
  return createRunnableAgent<PlanMicrocycleCombinedInput, PlanMicrocycleCombinedOutput>(async (input) => {
    const { fitnessPlan, weekOne, currentWeekday } = input;

    // Initialize model without schema for plain text output
    const model = initializeModel(undefined, deps?.config);

    // Build user prompt from input parameters
    const userPrompt = planReadyUserPrompt({ fitnessPlan, weekOne, currentWeekday });

    // Construct messages array with system and user prompts
    const messages = [
      {
        role: 'system',
        content: PLAN_READY_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userPrompt,
      }
    ];

    // Invoke model with messages array
    const result = await model.invoke(messages);

    return result;
  });
};