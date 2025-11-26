import { createRunnableAgent } from '@/server/agents/base';
import { RunnableSequence } from '@langchain/core/runnables';
import {
  MICROCYCLE_SYSTEM_PROMPT,
  createMicrocycleGenerationRunnable,
  createMicrocyclePostProcessChain,
} from '../../steps';
import type { MicrocycleGenerationInput, MicrocycleAgentOutput, MicrocycleAgentDeps } from '../../types';

/**
 * Microcycle Generate Agent Factory
 *
 * Generates weekly training patterns from a microcycle overview using a composable chain:
 * 1. Generate structured output with overview and days array (generate-specific step)
 * 2. Post-process: formatted markdown + SMS message + validation + transformation (shared step)
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 * Implements retry logic (max 3 attempts) with validation to ensure all 7 days are generated.
 * Structured output ensures reliable parsing without regex.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates microcycle day overviews, formatted markdown, and messages
 */
export const createMicrocycleGenerateAgent = (deps?: MicrocycleAgentDeps) => {
  return createRunnableAgent<MicrocycleGenerationInput, MicrocycleAgentOutput>(async (input) => {
    // Step 1: Create generation runnable (generate-specific)
    const microcycleGenerationRunnable = createMicrocycleGenerationRunnable({
      systemPrompt: MICROCYCLE_SYSTEM_PROMPT,
      agentConfig: {
        model: 'gpt-5.1'
      }
    });

    // Step 2: Create shared post-processing chain
    const postProcessChain = createMicrocyclePostProcessChain(deps, 'generate');

    // Compose the full chain: generation → post-processing
    const sequence = RunnableSequence.from([
      microcycleGenerationRunnable,
      postProcessChain
    ]);

    // Execute the chain
    return await sequence.invoke(input);
  });
};
