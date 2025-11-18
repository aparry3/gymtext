import { createMicrocycleGenerateAgent } from './operations/generate/chain';

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
export const createMicrocycleAgent = createMicrocycleGenerateAgent;