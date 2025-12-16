import type { z, ZodSchema } from 'zod';
import type { StructuredToolInterface } from '@langchain/core/tools';

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
 * invoke always takes a string - the string is either used directly as the user message
 * or passed to userPrompt transformer if defined
 */
export interface ConfigurableAgent<TOutput> {
  invoke(input: string): Promise<TOutput>;
  /** The agent's name for logging */
  name: string;
}

/**
 * SubAgent batch - agents within a batch run in parallel
 * Key becomes the property name in the result
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubAgentBatch = Record<string, ConfigurableAgent<any>>;

/**
 * Agent definition - the declarative configuration
 */
export interface AgentDefinition<TSchema extends ZodSchema | undefined = undefined> {
  /** Identifier for logging and debugging */
  name: string;

  /** Static system prompt instructions */
  systemPrompt: string;

  /**
   * Optional transformer for the input string.
   * - If provided: transforms the input string into the user message
   * - If undefined: the input string IS the user message directly
   */
  userPrompt?: (input: string) => string;

  /** Context messages injected between system and user prompts (pre-computed strings) */
  context?: string[];

  /** Previous conversation messages (placed after context, before user prompt) */
  previousMessages?: Message[];

  /** LangChain tools available to this agent */
  tools?: StructuredToolInterface[];

  /** Zod schema for structured output - if undefined, returns string */
  schema?: TSchema;

  /** SubAgents to execute after main agent - batches run sequentially, agents within batch run in parallel */
  subAgents?: SubAgentBatch[];
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
