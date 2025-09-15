import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { profilePatchTool } from '../tools/profilePatchTool';
import { userInfoPatchTool } from '../tools/userInfoPatchTool';
import type { UserWithProfile } from '../../models/userModel';
import type { 
  ProfileAgentConfig, 
  PromptBuilder, 
  SubAgentResult,
  SubAgentConfig 
} from './types';

/**
 * Initialize the model with tools
 */
const initializeModel = (config: ProfileAgentConfig = {}) => {
  const { 
    model = 'gpt-4-turbo', 
    temperature = 0.2
  } = config;

  if (model.startsWith('gemini')) {
    const geminiModel = new ChatGoogleGenerativeAI({
      model: model,
      temperature,
      maxOutputTokens: 3000,
    });
    return geminiModel.bindTools([profilePatchTool, userInfoPatchTool]);
  }

  const openaiModel = new ChatOpenAI({
    model: model,
    temperature,
    maxTokens: 3000,
  });
  
  return openaiModel.bindTools([profilePatchTool, userInfoPatchTool]);
};

/**
 * Base agent that can be specialized with different prompt builders
 * This consolidates all the LLM instantiation and tool calling logic
 */
export const createSubAgent = (subAgentConfig: SubAgentConfig) => {
  return async ({
    message,
    user,
    config = {},
  }: {
    message: string;
    user: UserWithProfile;
    config?: ProfileAgentConfig;
  }): Promise<SubAgentResult> => {
    
    try {
      const { verbose = false } = config;
      const { promptBuilder, agentName } = subAgentConfig;
      
      // Merge configs (passed config overrides subAgentConfig)
      const finalConfig = { ...subAgentConfig, ...config };
      
      // Initialize the model with tools
      const model = initializeModel(finalConfig);
      
      // Build the domain-specific prompt using the user context
      const systemPrompt = promptBuilder(user);
      
      // Create the message array
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(message)
      ];
      
      if (verbose) {
        console.log(`${agentName} analyzing message:`, message);
      }
      
      // Invoke the model with tools
      const response = await model.invoke(messages);
      
      // Track result state
      let wasUpdated = false;
      let updates: any = null;  // eslint-disable-line @typescript-eslint/no-explicit-any
      let combinedFieldsUpdated: string[] = [];
      let reasons: string[] = [];
      let maxConfidence = 0;
      
      // Process tool calls using the same logic as the original agent
      if (response.tool_calls && response.tool_calls.length > 0) {
        if (verbose) {
          console.log(`${agentName} tool_calls:`, response.tool_calls);
        }
        
        for (const toolCall of response.tool_calls) {
          if (toolCall.name === 'update_user_profile') {
            const args = toolCall.args as any;  // eslint-disable-line @typescript-eslint/no-explicit-any
            
            if (verbose) {
              console.log(`${agentName} profilePatchTool called with:`, args);
            }
            
            const result = await profilePatchTool.invoke({
              ...args,
              currentProfile: user.parsedProfile || {}
            });
            
            if (result.applied) {
              wasUpdated = true;
              updates = result.updatedProfile;
              combinedFieldsUpdated.push(...(result.fieldsUpdated || []));
              if (args?.reason) reasons.push(args.reason);
              if ((args?.confidence ?? 0) > maxConfidence) {
                maxConfidence = args?.confidence ?? 0;
              }
              
              if (verbose) {
                console.log(`${agentName} profile update applied:`, {
                  fieldsUpdated: result.fieldsUpdated,
                  reason: args?.reason,
                  confidence: args?.confidence,
                });
              }
            } else if (verbose) {
              console.log(`${agentName} profile update not applied:`, result.reason);
            }
            
          } else if (toolCall.name === 'update_user_info') {
            const args = toolCall.args as any;  // eslint-disable-line @typescript-eslint/no-explicit-any
            
            if (verbose) {
              console.log(`${agentName} userInfoPatchTool called with:`, args);
            }
            
            const result = await userInfoPatchTool.invoke({
              ...args,
              currentUser: user
            });
            
            if (result.applied) {
              wasUpdated = true;
              updates = result.updatedUser;
              combinedFieldsUpdated.push(...(result.fieldsUpdated || []));
              if (args?.reason) reasons.push(args.reason);
              if ((args?.confidence ?? 0) > maxConfidence) {
                maxConfidence = args?.confidence ?? 0;
              }
              
              if (verbose) {
                console.log(`${agentName} user info update applied:`, {
                  fieldsUpdated: result.fieldsUpdated,
                  reason: args?.reason,
                  confidence: args?.confidence,
                });
              }
            } else if (verbose) {
              console.log(`${agentName} user info update not applied:`, result.reason);
            }
          }
        }
      } else if (verbose) {
        console.log(`${agentName}: No updates detected in message`);
      }
      
      const updateSummary = combinedFieldsUpdated.length > 0
        ? {
            fieldsUpdated: Array.from(new Set(combinedFieldsUpdated)),
            reason: reasons.filter(Boolean).join('; '),
            confidence: maxConfidence,
          }
        : undefined;

      return {
        updates,
        wasUpdated,
        updateSummary,
      };
      
    } catch (error) {
      console.error(`${subAgentConfig.agentName} error:`, error);
      
      return {
        updates: null,
        wasUpdated: false
      };
    }
  };
};