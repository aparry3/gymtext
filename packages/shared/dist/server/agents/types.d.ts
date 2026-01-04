import type { z, ZodSchema } from 'zod';
import type { StructuredToolInterface } from '@langchain/core/tools';
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
/**
 * Supported model identifiers
 */
export type ModelId = 'gpt-5-nano' | 'gpt-5-mini' | 'gpt-5.1' | 'gpt-4o' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite';
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
 * Extended subAgent configuration with optional transform and condition
 */
export interface SubAgentConfig<TAgent extends ConfigurableAgent<any> = ConfigurableAgent<any>> {
    /** The subAgent to execute */
    agent: TAgent;
    /** Transform main result to string input for this subAgent */
    transform?: (mainResult: unknown) => string;
    /** Condition to run this subAgent (default: always run) */
    condition?: (mainResult: unknown) => boolean;
}
/**
 * SubAgent entry - either a bare agent or extended config
 */
export type SubAgentEntry = ConfigurableAgent<any> | SubAgentConfig;
/**
 * SubAgent batch - agents within a batch run in parallel
 * Key becomes the property name in the result
 * Values can be bare agents or extended configs with transform/condition
 */
export type SubAgentBatch = Record<string, SubAgentEntry>;
/**
 * Agent definition - the declarative configuration
 */
export interface AgentDefinition<TSchema extends ZodSchema | undefined = undefined> {
    /** Identifier for logging and debugging */
    name: string;
    /**
     * Static system prompt instructions.
     * If not provided, fetched from database using agent name.
     */
    systemPrompt?: string;
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
export type InferSchemaOutput<TSchema extends ZodSchema | undefined> = TSchema extends ZodSchema ? z.infer<TSchema> : string;
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
export type AgentComposedOutput<TMainOutput, TSubAgents extends SubAgentBatch[] | undefined> = TSubAgents extends SubAgentBatch[] ? {
    response: TMainOutput;
    messages?: string[];
} & UnionToIntersection<ExtractSubAgentOutputs<TSubAgents[number]>> : {
    response: TMainOutput;
    messages?: string[];
};
/**
 * Helper type to convert union to intersection
 */
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
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
export {};
//# sourceMappingURL=types.d.ts.map