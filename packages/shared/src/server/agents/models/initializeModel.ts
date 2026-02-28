import type { StructuredToolInterface } from "@langchain/core/tools";
import { resolveProvider } from "./providerRegistry";

/**
 * Options for model initialization
 */
export interface ModelOptions {
  tools?: StructuredToolInterface[];
}

/**
 * Token usage metadata from an LLM invocation
 */
export interface ModelUsageMetadata {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

/**
 * A model that can invoke prompts and return responses
 */
export interface InvokableModel<T = unknown> {
  invoke(input: unknown): Promise<T>;
  lastUsage?: ModelUsageMetadata;
}

/**
 * Initialize the model with structured output using the provided schema
 *
 * @param outputSchema - Optional Zod schema for structured output. If provided, returns T. If undefined, returns string.
 * @param config - Optional agent configuration
 * @param options - Optional model options (e.g., tools)
 * @returns Model that returns structured output (T), plain text (string), or model with tools bound
 */
export const initializeModel = <T = string>(outputSchema?: unknown, config?: { model?: string; temperature?: number; maxTokens?: number }, options?: ModelOptions): InvokableModel<T> => {
  const { model = 'gpt-5-nano', temperature = 1, maxTokens = 16000 } = config || {};

  const llm = resolveProvider(model, temperature, maxTokens);

  if (options?.tools) {
    const bound = llm.bindTools!(options.tools);
    const wrapper: InvokableModel<T> = {
      invoke: async (input: unknown): Promise<T> => {
        const result = await bound.invoke(input as Parameters<typeof bound.invoke>[0]);
        if (result.usage_metadata) {
          wrapper.lastUsage = {
            inputTokens: result.usage_metadata.input_tokens,
            outputTokens: result.usage_metadata.output_tokens,
            totalTokens: result.usage_metadata.total_tokens,
          };
        }
        return result as T;
      }
    };
    return wrapper;
  }

  if (outputSchema) {
    const structured = llm.withStructuredOutput(outputSchema, { includeRaw: true });
    const wrapper: InvokableModel<T> = {
      invoke: async (input: unknown): Promise<T> => {
        const result = await structured.invoke(input as Parameters<typeof structured.invoke>[0]);
        if (result.raw && 'usage_metadata' in result.raw && result.raw.usage_metadata) {
          const u = result.raw.usage_metadata as Record<string, number>;
          wrapper.lastUsage = {
            inputTokens: u.input_tokens,
            outputTokens: u.output_tokens,
            totalTokens: u.total_tokens,
          };
        }
        return result.parsed as T;
      }
    };
    return wrapper;
  }

  // When no schema provided, wrap LLM to auto-extract .content from AIMessage
  const wrapper: InvokableModel<T> = {
    invoke: async (input: unknown): Promise<T> => {
      const response = await llm.invoke(input as Parameters<typeof llm.invoke>[0]);
      if (response.usage_metadata) {
        wrapper.lastUsage = {
          inputTokens: response.usage_metadata.input_tokens,
          outputTokens: response.usage_metadata.output_tokens,
          totalTokens: response.usage_metadata.total_tokens,
        };
      }
      const content = typeof response.content === 'string'
        ? response.content
        : String(response.content);
      return content as T;
    }
  };
  return wrapper;
};
