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
 */
export interface ConfigurableAgent<TInput, TOutput> {
  invoke(input: TInput): Promise<TOutput>;
  /** The agent's name for logging */
  name: string;
}

/**
 * SubAgent batch - agents within a batch run in parallel
 * Key becomes the property name in the result
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubAgentBatch = Record<string, ConfigurableAgent<any, any>>;

/**
 * Agent definition - the declarative configuration
 */
export interface AgentDefinition<
  TInput,
  TSchema extends ZodSchema | undefined = undefined
> {
  /** Identifier for logging and debugging */
  name: string;

  /** Static system prompt instructions */
  systemPrompt: string;

  /** Dynamic user prompt - can be a function receiving input */
  userPrompt: string | ((input: TInput) => string);

  /** Context messages injected between system and user prompts (pre-computed strings) */
  context?: string[];

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
  [K in keyof T]: T[K] extends ConfigurableAgent<unknown, infer O> ? O : never;
};

/**
 * Combined output from main agent + subAgents
 * Response contains main agent output, plus all subAgent outputs by key
 */
export type AgentComposedOutput<
  TMainOutput,
  TSubAgents extends SubAgentBatch[] | undefined
> = TSubAgents extends SubAgentBatch[]
  ? { response: TMainOutput } & UnionToIntersection<ExtractSubAgentOutputs<TSubAgents[number]>>
  : { response: TMainOutput };

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
