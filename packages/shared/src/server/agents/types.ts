import type { z, ZodSchema } from 'zod';
import type { StructuredToolInterface } from '@langchain/core/tools';

// ============================================
// Validation Types
// ============================================

/**
 * Standard validation result interface
 * All validate functions should return this shape
 */
export interface ValidationResult {
  /** Whether the output passed validation */
  isValid: boolean;
  /** Validation errors explaining what's wrong (used for retry feedback) */
  errors?: string[];
  /** The output that failed validation (for negative example in retry) */
  failedOutput?: unknown;
}

/**
 * Context for retry attempts with validation feedback
 * Used internally - passed to agent invoke on retries
 */
export interface RetryContext {
  /** Current attempt number (1-indexed) */
  attempt: number;
  /** Previous failed attempts with their outputs and errors */
  previousAttempts: Array<{
    output: unknown;
    errors: string[];
  }>;
}

// ============================================
// Base Agent Types (from base.ts)
// ============================================

/**
 * Configuration for agents
 */
export interface AgentConfig {
  model?: 'gpt-5-nano' | 'gpt-5-mini' | 'gemini-2.5-flash' | 'gpt-4o' | 'gemini-2.5-flash-lite' | 'gpt-5.1';
  temperature?: number;
  maxTokens?: number;
  verbose?: boolean;
}

/**
 * Standard agent interface - all agents should implement this
 * @template TInput - The input type for the agent
 * @template TOutput - The output type from the agent
 */
export interface Agent<TInput, TOutput> {
  invoke(input: TInput): Promise<TOutput>;
}

/**
 * Standard agent dependencies interface
 * All agent deps interfaces should extend this
 */
export interface AgentDeps {
  config?: AgentConfig;
}

/**
 * Tool types for contextual response generation
 * - 'query': User asked for information (e.g., "What's my workout?")
 * - 'action': User requested a change (e.g., "Record my injury")
 */
export type ToolType = 'query' | 'action';

/**
 * Standard tool result type
 * All tools called by agents should return this
 */
export interface ToolResult {
  /** Type of tool for contextual response generation */
  toolType: ToolType;
  /** Summary for the calling agent */
  response: string;
  /** SMS messages to send to user (optional) */
  messages?: string[];
}

// ============================================
// Configurable Agent Types
// ============================================

/**
 * Supported model identifiers
 */
export type ModelId =
  | 'gpt-5-nano'
  | 'gpt-5-mini'
  | 'gpt-5.1'
  | 'gpt-4o'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite';

/**
 * Database-loaded agent configuration
 * Returned by agentDefinitionService.getAgentDefinition()
 */
export interface DbAgentConfig {
  /** System prompt instructions */
  systemPrompt: string;
  /** Optional user prompt template */
  userPrompt: string | null;
  /** Model identifier (e.g., 'gpt-5-nano') */
  model: string;
  /** Maximum tokens for response */
  maxTokens: number;
  /** Temperature for generation (0-2) */
  temperature: number;
  /** Maximum iterations for tool loops */
  maxIterations: number;
  /** Maximum retry attempts on validation failure */
  maxRetries: number;
}

/**
 * Overrides for agentDefinitionService.getDefinition()
 * Combines DB field overrides + code-provided additions
 *
 * @example
 * ```typescript
 * const definition = await agentDefinitionService.getDefinition(AGENTS.CHAT_GENERATE, {
 *   tools: [...],        // Code-provided
 *   temperature: 0.5,    // Override DB value
 * });
 * const agent = createAgent(definition);
 * ```
 */
export interface AgentDefinitionOverrides<TSchema extends ZodSchema | undefined = undefined> {
  // DB field overrides (optional - use DB values if not provided)
  /** Override the model from database */
  model?: ModelId;
  /** Override the temperature from database */
  temperature?: number;
  /** Override the max tokens from database */
  maxTokens?: number;
  /** Override the max iterations from database */
  maxIterations?: number;
  /** Override the max retries from database */
  maxRetries?: number;

