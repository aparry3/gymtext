import { z } from 'zod';
import { _StructuredMicrocycleSchema, MicrocyclePattern } from '@/server/models/microcycle/schema';
import { MICROCYCLE_SYSTEM_PROMPT, microcycleUserPrompt, MICROCYCLE_STRUCTURED_SYSTEM_PROMPT, microcycleStructuredUserPrompt } from './prompts';
import { initializeModel, createRunnableAgent } from '@/server/agents/base';
import type { MicrocyclePatternInput, MicrocyclePatternOutput, MicrocyclePatternAgentDeps } from './types';

// Schema for step 1: long-form microcycle description and reasoning
const LongFormMicrocycleSchema = z.object({
  description: z.string().describe("Long-form narrative description of the weekly microcycle"),
  reasoning: z.string().describe("Explanation of how and why the week is structured")
});

/**
 * Microcycle Pattern Agent Factory
 *
 * Generates weekly training patterns with progressive overload.
 * Uses a two-step process:
 * 1. Generate long-form description and reasoning
 * 2. Convert description to structured MicrocyclePattern
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates microcycle patterns
 */
export const createMicrocyclePatternAgent = (deps?: MicrocyclePatternAgentDeps) => {
  return createRunnableAgent<MicrocyclePatternInput, MicrocyclePatternOutput>(async (input) => {
    const { mesocycle, weekIndex, programType, notes } = input;

    try {
      // Step 1: Generate long-form description and reasoning
      const longFormModel = initializeModel(LongFormMicrocycleSchema, deps?.config);
      const longFormResult = await longFormModel.invoke([
        { role: 'system', content: MICROCYCLE_SYSTEM_PROMPT },
        { role: 'user', content: microcycleUserPrompt({ mesocycle, weekIndex, programType, notes }) }
      ]);

      // Step 2: Convert to structured JSON (without weekIndex - we'll set it deterministically)
      const StructuredMicrocycleSchemaWithoutWeekIndex = _StructuredMicrocycleSchema.omit({ weekIndex: true });
      const structuredModel = initializeModel(StructuredMicrocycleSchemaWithoutWeekIndex, deps?.config);
      const structuredResult = await structuredModel.invoke([
        { role: 'system', content: MICROCYCLE_STRUCTURED_SYSTEM_PROMPT },
        { role: 'user', content: microcycleStructuredUserPrompt(longFormResult.description) }
      ]);

      // Deterministically set weekIndex from input (agent doesn't generate this)
      const finalResult: MicrocyclePattern = {
        ...structuredResult,
        weekIndex // 0-based index
      };

      return finalResult;
    } catch (error) {
      console.error('Error generating microcycle pattern:', error);    
      throw error;
    }
  });
};