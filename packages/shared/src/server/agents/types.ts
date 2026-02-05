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
 * @deprecated Use AgentConfig instead (the unified type)
 */
export interface LegacyAgentConfig {
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
 * The configurable agent interface
 * invoke takes InvokeParams with message and runtime context
 * Also supports legacy string input for backward compatibility
 */
export interface ConfigurableAgent<TOutput> {
  /**
   * Invoke the agent with parameters
   * @param paramsOrMessage - The invocation parameters (message, context, previousMessages) or legacy string input
   * @param retryContext - Optional retry context with previous failed attempts (for internal retry handling)
   */
  invoke(paramsOrMessage: InvokeParams | string, retryContext?: RetryContext): Promise<TOutput>;
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
  /**
   * Callback fired immediately when this sub-agent completes (fire-and-forget).
   * Use this for progressive message delivery - the callback runs in parallel
   * with other sub-agents and doesn't block the overall chain.
   * @param result - The sub-agent's result
   */
  onComplete?: (result: unknown) => void | Promise<void>;
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
 * Unified agent configuration
 *
 * Contains everything needed to create an agent:
 * - Definition: name, prompts (static configuration)
 * - Model config: model, temperature, maxTokens, etc.
 * - Capabilities: tools, schema, subAgents (static)
 * - Behavior: validation, retry, logging
 */
export interface AgentConfig<TSchema extends ZodSchema | undefined = undefined> {
  // ========================================
  // Definition (from DB via AgentDefinitionService)
  // ========================================

  /** Identifier for logging and debugging */
  name: string;

  /**
   * Static system prompt instructions.
   * REQUIRED - must be provided explicitly (no DB fallback in createAgent).
   * Use agentDefinitionService.getDefinition() to fetch from database.
   */
  systemPrompt: string;

  /**
   * Optional user prompt - either:
   * - A string from the database (prepended to input)
   * - A transformer function (transforms input to user message)
   */
  userPrompt?: string | ((input: string) => string) | null;

  // ========================================
  // Model Configuration
  // ========================================

  /** Model to use (default: gpt-5-nano) */
  model?: ModelId;

  /** Temperature for sampling (default: 1) */
  temperature?: number;

  /** Max tokens for response (default: 16000) */
  maxTokens?: number;

  /** Max iterations for agentic tool loops (default: 5) */
  maxIterations?: number;

  // ========================================
  // Static Capabilities
  // ========================================

  /** LangChain tools available to this agent */
  tools?: StructuredToolInterface[];

  /** Zod schema for structured output - if undefined, returns string */
  schema?: TSchema;

  /** SubAgents to execute after main agent - batches run sequentially, agents within batch run in parallel */
  subAgents?: SubAgentBatch[];

  // ========================================
  // Behavior
  // ========================================

  /**
   * Validation for the agent output
   * If validation fails and maxRetries > 1, agent retries with error feedback in message history
   * The previous failed output and errors are automatically injected as negative examples
   */
  validate?: (result: unknown) => ValidationResult;

  /**
   * Maximum number of retry attempts if validation fails
   * Default: 1 (no retry - single attempt only)
   */
  maxRetries?: number;

  /**
   * Optional logging context for tracking validation/chain failures
   * Callbacks are fire-and-forget (non-blocking)
   */
  loggingContext?: AgentLoggingContext;
}

/**
 * Parameters for invoking an agent
 * Contains runtime data that changes per invocation
 */
export interface InvokeParams {
  /** The user input / message */
  message: string;
  /** Context messages injected between system and user prompts (pre-computed strings) */
  context?: string[];
  /** Previous conversation messages (placed after context, before user prompt) */
  previousMessages?: Message[];
}

/**
 * @deprecated Use AgentConfig directly - definition and model config are now unified
 */
export interface AgentDefinition<TSchema extends ZodSchema | undefined = undefined> {
  /** Identifier for logging and debugging */
  name: string;
  systemPrompt: string;
  userPrompt?: (input: string) => string;
  dbUserPrompt?: string | null;
  context?: string[];
  previousMessages?: Message[];
  tools?: StructuredToolInterface[];
  schema?: TSchema;
  subAgents?: SubAgentBatch[];
  validate?: (result: unknown) => ValidationResult;
  maxRetries?: number;
  loggingContext?: AgentLoggingContext;
}

/**
 * @deprecated Use AgentConfig directly - definition and model config are now unified
 */
export interface ModelConfig {
  model?: ModelId;
  maxTokens?: number;
  temperature?: number;
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
