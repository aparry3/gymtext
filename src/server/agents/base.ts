import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { UserWithProfile } from "../models";

/**
 * Configuration for ProfileAgents
 */
export interface AgentConfig {
    model?: 'gpt-5-nano' | 'gemini-2.5-flash' | 'gpt-4o';
    temperature?: number;
    maxTokens?: number;
    verbose?: boolean;
  }
  
  
export interface Agent<T> {
    invoke: ({user, context}: {user: UserWithProfile, context: T}) => Promise<{user: UserWithProfile, context: T}>;
}

/**
 * Initialize the model with structured output using the provided schema
 */
export const initializeModel = (outputSchema?: any,config?: AgentConfig): any => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { model = 'gpt-5-nano', temperature = 1, maxTokens = 2000 } = config || {};

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
        temperature,
        maxCompletionTokens: maxTokens,
        reasoningEffort: 'low',
      })
      if (outputSchema) {
        return llm.withStructuredOutput(outputSchema);
      }
      return llm;
    }
  };
  
  