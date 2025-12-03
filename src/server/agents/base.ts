import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { RunnableLambda } from "@langchain/core/runnables";
import type { StructuredToolInterface } from "@langchain/core/tools";

/**
 * Configuration for agents
 */
export interface AgentConfig {
    model?: 'gpt-5-nano' | 'gpt-5-mini' |'gemini-2.5-flash' | 'gpt-4o' | 'gemini-2.5-flash-lite' | 'gpt-5.1';
    temperature?: number;
    maxTokens?: number;
    verbose?: boolean;
  }

/**
 * Options for model initialization
 */
export interface ModelOptions {
  tools?: StructuredToolInterface[];
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
 * Standard tool result type
 * All tools called by agents should return this
 */
export interface ToolResult {
  /** Summary for the calling agent */
  response: string;
  /** SMS messages to send to user (optional) */
  messages?: string[];
}

/**
 * Helper to wrap an async function as an Agent
 * Useful for converting legacy agents to the standard interface
 */
export function createAgentFromFunction<TInput, TOutput>(
  fn: (input: TInput) => Promise<TOutput>
): Agent<TInput, TOutput> {
  return {
    invoke: fn
  };
}

/**
 * Helper to create a RunnableLambda agent (preferred for LangChain composition)
 * RunnableLambda already implements the Agent interface via its invoke() method
 */
export function createRunnableAgent<TInput, TOutput>(
  fn: (input: TInput) => Promise<TOutput>
): RunnableLambda<TInput, TOutput> {
  return RunnableLambda.from(fn);
}

/**
 * Initialize the model with structured output using the provided schema
 *
 * @param outputSchema - Optional Zod schema for structured output. If provided, returns T. If undefined, returns string.
 * @param config - Optional agent configuration
 * @param options - Optional model options (e.g., tools)
 * @returns Model that returns structured output (T), plain text (string), or model with tools bound
 */
export const initializeModel = (outputSchema?: any, config?: AgentConfig, options?: ModelOptions): any => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { model = 'gpt-5-nano', temperature = 1, maxTokens = 8000 } = config || {};

    if (model.startsWith('gemini')) {
      const llm = new ChatGoogleGenerativeAI({
        model: model,
        temperature,
        maxOutputTokens: maxTokens,
      })
      if (options?.tools) {
        return llm.bindTools(options.tools);
      }
      if (outputSchema) {
        return llm.withStructuredOutput(outputSchema);
      }
      // When no schema provided, wrap LLM to auto-extract .content from AIMessage
      return {
        invoke: async (input: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          const response = await llm.invoke(input);
          return typeof response.content === 'string'
            ? response.content
            : String(response.content);
        }
      };
    } else {
      const llm = new ChatOpenAI({
        model: model,
        temperature: model !== 'gpt-5-nano' ? temperature : 1,
        maxCompletionTokens: maxTokens,
        reasoningEffort: 'low',
      })
      if (options?.tools) {
        return llm.bindTools(options.tools);
      }
      if (outputSchema) {
        return llm.withStructuredOutput(outputSchema);
      }
      // When no schema provided, wrap LLM to auto-extract .content from AIMessage
      return {
        invoke: async (input: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          const response = await llm.invoke(input);
          return typeof response.content === 'string'
            ? response.content
            : String(response.content);
        }
      };
    }
  };
  
  