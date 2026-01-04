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
export { createAgent } from './createAgent';
export { PROMPT_IDS, CONTEXT_IDS, PROMPT_ROLES } from './promptIds';
export type { PromptId, ContextId, PromptRole } from './promptIds';
export { initializeModel, initializeImageModel } from './models';
export type { ModelOptions, ImageModelConfig, ImageGenerationResult, InvokableModel } from './models';
export type { AgentConfig, AgentDeps, Agent, ToolType, ToolResult, AgentDefinition, ModelConfig, ConfigurableAgent, SubAgentBatch, SubAgentEntry, SubAgentConfig, ModelId, InferSchemaOutput, AgentComposedOutput, Message, ToolCall, ToolExecutionResult, } from './types';
export { buildMessages, buildLoopContinuationMessage } from './utils';
export type { BuildMessagesConfig } from './utils';
export { executeSubAgents } from './subAgentExecutor';
export type { SubAgentExecutorConfig } from './subAgentExecutor';
export { executeToolLoop } from './toolExecutor';
export type { ToolLoopConfig, ToolLoopResult, ToolCallRecord } from './toolExecutor';
//# sourceMappingURL=index.d.ts.map