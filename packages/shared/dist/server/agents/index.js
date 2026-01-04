/**
 * Configurable Agent System
 *
 * A declarative, composable way to define AI agents.
 * This is the primary way to create agents in the codebase.
 *
 * @example
 * ```typescript
 * import { createAgent } from '@/server/agents';
 *
 * const myAgent = createAgent({
 *   name: 'my-agent',
 *   systemPrompt: 'You are a helpful assistant.',
 *   userPrompt: (input) => `Help with: ${input}`,
 *   schema: OutputSchema,
 * }, {
 *   model: 'gpt-5-nano',
 *   maxTokens: 4000,
 * });
 *
 * const result = await myAgent.invoke('something');
 * // result.response contains the schema-typed output
 * ```
 */
// ============================================
// Main Agent Factory
// ============================================
export { createAgent } from './createAgent';
// ============================================
// Prompt IDs (use these in createAgent calls)
// ============================================
export { PROMPT_IDS, CONTEXT_IDS, PROMPT_ROLES } from './promptIds';
// ============================================
// Model Initialization
// ============================================
export { initializeModel, initializeImageModel } from './models';
// ============================================
// Utilities
// ============================================
export { buildMessages, buildLoopContinuationMessage } from './utils';
// ============================================
// Executors (for advanced use cases)
// ============================================
export { executeSubAgents } from './subAgentExecutor';
export { executeToolLoop } from './toolExecutor';
