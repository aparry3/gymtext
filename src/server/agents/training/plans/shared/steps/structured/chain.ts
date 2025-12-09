import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { PlanStructureSchema } from '@/server/agents/training/schemas';
import { STRUCTURED_PLAN_SYSTEM_PROMPT, structuredPlanUserPrompt } from './prompt';
import type { StructuredPlanConfig, StructuredPlanInput, StructuredPlanOutput } from './types';

/**
 * Structured Plan Agent Factory
 *
 * Parses long-form fitness plan descriptions into structured PlanStructure objects.
 * Uses LLM with structured output for reliable parsing.
 *
 * @param config - Static configuration for the agent
 * @returns Agent that produces structured plan data
 */
export const createStructuredPlanAgent = (config?: StructuredPlanConfig) => {
  // Initialize model WITH schema for structured output
  const model = initializeModel(PlanStructureSchema, {
    model: 'gpt-5-nano',
    ...config?.agentConfig
  });

  return createRunnableAgent<StructuredPlanInput, StructuredPlanOutput>(async (input) => {
    const { fitnessPlan } = input;

    const userPrompt = structuredPlanUserPrompt(fitnessPlan);

    const structure = await model.invoke([
      { role: 'system', content: STRUCTURED_PLAN_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]) as StructuredPlanOutput;

    console.log(
      `[${config?.operationName || 'structured plan'}] Parsed plan "${structure.name || 'Untitled'}" with ${structure.scheduleTemplate.length} scheduled days, ${structure.frequencyPerWeek} sessions/week`
    );

    return structure;
  });
};
