/**
 * Agent System
 *
 * Database-driven agents executed via simpleAgentRunner.
 * Agent definitions are stored in the agent_definitions table.
 * Services invoke agents via agentRunner.invoke(agentId, params).
 */

// ============================================
// Agent Constants
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
  ModelId,

  // Message types
  Message,
  ToolCall,
  ToolExecutionResult,

  // Example types
  AgentExample,

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
