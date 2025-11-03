import { z } from 'zod';
import { MesocycleOverview, Mesocycle } from '@/server/models/fitnessPlan';
import { MicrocyclePattern } from '@/server/models/microcycle';
import { _MicrocyclePatternSchema } from '@/server/models/microcycle/schema';
import { MICROCYCLE_SYSTEM_PROMPT, microcycleUserPrompt, microcycleStructuredPrompt } from './prompts';
import { initializeModel, createRunnableAgent } from '@/server/agents/base';
import type { MicrocyclePatternInput, MicrocyclePatternOutput, MicrocyclePatternAgentDeps } from './types';

// Schema for step 1: long-form microcycle description and reasoning
const LongFormMicrocycleSchema = z.object({
  description: z.string().describe("Long-form narrative description of the weekly microcycle"),
  reasoning: z.string().describe("Explanation of how and why the week is structured")
});

/**
 * @deprecated Legacy interface - use MicrocyclePatternInput instead
 */
export interface MicrocyclePatternContext {
  mesocycle: MesocycleOverview;
  weekNumber: number;
  programType: string;
  notes?: string | null;
}

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
    const { mesocycle, weekNumber, programType, notes } = input;

    try {
      // Step 1: Generate long-form description and reasoning
      const longFormModel = initializeModel(LongFormMicrocycleSchema, deps?.config);
      const longFormResult = await longFormModel.invoke([
        { role: 'system', content: MICROCYCLE_SYSTEM_PROMPT },
        { role: 'user', content: microcycleUserPrompt(mesocycle, weekNumber, programType, notes) }
      ]);

      // Step 2: Convert to structured JSON
      const structuredModel = initializeModel(_MicrocyclePatternSchema, deps?.config);
      const step2Prompt = microcycleStructuredPrompt(longFormResult.description, weekNumber);
      const structuredResult = await structuredModel.invoke(step2Prompt);

      return structuredResult as MicrocyclePattern;
    } catch (error) {
      console.error('Error generating microcycle pattern:', error);
      // Return a basic fallback pattern if generation fails
      return generateFallbackPattern(weekNumber, programType, mesocycle);
    }
  });
};

/**
 * @deprecated Legacy export for backward compatibility - use createMicrocyclePatternAgent instead
 */
export const generateMicrocyclePattern = async (context: {mesocycle: MesocycleOverview | Mesocycle, weekNumber: number, programType: string, notes?: string | null}): Promise<MicrocyclePattern> => {
  const agent = createMicrocyclePatternAgent();
  return agent.invoke(context);
};

function generateFallbackPattern(
  weekNumber: number,
  programType: string,
  mesocycle: MesocycleOverview | Mesocycle
): MicrocyclePattern {
  // Handle both old and new mesocycle formats
  const isNewFormat = 'durationWeeks' in mesocycle;
  const weeks = isNewFormat ? (mesocycle as Mesocycle).durationWeeks : (mesocycle as MesocycleOverview).weeks;
  const isDeloadWeek = !isNewFormat && (mesocycle as MesocycleOverview).deload && weekNumber === weeks;
  const load = isDeloadWeek ? 'light' : 'moderate';
  const weekIndex = weekNumber - 1; // Convert 1-based weekNumber to 0-based weekIndex

  const patterns: Record<string, MicrocyclePattern> = {
    strength: {
      weekIndex,
      days: [
        { day: 'MONDAY', theme: 'Lower Body', load },
        { day: 'TUESDAY', theme: 'Upper Push', load },
        { day: 'WEDNESDAY', theme: 'Rest' },
        { day: 'THURSDAY', theme: 'Lower Body', load },
        { day: 'FRIDAY', theme: 'Upper Pull', load },
        { day: 'SATURDAY', theme: 'Active Recovery', load: 'light' },
        { day: 'SUNDAY', theme: 'Rest' },
      ],
    },
    endurance: {
      weekIndex,
      days: [
        { day: 'MONDAY', theme: 'Easy Run', load: 'light' },
        { day: 'TUESDAY', theme: 'Interval Training', load },
        { day: 'WEDNESDAY', theme: 'Recovery', load: 'light' },
        { day: 'THURSDAY', theme: 'Tempo Run', load },
        { day: 'FRIDAY', theme: 'Rest' },
        { day: 'SATURDAY', theme: 'Long Run', load },
        { day: 'SUNDAY', theme: 'Recovery', load: 'light' },
      ],
    },
    hybrid: {
      weekIndex,
      days: [
        { day: 'MONDAY', theme: 'Strength Training', load },
        { day: 'TUESDAY', theme: 'Cardio', load },
        { day: 'WEDNESDAY', theme: 'Active Recovery', load: 'light' },
        { day: 'THURSDAY', theme: 'Strength Training', load },
        { day: 'FRIDAY', theme: 'HIIT', load },
        { day: 'SATURDAY', theme: 'Long Cardio', load: 'light' },
        { day: 'SUNDAY', theme: 'Rest' },
      ],
    },
  };

  // Default pattern if program type not found
  const defaultPattern: MicrocyclePattern = {
    weekIndex,
    days: [
      { day: 'MONDAY', theme: 'Training Day 1', load },
      { day: 'TUESDAY', theme: 'Training Day 2', load },
      { day: 'WEDNESDAY', theme: 'Rest' },
      { day: 'THURSDAY', theme: 'Training Day 3', load },
      { day: 'FRIDAY', theme: 'Training Day 4', load },
      { day: 'SATURDAY', theme: 'Active Recovery', load: 'light' },
      { day: 'SUNDAY', theme: 'Rest' },
    ],
  };

  return patterns[programType] || defaultPattern;
}