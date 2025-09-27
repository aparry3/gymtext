import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { UserWithProfile } from "../models";

/**
 * Configuration for ProfileAgents
 */
export interface AgentConfig {
    model?: 'gpt-5-nano' | 'gemini-2.5-flash';
    temperature?: number;
    verbose?: boolean;
  }
  
  
export interface Agent<T> {
    invoke: ({user, context}: {user: UserWithProfile, context: T}) => Promise<{user: UserWithProfile, context: T}>;
}

/**
 * Initialize the model with structured output using the provided schema
 */
export const initializeModel = (config?: AgentConfig, outputSchema?: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { model = 'gemini-2.5-flash', temperature = 0.2 } = config || {};
  
    let llm: ChatGoogleGenerativeAI | ChatOpenAI;
    if (model.startsWith('gemini')) {
      llm = new ChatGoogleGenerativeAI({
        model: model,
        temperature,
        maxOutputTokens: 2000,
      })
    } else {
        llm = new ChatOpenAI({
        model: model,
        temperature,
        maxCompletionTokens: 2000,
        })
    }
    if (outputSchema) {
      return llm.withStructuredOutput(outputSchema);
    }
    return llm;
  };
  
  