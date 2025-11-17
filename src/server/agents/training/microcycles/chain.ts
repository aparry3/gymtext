import { createRunnableAgent } from '@/server/agents/base';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import {
  MICROCYCLE_SYSTEM_PROMPT,
  MicrocycleChainContext,
  createMicrocycleGenerationRunnable,
  createMicrocycleMessageAgent,
} from './steps';
import { createFormattedMicrocycleAgent } from './steps/formatted';
import type { MicrocycleGenerationInput, MicrocycleAgentOutput, MicrocycleAgentDeps, DayOverviews } from './types';

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
 * Microcycle Pattern Agent Factory
 *
 * Generates weekly training patterns with progressive overload using a composable chain:
 * 1. Generate structured output with overview and days array
 * 2. Generate formatted markdown for display (parallel with step 3)
 * 3. Generate SMS-formatted weekly message (parallel with step 2)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 * Implements retry logic (max 3 attempts) with validation to ensure all 7 days are generated.
 * Structured output ensures reliable parsing without regex.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates microcycle day overviews, formatted markdown, and messages
 */
export const createMicrocycleAgent = (deps?: MicrocycleAgentDeps) => {
  return createRunnableAgent<MicrocycleGenerationInput, MicrocycleAgentOutput>(async (input) => {
    const { weekNumber } = input;
    const MAX_RETRIES = 3;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[Microcycle] Retry attempt ${attempt}/${MAX_RETRIES} for week ${weekNumber}`);
        }

        // Step 1: Create long-form runnable (with structured output)
        const microcycleGenerationRunnable = createMicrocycleGenerationRunnable({
          systemPrompt: MICROCYCLE_SYSTEM_PROMPT,
          agentConfig: deps?.config
        });

        // Step 2: Create formatted microcycle agent
        const formattedAgent = createFormattedMicrocycleAgent({
          operationName: 'generate formatted microcycle',
          agentConfig: deps?.config
        });

        // Step 3: Create message agent
        const messageAgent = createMicrocycleMessageAgent({
          agentConfig: deps?.config,
          operationName: 'generate microcycle message'
        });

        // Compose the chain: structured generation → parallel (formatted + message)
        const sequence = RunnableSequence.from([
          microcycleGenerationRunnable,
          RunnablePassthrough.assign({
            formatted: formattedAgent,
            message: messageAgent
          })
        ]);

        // Execute the chain
        const result:  MicrocycleChainContext & {formatted: string, message: string} = await sequence.invoke(input);

        // Validate that all 7 days are present and non-empty
        if (!validateDays(result.microcycle.days)) {
          const emptyDayIndices = result.microcycle.days
            .map((day, index) => (!day || day.trim().length === 0) ? index : -1)
            .filter(index => index !== -1);

          const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const missingDays = emptyDayIndices.map(index => dayNames[index]);

          throw new Error(
            `Microcycle generation validation failed: Missing or empty days for ${missingDays.join(', ')}. ` +
            `Expected all 7 days to be present and non-empty.`
          );
        }

        // Map structured days array to DayOverviews object
        const dayOverviews = mapDaysArrayToDayOverviews(result.microcycle.days);

        console.log(`[Microcycle] Successfully generated day overviews, formatted markdown, and message for week ${weekNumber}${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);

        return {
          dayOverviews,
          description: result.microcycle.overview,
          isDeload: result.microcycle.isDeload,
          formatted: result.formatted,
          message: result.message
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[Microcycle] Attempt ${attempt}/${MAX_RETRIES} failed for week ${weekNumber}:`, lastError.message);

        // If this was the last attempt, throw the error
        if (attempt === MAX_RETRIES) {
          break;
        }

        // Otherwise, continue to next retry
      }
    }

    // All retries exhausted
    throw new Error(
      `Failed to generate microcycle pattern for week ${weekNumber} after ${MAX_RETRIES} attempts. ` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  });
};