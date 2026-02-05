/**
 * Create Agent From Registry
 *
 * Bridge between the declarative registry system and the existing createAgent factory.
 * Resolves an AgentConfig from the registry, looks up tools/validators/callbacks,
 * and produces a ConfigurableAgent.
 *
 * This is the primary entry point for creating agents in the new architecture.
 * Services call this instead of manually wiring createAgent + tool factories.
 *
 * @example
 * ```typescript
 * const agent = await createAgentFromRegistry('chat:generate', {
 *   context: agentContext,
 *   previousMessages,
 *   toolContext: { userId, message, timezone, onSendMessage },
 * });
 *
 * const result = await agent.invoke(message);
 * // Callbacks are NOT auto-executed - call executeAgentCallbacks separately
 * ```
 */
import type { ZodSchema } from 'zod';
import { createAgent } from '../createAgent';
import type { ConfigurableAgent, ModelConfig, Message, SubAgentBatch, AgentLoggingContext } from '../types';
import { agentRegistry } from './agentRegistry';
import { toolRegistry, type ToolContext } from './toolRegistry';
import { callbackRegistry } from './callbackRegistry';
import type { CallbackConfig, CallbackContext } from './callbackRegistry';

/**
 * Options for creating an agent from registry config.
 * Provides the runtime values that can't be in static config.
 */
export interface CreateFromRegistryOptions {
  /** Pre-computed context strings (from ContextService) */
  context?: string[];
  /** Conversation history */
  previousMessages?: Message[];
  /** Runtime context for tool binding */
  toolContext?: ToolContext;
  /** Zod schema for structured output (registered schemas could be added later) */
  schema?: ZodSchema;
  /** Override sub-agents with pre-built agents (for complex composition) */
  subAgentOverrides?: SubAgentBatch[];
  /** Logging context for validation tracking */
  loggingContext?: AgentLoggingContext;
  /** Override system prompt (bypasses both config and DB) */
  systemPrompt?: string;
  /** Override user prompt transformer */
  userPrompt?: (input: string) => string;
}

/**
 * Result wrapper that includes both the agent and its callback configs,
 * so callers can execute callbacks after invocation.
 */
export interface RegistryAgent<TOutput = unknown> {
  /** The configured agent, ready to invoke */
  agent: ConfigurableAgent<TOutput>;
  /** Callback configs from the agent registry (for post-execution) */
  callbacks: CallbackConfig[];
  /** The agent config name */
  name: string;
}

/**
 * Create an agent from a registry config.
 *
 * Resolves the agent's tools from ToolRegistry, validator from AgentRegistry,
 * and returns both the agent and its callback configs.
 *
 * @param name - Agent name (must be registered in AgentRegistry)
 * @param options - Runtime options (context, tools context, schema, etc.)
 * @returns RegistryAgent with agent instance and callback configs
 */
export async function createAgentFromRegistry<TOutput = unknown>(
  name: string,
  options: CreateFromRegistryOptions = {}
): Promise<RegistryAgent<TOutput>> {
  const config = agentRegistry.get(name);
  if (!config) {
    throw new Error(
      `Agent "${name}" not found in registry. ` +
      `Available agents: ${agentRegistry.listAgents().join(', ') || '(none)'}`
    );
  }

  // Resolve tools from ToolRegistry
  let tools;
  if (config.tools && config.tools.length > 0) {
    if (!options.toolContext) {
      throw new Error(
        `Agent "${name}" has tools [${config.tools.join(', ')}] but no toolContext was provided`
      );
    }
    tools = toolRegistry.createTools(config.tools, options.toolContext);
  }

  // Resolve validator from AgentRegistry
  let validate;
  if (config.validatorName) {
    const validator = agentRegistry.getValidator(config.validatorName);
    if (!validator) {
      throw new Error(
        `Validator "${config.validatorName}" not found for agent "${name}"`
      );
    }
    validate = validator.validate;
  }

  // Build model config
  const modelConfig: ModelConfig = {};
  if (config.model) modelConfig.model = config.model;
  if (config.maxTokens) modelConfig.maxTokens = config.maxTokens;
  if (config.temperature) modelConfig.temperature = config.temperature;
  if (config.maxIterations) modelConfig.maxIterations = config.maxIterations;

  // Create agent using existing factory
  const agent = await createAgent(
    {
      name: config.name,
      systemPrompt: options.systemPrompt ?? config.systemPrompt,
      userPrompt: options.userPrompt,
      context: options.context,
      previousMessages: options.previousMessages,
      tools,
      schema: options.schema,
      subAgents: options.subAgentOverrides,
      validate,
      maxRetries: config.maxRetries,
      loggingContext: options.loggingContext,
    },
    Object.keys(modelConfig).length > 0 ? modelConfig : undefined
  );

  return {
    agent: agent as ConfigurableAgent<TOutput>,
    callbacks: config.callbacks ?? [],
    name: config.name,
  };
}

/**
 * Execute callbacks for an agent result.
 *
 * Call this after agent.invoke() to run deterministic post-agent side effects.
 * Callbacks are resolved from the CallbackRegistry by name.
 *
 * @param callbacks - Callback configs from RegistryAgent
 * @param agentResult - The result from agent.invoke()
 * @param context - Additional context for callbacks
 * @param succeeded - Whether the agent succeeded
 */
export async function executeAgentCallbacks(
  callbacks: CallbackConfig[],
  agentResult: unknown,
  context: Omit<CallbackContext, 'agentResult'>,
  succeeded: boolean = true
): Promise<void> {
  if (callbacks.length === 0) return;

  const fullContext: CallbackContext = {
    ...context,
    agentResult,
  };

  await callbackRegistry.executeCallbacks(callbacks, fullContext, succeeded);
}
