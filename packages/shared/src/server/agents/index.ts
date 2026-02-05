/**
 * Configurable Agent System
 *
 * A declarative, composable way to define AI agents.
 * This is the primary way to create agents in the codebase.
 *
 * @example
 * ```typescript
 * import { createAgent, AGENTS } from '@/server/agents';
 *
 * // Fetch definition from database
 * const definition = await agentDefinitionService.getDefinition(AGENTS.WORKOUT_MESSAGE);
 *
 * // Create agent with unified config
 * const myAgent = await createAgent({
 *   ...definition,
 *   schema: OutputSchema,
 * });
 *
 * // Invoke with runtime context
 * const result = await myAgent.invoke({
 *   message: 'Generate a workout message',
 *   context: [`<Profile>${profile}</Profile>`],
 * });
 * // result.response contains the schema-typed output
 * ```
 */

// ============================================
// Main Agent Factory
// ============================================
export { createAgent } from './createAgent';

// ============================================
// Agent IDs (use these in createAgent calls)
// ============================================
export { AGENTS, CONTEXT_IDS, PROMPT_ROLES } from './promptIds';
export type { AgentId, ContextId, PromptRole } from './promptIds';

// Legacy exports (deprecated)
export { PROMPT_IDS } from './promptIds';
export type { PromptId } from './promptIds';

// ============================================
// Model Initialization
// ============================================
export { initializeModel, initializeImageModel } from './models';
export type { ModelOptions, ImageModelConfig, ImageGenerationResult, InvokableModel } from './models';

// ============================================
// Types
// ============================================
export type {
  // Unified agent configuration
  AgentConfig,
  InvokeParams,

  // Base agent types
  LegacyAgentConfig,
  AgentDeps,
  Agent,
  ToolType,
  ToolResult,

  // Configurable agent types
  AgentDefinition,  // deprecated - use AgentConfig
  ModelConfig,      // deprecated - use AgentConfig
  ConfigurableAgent,
  SubAgentBatch,
  SubAgentEntry,
  SubAgentConfig,
  ModelId,

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
// Agent Config Resolution (deprecated - use AgentDefinitionService)
// ============================================
export { resolveAgentConfig, resolveAgentConfigs } from './resolveAgentConfig';
export type { ResolvedAgentConfig, ResolveAgentConfigOptions, AgentServices } from './resolveAgentConfig';

// ============================================
// Standalone helpers (re-exported from services for convenience)
// ============================================
export { getAgentServices, resetAgentServices } from '../services/domain/agentConfig/standalone';
