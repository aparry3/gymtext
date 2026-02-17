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
// Agent Constants (use these in createAgent calls)
// ============================================
export { AGENTS } from './constants';
export type { AgentId } from './constants';

// ============================================
// Model Initialization
// ============================================
export { initializeModel, initializeImageModel } from './models';
export type { ModelOptions, ImageModelConfig, ImageGenerationResult, InvokableModel } from './models';

// ============================================
// Types
// ============================================
export type {
  // Base agent types
  AgentConfig,
  AgentDeps,
  Agent,
  ToolType,
  ToolResult,

  // Configurable agent types
  AgentDefinition,
  ModelConfig,
  ConfigurableAgent,
  SubAgentBatch,
  SubAgentEntry,
  SubAgentConfig,
  ModelId,

  // Database config types
  DbAgentConfig,
  InvokeParams,

  // Output types
  InferSchemaOutput,
  AgentComposedOutput,

  // Message types
  Message,
  ToolCall,
  ToolExecutionResult,

  // Logging types
  AgentLogEntry,
} from './types';

// ============================================
// Utilities
// ============================================
export { buildMessages, buildLoopContinuationMessage } from './utils';
export type { BuildMessagesConfig } from './utils';

export { resolveTemplate } from './templateUtils/templateEngine';

// ============================================
// Executors (for advanced use cases)
// ============================================
export { executeToolLoop } from './toolExecutor';
export type { ToolLoopConfig, ToolLoopResult, ToolCallRecord } from './toolExecutor';

// ============================================
// Tool System
// ============================================
export { ToolRegistry } from './tools';
export type { ToolDefinition, ToolExecutionContext } from './tools';

// ============================================
// Agent Runner
// ============================================
export { createSimpleAgentRunner } from './runner';
export type {
  SimpleAgentRunnerDeps,
  SimpleAgentRunnerInstance,
  SimpleAgentInvokeParams,
} from './runner';
