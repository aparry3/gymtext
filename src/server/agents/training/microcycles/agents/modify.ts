import { createAgent, type SubAgentBatch } from '@/server/agents/configurable';
import { MicrocycleStructureSchema } from '@/server/agents/training/schemas';
import { DAY_NAMES } from '@/shared/utils/date';
import {
  MICROCYCLE_MODIFY_SYSTEM_PROMPT,
  modifyMicrocycleUserPrompt,
  ModifyMicrocycleOutputSchema,
  buildFormattedMicrocycleSystemPrompt,
  createFormattedMicrocycleUserPrompt,
  MICROCYCLE_MESSAGE_SYSTEM_PROMPT,
  microcycleMessageUserPrompt,
  STRUCTURED_MICROCYCLE_SYSTEM_PROMPT,
  structuredMicrocycleUserPrompt,
  type MicrocycleGenerationOutput,
} from '../prompts';
import type {
  ModifyMicrocycleInput,
  ModifyMicrocycleOutput,
  ModifyMicrocycleAgentDeps,
} from '../types';

const MAX_RETRIES = 3;

/**
 * Validates that all 7 day strings are non-empty
 */
const validateDays = (days: string[]): boolean => {
  return days.length === 7 && days.every(day => day && day.trim().length > 0);
};

/**
 * Helper to extract microcycle data from the modify response JSON string
 */
const extractMicrocycleData = (jsonString: string): MicrocycleGenerationOutput & { absoluteWeek?: number } => {
  try {
    const parsed = JSON.parse(jsonString);
    return {
      overview: parsed.overview || '',
      days: parsed.days || [],
      isDeload: parsed.isDeload || false,
      absoluteWeek: parsed.absoluteWeek,
    };
  } catch {
    return {
      overview: jsonString,
      days: [],
      isDeload: false,
    };
  }
};

/**
 * Modify an existing microcycle based on user constraints
 *
 * Uses the configurable agent pattern:
 * 1. Main agent generates modified microcycle with structured output
 * 2. SubAgents run in parallel: formatted, message, structure (extracting data from JSON)
 *
 * Includes retry logic (MAX_RETRIES = 3) with validation to ensure all 7 days are present.
 *
 * @param input - Microcycle modification input (user, currentMicrocycle, changeRequest, currentDayOfWeek, weekNumber)
 * @param deps - Optional dependencies (config)
 * @returns ModifyMicrocycleOutput with response, formatted, message, and structure
 */
export const modifyMicrocycle = async (
  input: ModifyMicrocycleInput,
  deps?: ModifyMicrocycleAgentDeps
): Promise<ModifyMicrocycleOutput> => {
  const { weekNumber } = input;

  // SubAgents that extract data from structured JSON response
  const subAgents: SubAgentBatch[] = [
    {
      formatted: createAgent({
        name: 'formatted-modify',
        systemPrompt: buildFormattedMicrocycleSystemPrompt(),
        userPrompt: (jsonInput: string) => {
          const data = extractMicrocycleData(jsonInput);
          return createFormattedMicrocycleUserPrompt(data, weekNumber);
        },
      }, deps?.config),

      message: createAgent({
        name: 'message-modify',
        systemPrompt: MICROCYCLE_MESSAGE_SYSTEM_PROMPT,
        userPrompt: (jsonInput: string) => {
          const data = extractMicrocycleData(jsonInput);
          return microcycleMessageUserPrompt(data);
        },
      }, { model: 'gpt-5-nano', ...deps?.config }),

      structure: createAgent({
        name: 'structure-modify',
        systemPrompt: STRUCTURED_MICROCYCLE_SYSTEM_PROMPT,
        userPrompt: (jsonInput: string) => {
          const data = extractMicrocycleData(jsonInput);
          return structuredMicrocycleUserPrompt(
            data.overview,
            data.days,
            weekNumber,
            data.isDeload
          );
        },
        schema: MicrocycleStructureSchema,
      }, { model: 'gpt-5-nano', maxTokens: 32000, ...deps?.config }),
    },
  ];

  // Build the user prompt using the existing function
  const userPromptContent = modifyMicrocycleUserPrompt({
    fitnessProfile: input.user.profile || '',
    currentMicrocycle: input.currentMicrocycle,
    changeRequest: input.changeRequest,
    currentDayOfWeek: input.currentDayOfWeek,
  });

  const agent = createAgent({
    name: 'microcycle-modify',
    systemPrompt: MICROCYCLE_MODIFY_SYSTEM_PROMPT,
    schema: ModifyMicrocycleOutputSchema,
    subAgents,
  }, { model: 'gpt-5.1', ...deps?.config });

  // Execute with retry logic
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[microcycle-modify] Retry attempt ${attempt}/${MAX_RETRIES} for week ${weekNumber}`);
      }

      const result = await agent.invoke(userPromptContent) as ModifyMicrocycleOutput;

      // Validate that all 7 days are present and non-empty
      if (!validateDays(result.response.days)) {
        const emptyDayIndices = result.response.days
          .map((day, index) => (!day || day.trim().length === 0) ? index : -1)
          .filter(index => index !== -1);

        const missingDays = emptyDayIndices.map(index => DAY_NAMES[index]);

        throw new Error(
          `Microcycle modify validation failed: Missing or empty days for ${missingDays.join(', ')}. ` +
          `Expected all 7 days to be present and non-empty.`
        );
      }

      console.log(`[microcycle-modify] Successfully modified day overviews, formatted markdown, and message for week ${weekNumber}${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[microcycle-modify] Attempt ${attempt}/${MAX_RETRIES} failed for week ${weekNumber}:`, lastError.message);

      // If this was the last attempt, break out
      if (attempt === MAX_RETRIES) {
        break;
      }
    }
  }

  // All retries exhausted
  throw new Error(
    `Failed to modify microcycle pattern for week ${weekNumber} after ${MAX_RETRIES} attempts. ` +
    `Last error: ${lastError?.message || 'Unknown error'}`
  );
};

/**
 * @deprecated Use modifyMicrocycle() instead
 * Factory function maintained for backward compatibility
 * Maps new output format to legacy format expected by services
 */
export const createModifyMicrocycleAgent = (deps?: ModifyMicrocycleAgentDeps) => ({
  name: 'microcycle-modify',
  invoke: async (input: ModifyMicrocycleInput) => {
    const result = await modifyMicrocycle(input, deps);
    // Map new output format to legacy format
    return {
      days: result.response.days,
      description: result.response.overview,
      isDeload: result.response.isDeload,
      formatted: result.formatted,
      message: result.message,
      structure: result.structure,
      wasModified: result.response.wasModified,
      modifications: result.response.modifications,
    };
  },
});
