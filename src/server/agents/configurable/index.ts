/**
 * Configurable Agent System
 *
 * A declarative, composable way to define AI agents.
 *
 * @example
 * ```typescript
 * import { createAgent } from '@/server/agents/configurable';
 *
 * const myAgent = createAgent({
 *   name: 'my-agent',
 *   systemPrompt: 'You are a helpful assistant.',
 *   userPrompt: (input) => `Help with: ${input.task}`,
 *   schema: OutputSchema,
 * }, {
 *   model: 'gpt-5-nano',
 *   maxTokens: 4000,
 * });
 *
 * const result = await myAgent.invoke({ task: 'something' });
 * // result.response contains the schema-typed output
 * ```
 */

export { createAgent } from './createAgent';

export type {
  // Core types
  AgentDefinition,
  ModelConfig,
  ConfigurableAgent,
  SubAgentBatch,
  SubAgentEntry,
  SubAgentConfig,
  ModelId,

  // Output types
  InferSchemaOutput,
  AgentComposedOutput,

  // Message types
  Message,
  ToolCall,
  ToolExecutionResult,
} from './types';

// Utilities
export { buildMessages } from './utils';
export type { BuildMessagesConfig } from './utils';

// Executors (for advanced use cases)
export { executeSubAgents } from './subAgentExecutor';
export type { SubAgentExecutorConfig } from './subAgentExecutor';

export { executeToolLoop } from './toolExecutor';
export type { ToolLoopConfig, ToolLoopResult, ToolCallRecord } from './toolExecutor';
