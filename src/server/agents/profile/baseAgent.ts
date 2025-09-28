import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { UserWithProfile } from '../../models/userModel';
import type { 
  SubAgentResult,
  SubAgentConfig 
} from './types';
import { AgentConfig } from '../base';

/**
 * Initialize the model with structured output using the provided schema
 */
const initializeModel = (config: AgentConfig = {}, outputSchema: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { 
    model = 'gpt-4o', 
    temperature = 0.2
  } = config;

  if (model.startsWith('gemini')) {
    return new ChatGoogleGenerativeAI({
      model: model,
      temperature,
      maxOutputTokens: 2000,
    }).withStructuredOutput(outputSchema);
  }

  return new ChatOpenAI({
    model: model,
    temperature,
    maxCompletionTokens: 2000,
  }).withStructuredOutput(outputSchema);
};

/**
 * Create sub-agent that returns domain-specific JSON data with schema validation
 * The caller (service/another agent) handles applying the data via patch tools
 */
export const createSubAgent = (subAgentConfig: SubAgentConfig) => {
  return async ({
    message,
    user,
    config = {},
  }: {
    message: string;
    user: UserWithProfile;
    config?: AgentConfig;
  }): Promise<SubAgentResult> => {
    
    try {
      const { verbose = false } = config;
      const { promptBuilder, agentName, outputSchema } = subAgentConfig;
      
      // Merge configs
      const finalConfig = { ...subAgentConfig, ...config };
      
      // Initialize model with the provided schema
      const model = initializeModel(finalConfig, outputSchema);
      
      // Build domain-specific prompt
      const systemPrompt = promptBuilder(user);
      
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(message)
      ];
      
      if (verbose) {
        console.log(`${agentName} extracting from message:`, message);
      }
      
      // Get structured output
      const result = await model.invoke(messages) as SubAgentResult;
      
      if (verbose) {
        console.log(`${agentName} result:`, {
          hasData: result.hasData,
          confidence: result.confidence,
          reason: result.reason
        });
      }
      
      return result;
      
    } catch (error) {
      console.error(`${subAgentConfig.agentName} error:`, error);
      
      return {
        data: null,
        hasData: false,
        confidence: 0,
        reason: 'Extraction failed due to error'
      };
    }
  };
};