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
export { AGENTS, PROMPT_IDS, CONTEXT_IDS, PROMPT_ROLES } from './constants';
export type { AgentId, PromptId, ContextId, PromptRole } from './constants';

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
  AgentDefinitionOverrides,
  ModelConfig,
  ConfigurableAgent,
  SubAgentBatch,
  SubAgentEntry,
  SubAgentConfig,
  ModelId,

  // Database config types
  DbAgentConfig,
  InvokeParams,

  // Validation types
  ValidationResult,
  RetryContext,

  // Output types
  InferSchemaOutput,
  AgentComposedOutput,

  // Message types
  Message,
  ToolCall,
  ToolExecutionResult,

  // Logging types
  AgentLoggingContext,
  ValidationFailureEntry,
  ChainFailureEntry,
} from './types';

// ============================================
// Utilities
// ============================================
export { buildMessages, buildLoopContinuationMessage } from './utils';
export type { BuildMessagesConfig } from './utils';

// ============================================
// Executors (for advanced use cases)
// ============================================
export { executeSubAgents } from './subAgentExecutor';
export type { SubAgentExecutorConfig } from './subAgentExecutor';

export { executeToolLoop } from './toolExecutor';
export type { ToolLoopConfig, ToolLoopResult, ToolCallRecord } from './toolExecutor';

// ============================================
// Tool System
// ============================================
export { ToolRegistry } from './tools';
export type { ToolDefinition, ToolExecutionContext } from './tools';

// ============================================
// Declarative Engine
// ============================================
export { resolveInputMapping, evaluateRules, resolveTemplate } from './declarative';
export type { InputMapping, ValidationRule as DeclarativeValidationRule, MappingContext } from './declarative';

// ============================================
// Agent Runner
// ============================================
export { createAgentRunner } from './runner';
export type { AgentRunnerInstance, AgentRunnerDeps, AgentInvokeParams } from './runner';

// ============================================
// Context Registry
// ============================================
export { ContextRegistry, registerAllContextProviders } from './context';
export type { ContextProvider, ContextRegistryDeps } from './context';
