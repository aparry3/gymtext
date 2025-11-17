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
 * Microcycle Pattern Agent Factory
 *
 * Generates weekly training patterns with progressive overload using a composable chain:
 * 1. Generate long-form description and reasoning
 * 2. Extract day overviews from description (parallel with steps 3 and 4)
 * 3. Generate formatted markdown for display (parallel with steps 2 and 4)
 * 4. Generate SMS-formatted weekly message (parallel with steps 2 and 3)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates microcycle day overviews, formatted markdown, and messages
 */
export const createMicrocyclePatternAgent = (deps?: MicrocyclePatternAgentDeps) => {
  return createRunnableAgent<MicrocyclePatternInput, MicrocyclePatternOutput>(async (input) => {
    const { weekNumber } = input;

    try {
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

      console.log(`[Microcycle] Generated day overviews, formatted markdown, and message for week ${weekNumber}`);

      return {
        dayOverviews: result.daysExtraction,
        description: result.longFormMicrocycle.description,
        isDeload: result.daysExtraction.isDeload,
        formatted: result.formatted.formatted, // Extract formatted string from schema object
        message: result.message
      };
    } catch (error) {
      console.error('Error generating microcycle pattern:', error);
      throw error;
    }
  });
};