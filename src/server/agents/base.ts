import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { UserWithProfile } from "../models";
import { RunnableLambda } from "@langchain/core/runnables";

/**
 * Configuration for agents
 */
export interface AgentConfig {
    model?: 'gpt-5-nano' | 'gemini-2.5-flash' | 'gpt-4o';
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
 */
export const initializeModel = (outputSchema?: any,config?: AgentConfig): any => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { model = 'gpt-5-nano', temperature = 1, maxTokens = 4096 } = config || {};

    if (model.startsWith('gemini')) {
      const llm = new ChatGoogleGenerativeAI({
        model: model,
        temperature,
        maxOutputTokens: maxTokens,
      })
      if (outputSchema) {
        return llm.withStructuredOutput(outputSchema);
      }
      return llm;
    } else {
      const llm = new ChatOpenAI({
        model: model,
        temperature: model !== 'gpt-5-nano' ? temperature : 1,
        maxCompletionTokens: maxTokens,
        reasoningEffort: 'low',
      })
      if (outputSchema) {
        return llm.withStructuredOutput(outputSchema);
      }
      return llm;
    }
  };
  
  