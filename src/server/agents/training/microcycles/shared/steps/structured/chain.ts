import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { MicrocycleStructureSchema } from '@/server/agents/training/schemas';
import { STRUCTURED_MICROCYCLE_SYSTEM_PROMPT, structuredMicrocycleUserPrompt } from './prompt';
import type { StructuredMicrocycleConfig, StructuredMicrocycleInput, StructuredMicrocycleOutput } from './types';

/**
 * Structured Microcycle Agent Factory
 *
 * Parses microcycle overview and day strings into structured MicrocycleStructure objects.
 * Uses LLM with structured output for reliable parsing.
 *
 * @param config - Static configuration for the agent
 * @returns Agent that produces structured microcycle data
 */
export const createStructuredMicrocycleAgent = (config?: StructuredMicrocycleConfig) => {
  // Initialize model WITH schema for structured output
  const model = initializeModel(MicrocycleStructureSchema, {
    model: 'gpt-5-nano',
    ...config?.agentConfig
  });

  return createRunnableAgent<StructuredMicrocycleInput, StructuredMicrocycleOutput>(async (input) => {
    const { overview, days, absoluteWeek, isDeload } = input;

    const userPrompt = structuredMicrocycleUserPrompt(overview, days, absoluteWeek, isDeload);

    const structure = await model.invoke([
      { role: 'system', content: STRUCTURED_MICROCYCLE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]) as StructuredMicrocycleOutput;

    console.log(
      `[${config?.operationName || 'structured microcycle'}] Parsed week ${absoluteWeek} with ${structure.days.length} days, phase: ${structure.phase || 'unknown'}`
    );

    return structure;
  });
};
