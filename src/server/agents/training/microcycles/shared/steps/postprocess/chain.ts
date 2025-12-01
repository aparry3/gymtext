import { createFormattedMicrocycleAgent } from '../formatted/chain';
import { createMicrocycleMessageAgent } from '../message/chain';
import type { MicrocycleChainContext } from '../../types';
import type { MicrocycleAgentOutput, MicrocycleAgentDeps } from '../../../types';
import { DAY_NAMES } from '@/shared/utils/date';
import { createRunnableAgent } from '@/server/agents/base';

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
    const { absoluteWeek } = input;
    const MAX_RETRIES = 3;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[${operationName}] Retry attempt ${attempt}/${MAX_RETRIES} for week ${absoluteWeek}`);
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

        console.log(`[${operationName}] Successfully generated day overviews, formatted markdown, and message for week ${absoluteWeek}${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);

        // Build output - include wasModified if present (from update operations)
        const output: MicrocycleAgentOutput = {
          days: result.microcycle.days,
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
        console.error(`[${operationName}] Attempt ${attempt}/${MAX_RETRIES} failed for week ${absoluteWeek}:`, lastError.message);

        // If this was the last attempt, throw the error
        if (attempt === MAX_RETRIES) {
          break;
        }

        // Otherwise, continue to next retry
      }
    }

    // All retries exhausted
    throw new Error(
      `Failed to ${operationName} microcycle pattern for week ${absoluteWeek} after ${MAX_RETRIES} attempts. ` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  });
};