  // Code-provided additions
  /** LangChain tools available to this agent */
  tools?: StructuredToolInterface[];
  /** Zod schema for structured output */
  schema?: TSchema;
  /** SubAgents to execute after main agent */
  subAgents?: SubAgentBatch[];
  /** Validation function for the agent output */
  validate?: (result: unknown) => ValidationResult;
  /** Transform input string into user message */
  userPrompt?: (input: string) => string;
  /** Logging context for tracking validation failures */
  loggingContext?: AgentLoggingContext;
  /** Context messages to bake into the agent at creation time (for sub-agents) */
  context?: string[];
}

/**
 * Runtime parameters for agent invocation
 * These are passed to invoke() rather than createAgent()
 */
export interface InvokeParams {
  /** The user's input message */
  message?: string;
  /** Context messages injected between system and user prompts */
  context?: string[];
  /** Previous conversation messages (placed after context, before user prompt) */
  previousMessages?: Message[];
}

/**
 * The configurable agent interface
 * invoke accepts either InvokeParams object or a simple string for backward compatibility
 */
export interface ConfigurableAgent<TOutput> {
  /**
   * Invoke the agent with runtime parameters
   * @param params - InvokeParams object with message, context, previousMessages, OR a simple string (backward compat)
   * @param retryContext - Optional retry context with previous failed attempts (for internal retry handling)
   */
  invoke(params: InvokeParams | string, retryContext?: RetryContext): Promise<TOutput>;
  /** The agent's name for logging */
  name: string;
}

/**
 * Extended subAgent configuration with optional transform and condition
 *
 * NOTE: Validation is now on AgentDefinition, not SubAgentConfig.
 * When a sub-agent has validation, it handles retries internally via its own invoke().
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SubAgentConfig<TAgent extends ConfigurableAgent<any> = ConfigurableAgent<any>> {
  /** The subAgent to execute */
  agent: TAgent;
  /**
   * Transform main result to string input for this subAgent
   * @param mainResult - The main agent's result (stringified response)
   * @param parentInput - Optional: The original input passed to the parent agent
   */
  transform?: (mainResult: unknown, parentInput?: string) => string;
  /** Condition to run this subAgent (default: always run) */
  condition?: (mainResult: unknown) => boolean;
}

/**
 * SubAgent entry - either a bare agent or extended config
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubAgentEntry = ConfigurableAgent<any> | SubAgentConfig;

/**
 * SubAgent batch - agents within a batch run in parallel
 * Key becomes the property name in the result
 * Values can be bare agents or extended configs with transform/condition
 */
export type SubAgentBatch = Record<string, SubAgentEntry>;

/**
 * Agent definition - the declarative configuration
 *
 * Definitions must be resolved via agentDefinitionService.getDefinition() before
 * passing to createAgent(). This ensures all DB config is baked into the definition.
 *
 * For main agents: Use invoke(InvokeParams) to pass context and previousMessages at runtime.
 * For sub-agents: Use context property to bake in context at creation time (since sub-agents
 * receive input via transform functions, not direct invoke calls with InvokeParams).
 */
export interface AgentDefinition<TSchema extends ZodSchema | undefined = undefined> {
  /** Identifier for logging and debugging */
  name: string;

  // =========================================================================
  // Resolved DB configuration (from agentDefinitionService.getDefinition)
  // All values must be resolved before calling createAgent().
  // =========================================================================

  /**
   * System prompt instructions.
   * Required - must be resolved from agentDefinitionService.getDefinition()
   */
  systemPrompt: string;

  /**
   * User prompt template from database.
   * Prepended to the user's input message if provided.
   */
  dbUserPrompt?: string | null;

  /** Model identifier (resolved from DB or override) */
  model?: ModelId;

  /** Maximum tokens for response (resolved from DB or override) */
  maxTokens?: number;

  /** Temperature for generation (resolved from DB or override) */
  temperature?: number;

  /** Maximum iterations for tool loops (resolved from DB or override) */
  maxIterations?: number;

