import { createFormattedMicrocycleAgent } from '../formatted/chain';
import { createMicrocycleMessageAgent } from '../message/chain';
import type { MicrocycleChainContext } from '../generation/types';
import type { MicrocycleAgentOutput, DayOverviews, MicrocycleAgentDeps } from '../../types';
import { DAY_NAMES } from '@/shared/utils/date';
import { createRunnableAgent } from '@/server/agents/base';

/**
 * Maps the structured days array to DayOverviews object
 * Days array is ordered: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
 */
const mapDaysArrayToDayOverviews = (days: string[]): DayOverviews => {
  if (days.length !== 7) {
    throw new Error(`Expected exactly 7 days, got ${days.length}`);
  }

  return {
    mondayOverview: days[0],
    tuesdayOverview: days[1],
    wednesdayOverview: days[2],
    thursdayOverview: days[3],
    fridayOverview: days[4],
    saturdayOverview: days[5],
    sundayOverview: days[6]
  };
};

/**
 * Validates that all 7 day strings are non-empty
 */
const validateDays = (days: string[]): boolean => {
  return days.length === 7 && days.every(day => day && day.trim().length > 0);
};

/**
 * Shared Post-Processing Chain
 *
 * Takes MicrocycleChainContext from any first step (generate or update) and:
 * 1. Generates formatted markdown (parallel with message)
 * 2. Generates SMS message (parallel with formatted)
 * 3. Validates all 7 days are present
 * 4. Transforms days array to DayOverviews object
 *
 * @param deps - Optional dependencies (config)
 * @param operationName - Name of the operation for logging (e.g., "generate", "update")
 * @returns Runnable that produces complete MicrocycleAgentOutput
 */
export const createMicrocyclePostProcessChain = (
  deps?: MicrocycleAgentDeps,
  operationName = 'microcycle'
) => {
  return createRunnableAgent<MicrocycleChainContext, MicrocycleAgentOutput>(async (input) => {
    const { weekNumber } = input;
    const MAX_RETRIES = 3;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[${operationName}] Retry attempt ${attempt}/${MAX_RETRIES} for week ${weekNumber}`);
        }

        // Step 1: Create formatted microcycle agent
        const formattedAgent = createFormattedMicrocycleAgent({
          operationName: `${operationName} formatted microcycle`,
          agentConfig: deps?.config
        });

        // Step 2: Create message agent
        const messageAgent = createMicrocycleMessageAgent({
          agentConfig: deps?.config,
          operationName: `${operationName} microcycle message`
        });

        // Execute parallel processing: formatted + message
        const [formatted, message] = await Promise.all([
          formattedAgent.invoke(input),
          messageAgent.invoke(input)
        ]);

        const result = {
          ...input,
          formatted,
          message
        };

        // Validate that all 7 days are present and non-empty
        if (!validateDays(result.microcycle.days)) {
          const emptyDayIndices = result.microcycle.days
            .map((day, index) => (!day || day.trim().length === 0) ? index : -1)
            .filter(index => index !== -1);

          const missingDays = emptyDayIndices.map(index => DAY_NAMES[index]);

          throw new Error(
            `Microcycle ${operationName} validation failed: Missing or empty days for ${missingDays.join(', ')}. ` +
            `Expected all 7 days to be present and non-empty.`
          );
        }

        // Map structured days array to DayOverviews object
        const dayOverviews = mapDaysArrayToDayOverviews(result.microcycle.days);

        console.log(`[${operationName}] Successfully generated day overviews, formatted markdown, and message for week ${weekNumber}${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);

        // Build output - include wasModified if present (from update operations)
        const output: MicrocycleAgentOutput = {
          dayOverviews,
          description: result.microcycle.overview,
          isDeload: result.microcycle.isDeload,
          formatted: result.formatted,
          message: result.message
        };

        // Propagate wasModified if present (only for update operations)
        if ('wasModified' in input && typeof (input as { wasModified?: boolean }).wasModified === 'boolean') {
          output.wasModified = (input as { wasModified: boolean }).wasModified;
        }

        // Propagate modifications if present (only for update operations when wasModified is true)
        if ('modifications' in input && typeof (input as { modifications?: string }).modifications === 'string') {
          output.modifications = (input as { modifications: string }).modifications;
        }

        return output;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[${operationName}] Attempt ${attempt}/${MAX_RETRIES} failed for week ${weekNumber}:`, lastError.message);

        // If this was the last attempt, throw the error
        if (attempt === MAX_RETRIES) {
          break;
        }

        // Otherwise, continue to next retry
      }
    }

    // All retries exhausted
    throw new Error(
      `Failed to ${operationName} microcycle pattern for week ${weekNumber} after ${MAX_RETRIES} attempts. ` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  });
};
