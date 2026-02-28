// ============================================
// Base Agent Types
// ============================================

/**
 * Supported model identifiers.
 * Known values get autocomplete; any string is accepted for forward compatibility.
 */
export type ModelId =
  // OpenAI (direct)
  | 'gpt-5.2' | 'gpt-5.1' | 'gpt-5-mini' | 'gpt-5-nano'
  | 'gpt-4o' | 'gpt-4o-mini'
  // Google Gemini (direct)
  | 'gemini-3.1-pro' | 'gemini-3.1-flash'
  | 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite'
  // OpenRouter models (provider/model format)
  | 'x-ai/grok-4-1-fast-reasoning' | 'x-ai/grok-4-1-fast-non-reasoning'
  | 'x-ai/grok-3' | 'x-ai/grok-3-mini'
  | 'deepseek/deepseek-chat' | 'deepseek/deepseek-reasoner'
  | 'minimax/MiniMax-M2.5' | 'minimax/MiniMax-M2.5-highspeed' | 'minimax/MiniMax-M2.1' | 'minimax/MiniMax-M1'
  | 'moonshotai/kimi-k2.5' | 'moonshotai/moonshot-v1-128k' | 'moonshotai/moonshot-v1-32k'
  | (string & {});

/**
 * Configuration for agents
 */
export interface AgentConfig {
  model?: ModelId;
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
 * Message structure for LLM invocation
 */
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  /** Section label for agent log readability (ignored by LLM) */
  section?: 'system' | 'context' | 'example' | 'previous' | 'retry' | 'user';
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
// Agent Example Types
// ============================================

/**
 * Example for few-shot prompting in agent definitions
 * Positive examples show the expected output format
 * Negative examples show what to avoid with feedback
 */
export interface AgentExample {
  type: 'positive' | 'negative';
  input: string;
  output: string;
  /** For negative examples: explains why this output is wrong */
  feedback?: string;
}

// ============================================
// Agent Log Callback Types
// ============================================

/**
 * Entry passed to the onLog callback after agent invocation
 */
export interface AgentLogEntry {
  agentId: string;
  model?: string;
  input: string;
  messages: Message[];
  response: unknown;
  durationMs: number;
  metadata?: {
    usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
    toolCalls?: { name: string; durationMs: number }[];
    toolIterations?: number;
    retryAttempt?: number;
    isToolAgent?: boolean;
  };
}