  /**
   * Maximum number of retry attempts if validation fails
   * Default: 1 (no retry - single attempt only)
   */
  maxRetries?: number;

  // =========================================================================
  // Code-provided configuration (from overrides or legacy pattern)
  // =========================================================================

  /**
   * Context messages to bake into the agent at creation time.
   * Use this for sub-agents that need fixed context.
   * For main agents, prefer passing context via invoke(InvokeParams).
   */
  context?: string[];

  /**
   * Optional transformer for the input string.
   * - If provided: transforms the input string into the user message
   * - If undefined: the input string IS the user message directly
   */
  userPrompt?: (input: string) => string;

  /** LangChain tools available to this agent */
  tools?: StructuredToolInterface[];

  /** Zod schema for structured output - if undefined, returns string */
  schema?: TSchema;

  /** SubAgents to execute after main agent - batches run sequentially, agents within batch run in parallel */
  subAgents?: SubAgentBatch[];

  /**
   * Validation for the agent output
   * If validation fails and maxRetries > 1, agent retries with error feedback in message history
   * The previous failed output and errors are automatically injected as negative examples
   */
  validate?: (result: unknown) => ValidationResult;

  /**
   * Optional logging context for tracking validation/chain failures
   * Callbacks are fire-and-forget (non-blocking)
   */
  loggingContext?: AgentLoggingContext;
}

/**
 * Model configuration options
 */
export interface ModelConfig {
  model?: ModelId;
  maxTokens?: number;
  temperature?: number;
  /** Max iterations for agentic tool loops (default: 5) */
  maxIterations?: number;
  verbose?: boolean;
}

/**
 * Infer output type from schema
 */
export type InferSchemaOutput<TSchema extends ZodSchema | undefined> =
  TSchema extends ZodSchema ? z.infer<TSchema> : string;

/**
 * Helper type to extract outputs from a SubAgentBatch
 */
type ExtractSubAgentOutputs<T extends SubAgentBatch> = {
  [K in keyof T]: T[K] extends ConfigurableAgent<infer O> ? O : never;
};

/**
 * Combined output from main agent + subAgents
 * Response contains main agent output, plus all subAgent outputs by key
 * For tool-based agents, also includes accumulated messages from tool execution
 */
export type AgentComposedOutput<
  TMainOutput,
  TSubAgents extends SubAgentBatch[] | undefined
> = TSubAgents extends SubAgentBatch[]
  ? { response: TMainOutput; messages?: string[] } & UnionToIntersection<ExtractSubAgentOutputs<TSubAgents[number]>>
  : { response: TMainOutput; messages?: string[] };

/**
 * Helper type to convert union to intersection
 */
type UnionToIntersection<U> =
  (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

/**
 * Message structure for LLM invocation
 */
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

/**
 * Tool call structure
 */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Tool result from execution
 */
export interface ToolExecutionResult {
  toolType?: 'query' | 'action';
  response: string;
  messages?: string[];
}

// ============================================
// Agent Logging Types
// ============================================

/**
 * Validation failure entry for logging
 */
export interface ValidationFailureEntry {
  attempt: number;
  errors: string[];
  durationMs: number;
}

/**
 * Chain failure entry for logging (all retries exhausted)
 */
export interface ChainFailureEntry {
  attempt: number;
  errors: string[];
  durationMs: number;
  totalAttempts: number;
}

/**
 * Context for agent logging - tracks validation failures and chain failures
 *
 * This allows services to inject logging callbacks into agents without
 * the agent needing to know about the logging infrastructure.
 */
export interface AgentLoggingContext {
  /** User ID for correlation */
  userId: string;
  /** Unique ID to correlate related events (e.g., retry attempts) */
  chainId: string;
  /** Entity identifier (e.g., 'workout:structured') */
  entityId: string;
  /** Model being used */
  model: string;
  /** Called on each validation failure (fire-and-forget) */
  onValidationFailure?: (entry: ValidationFailureEntry) => void;
  /** Called when all retries are exhausted (fire-and-forget) */
  onChainFailure?: (entry: ChainFailureEntry) => void;
}
