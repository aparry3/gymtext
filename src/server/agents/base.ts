import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatXAI } from "@langchain/xai";
import { RunnableLambda } from "@langchain/core/runnables";
import type { StructuredToolInterface } from "@langchain/core/tools";

/**
 * Configuration for agents
 */
export interface AgentConfig {
    model?: 'gpt-5-nano' | 'gpt-5-mini' |'gemini-2.5-flash' | 'gpt-4o' | 'gemini-2.5-flash-lite' | 'gpt-5.1' | 'grok-4-1-fast-reasoning';
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
 * Helper to configure LLM with tools, structured output, or plain text extraction
 */
const configureLLM = (llm: any, outputSchema?: any, options?: ModelOptions): any => { // eslint-disable-line @typescript-eslint/no-explicit-any
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
};

/**
 * Map of model prefixes to their LLM factory functions
 */
const MODEL_PROVIDERS = {
  gemini: (model: string, temperature: number, maxTokens: number) =>
    new ChatGoogleGenerativeAI({
      model,
      temperature,
      maxOutputTokens: maxTokens,
    }),
  grok: (model: string, temperature: number, maxTokens: number) =>
    new ChatXAI({
      model,
      temperature,
      maxTokens,
    }),
  default: (model: string, temperature: number, maxTokens: number) =>
    new ChatOpenAI({
      model,
      temperature: model !== 'gpt-5-nano' ? temperature : 1,
      maxCompletionTokens: maxTokens,
      reasoningEffort: 'low',
    }),
};

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

  // Find the appropriate provider based on model prefix
  const providerKey = Object.keys(MODEL_PROVIDERS).find(key =>
    key !== 'default' && model.startsWith(key)
  ) ?? 'default';

  const llm = MODEL_PROVIDERS[providerKey as keyof typeof MODEL_PROVIDERS](model, temperature, maxTokens);

  return configureLLM(llm, outputSchema, options);
};
  
  