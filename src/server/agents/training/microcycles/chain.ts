import { _StructuredMicrocycleSchema, MicrocyclePattern } from '@/server/models/microcycle/schema';
import { createRunnableAgent } from '@/server/agents/base';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import {
  MICROCYCLE_SYSTEM_PROMPT,
  microcycleUserPrompt,
  createLongFormMicrocycleRunnable,
  createStructuredMicrocycleAgent,
  createMicrocycleMessageAgent,
} from './steps';
import type { MicrocyclePatternInput, MicrocyclePatternOutput, MicrocyclePatternAgentDeps } from './types';

/**
 * Microcycle Pattern Agent Factory
 *
 * Generates weekly training patterns with progressive overload using a composable chain:
 * 1. Generate long-form description and reasoning
 * 2. Convert to structured MicrocyclePattern (parallel with step 3)
 * 3. Generate SMS-formatted weekly message (parallel with step 2)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates microcycle patterns and messages
 */
export const createMicrocyclePatternAgent = (deps?: MicrocyclePatternAgentDeps) => {
  return createRunnableAgent<MicrocyclePatternInput, MicrocyclePatternOutput>(async (input) => {
    const { mesocycle, weekIndex, programType, notes } = input;

    try {
      // Build user prompt for step 1
      const userPrompt = microcycleUserPrompt({ mesocycle, weekIndex, programType, notes });

      // Step 1: Create long-form runnable
      const longFormRunnable = createLongFormMicrocycleRunnable({
        systemPrompt: MICROCYCLE_SYSTEM_PROMPT,
        agentConfig: deps?.config
      });

      // Step 2: Create structured microcycle agent (without weekIndex - we'll set it deterministically)
      const StructuredMicrocycleSchemaWithoutWeekIndex = _StructuredMicrocycleSchema.omit({ weekIndex: true });
      const structuredAgent = createStructuredMicrocycleAgent<Omit<MicrocyclePattern, 'weekIndex'>>({
        schema: StructuredMicrocycleSchemaWithoutWeekIndex,
        agentConfig: deps?.config,
        operationName: 'generate microcycle pattern'
      });

      // Step 3: Create message agent
      const messageAgent = createMicrocycleMessageAgent({
        agentConfig: deps?.config,
        operationName: 'generate microcycle message'
      });

      // Compose the chain: long-form → parallel (structured + message)
      const sequence = RunnableSequence.from([
        longFormRunnable,
        RunnablePassthrough.assign({
          pattern: structuredAgent,
          message: messageAgent
        })
      ]);

      // Execute the chain
      const result = await sequence.invoke({ ...input, prompt: userPrompt });

      console.log(`[Microcycle] Generated pattern and message for week ${weekIndex + 1}`);

      return {
        pattern: result.pattern,
        message: result.message
      };
    } catch (error) {
      console.error('Error generating microcycle pattern:', error);
      throw error;
    }
  });
};