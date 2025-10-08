import type { UserWithProfile } from '../../models/userModel';
import type {
  SubAgentResult,
  SubAgentConfig
} from './types';
import { AgentConfig, initializeModel } from '../base';

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
      const { systemPrompt, userMessageBuilder, agentName, outputSchema } = subAgentConfig;

      // Merge configs
      const finalConfig = { ...subAgentConfig, ...config };

      // Initialize model with the provided schema (correct argument order!)
      const model = initializeModel(outputSchema, finalConfig);

      // Build dynamic user message with context
      const userMessage = userMessageBuilder(user, message);

      // Format messages for our OpenAI wrapper
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
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