import { createRunnableAgent } from '@/server/agents/base';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import {
  MICROCYCLE_SYSTEM_PROMPT,
  createLongFormMicrocycleRunnable,
  createDaysExtractionAgent,
  createMicrocycleMessageAgent,
} from './steps';
import { createFormattedMicrocycleAgent } from './steps/formatted';
import { FormattedMicrocycleSchema } from '@/server/models/microcycle/schema';
import type { MicrocyclePatternInput, MicrocyclePatternOutput, MicrocyclePatternAgentDeps } from './types';

/**
 * Validates that all 7 day overviews are present and non-empty
 */
const validateDayOverviews = (dayOverviews: Record<string, unknown>): boolean => {
  const requiredDays = [
    'mondayOverview',
    'tuesdayOverview',
    'wednesdayOverview',
    'thursdayOverview',
    'fridayOverview',
    'saturdayOverview',
    'sundayOverview'
  ];

  return requiredDays.every(day => {
    const value = dayOverviews[day];
    return value && typeof value === 'string' && value.trim().length > 0;
  });
};

/**
 * Microcycle Pattern Agent Factory
 *
 * Generates weekly training patterns with progressive overload using a composable chain:
 * 1. Generate long-form description and reasoning
 * 2. Extract day overviews from description (parallel with steps 3 and 4)
 * 3. Generate formatted markdown for display (parallel with steps 2 and 4)
 * 4. Generate SMS-formatted weekly message (parallel with steps 2 and 3)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 * Implements retry logic (max 3 attempts) with validation to ensure all 7 days are generated.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates microcycle day overviews, formatted markdown, and messages
 */
export const createMicrocyclePatternAgent = (deps?: MicrocyclePatternAgentDeps) => {
  return createRunnableAgent<MicrocyclePatternInput, MicrocyclePatternOutput>(async (input) => {
    const { weekNumber } = input;
    const MAX_RETRIES = 3;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[Microcycle] Retry attempt ${attempt}/${MAX_RETRIES} for week ${weekNumber}`);
        }

        // Step 1: Create long-form runnable (generates its own prompt internally)
        const longFormRunnable = createLongFormMicrocycleRunnable({
          systemPrompt: MICROCYCLE_SYSTEM_PROMPT,
          agentConfig: deps?.config
        });

        // Step 2a: Create days extraction agent (also detects isDeload)
        const daysAgent = createDaysExtractionAgent({
          agentConfig: deps?.config,
          operationName: 'extract day overviews'
        });

        // Step 2b: Create formatted microcycle agent
        const formattedAgent = createFormattedMicrocycleAgent({
          schema: FormattedMicrocycleSchema,
          operationName: 'generate formatted microcycle',
          agentConfig: deps?.config
        });

        // Step 2c: Create message agent
        const messageAgent = createMicrocycleMessageAgent({
          agentConfig: deps?.config,
          operationName: 'generate microcycle message'
        });

        // Compose the chain: long-form → parallel (days + formatted + message)
        const sequence = RunnableSequence.from([
          longFormRunnable,
          RunnablePassthrough.assign({
            daysExtraction: daysAgent,
            formatted: formattedAgent,
            message: messageAgent
          })
        ]);

        // Execute the chain
        const result = await sequence.invoke(input);

        // Validate that all 7 days are present and non-empty
        if (!validateDayOverviews(result.daysExtraction)) {
          const missingDays = [
            'mondayOverview',
            'tuesdayOverview',
            'wednesdayOverview',
            'thursdayOverview',
            'fridayOverview',
            'saturdayOverview',
            'sundayOverview'
          ].filter(day => !result.daysExtraction[day] || result.daysExtraction[day].trim().length === 0);

          throw new Error(
            `Microcycle generation validation failed: Missing or empty day overviews for ${missingDays.join(', ')}. ` +
            `Expected all 7 days to be present and non-empty.`
          );
        }

        console.log(`[Microcycle] Successfully generated day overviews, formatted markdown, and message for week ${weekNumber}${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);

        return {
          dayOverviews: result.daysExtraction,
          description: result.longFormMicrocycle,
          isDeload: result.daysExtraction.isDeload,
          formatted: result.formatted.formatted, // Extract formatted string from schema object
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