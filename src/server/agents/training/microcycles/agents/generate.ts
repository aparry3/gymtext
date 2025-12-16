import { createAgent, type SubAgentBatch } from '@/server/agents/configurable';
import { DAY_NAMES } from '@/shared/utils/date';
import {
  MICROCYCLE_SYSTEM_PROMPT,
  MicrocycleGenerationOutputSchema,
} from '../prompts';
import { createMicrocycleMessageAgent } from './message';
import { createStructuredMicrocycleAgent } from './structured';
import type {
  MicrocycleGenerateInput,
  MicrocycleGenerateOutput,
  MicrocycleGenerateAgentDeps,
} from '../types';

const MAX_RETRIES = 3;

/**
 * Validates that all 7 day strings are non-empty
 */
const validateDays = (days: string[]): boolean => {
  return days.length === 7 && days.every(day => day && day.trim().length > 0);
};

/**
 * Generate a weekly microcycle training pattern
 *
 * Uses the configurable agent pattern:
 * 1. Main agent generates structured output with overview, isDeload, and days array
 * 2. SubAgents run in parallel: message, structure
 *
 * Includes retry logic (MAX_RETRIES = 3) with validation to ensure all 7 days are generated.
 *
 * @param input - Microcycle generation input (planText, userProfile, absoluteWeek, isDeload)
 * @param deps - Optional dependencies (config)
 * @returns MicrocycleGenerateOutput with response, message, and structure
 */
export const generateMicrocycle = async (
  input: MicrocycleGenerateInput,
  deps?: MicrocycleGenerateAgentDeps
): Promise<MicrocycleGenerateOutput> => {
  const { absoluteWeek } = input;

  // Create subAgents - all in one batch for parallel execution
  const subAgents: SubAgentBatch[] = [
    {
      message: createMicrocycleMessageAgent({
        operationName: 'generate',
        agentConfig: deps?.config,
      }),
      structure: createStructuredMicrocycleAgent({
        operationName: 'generate',
        agentConfig: deps?.config,
      }),
    },
  ];

  const agent = createAgent({
    name: 'microcycle-generate',
    systemPrompt: MICROCYCLE_SYSTEM_PROMPT,
    context: [
      `<FitnessPlan>${input.planText}</FitnessPlan>`,
      `<ClientProfile>${input.userProfile || 'No additional user notes'}</ClientProfile>`,
      `<Context>Current Week: ${absoluteWeek}</Context>`,
    ],
    schema: MicrocycleGenerationOutputSchema,
    subAgents,
  }, { model: 'gpt-5.1', ...deps?.config });

  // Execute with retry logic
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[microcycle-generate] Retry attempt ${attempt}/${MAX_RETRIES} for week ${absoluteWeek}`);
      }

      const result = await agent.invoke(
        `Generate the Weekly Training Pattern for **Week ${absoluteWeek}**.`
      ) as MicrocycleGenerateOutput;

      // Validate that all 7 days are present and non-empty
      if (!validateDays(result.response.days)) {
        const emptyDayIndices = result.response.days
          .map((day, index) => (!day || day.trim().length === 0) ? index : -1)
          .filter(index => index !== -1);

        const missingDays = emptyDayIndices.map(index => DAY_NAMES[index]);

        throw new Error(
          `Microcycle generate validation failed: Missing or empty days for ${missingDays.join(', ')}. ` +
          `Expected all 7 days to be present and non-empty.`
        );
      }

      console.log(`[microcycle-generate] Successfully generated day overviews and message for week ${absoluteWeek}${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[microcycle-generate] Attempt ${attempt}/${MAX_RETRIES} failed for week ${absoluteWeek}:`, lastError.message);

      // If this was the last attempt, break out
      if (attempt === MAX_RETRIES) {
        break;
      }
    }
  }

  // All retries exhausted
  throw new Error(
    `Failed to generate microcycle pattern for week ${absoluteWeek} after ${MAX_RETRIES} attempts. ` +
    `Last error: ${lastError?.message || 'Unknown error'}`
  );
};

/**
 * @deprecated Use generateMicrocycle() instead
 * Factory function maintained for backward compatibility
 * Maps new output format to legacy format expected by services
 */
export const createMicrocycleGenerateAgent = (deps?: MicrocycleGenerateAgentDeps) => ({
  name: 'microcycle-generate',
  invoke: async (input: MicrocycleGenerateInput) => {
    const result = await generateMicrocycle(input, deps);
    // Map new output format to legacy format
    return {
      days: result.response.days,
      description: result.response.overview,
      isDeload: result.response.isDeload,
      message: result.message,
      structure: result.structure,
    };
  },
});
