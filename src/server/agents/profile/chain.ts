import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { profilePatchTool } from '@/server/agents/tools/profilePatchTool';
import { buildUserProfileSystemPrompt } from './prompts';
import type { FitnessProfile } from '@/server/models/userModel';

/**
 * Result type returned by the UserProfileAgent
 */
export interface ProfileAgentResult {
  profile: FitnessProfile | null;
  wasUpdated: boolean;
  updateSummary?: {
    fieldsUpdated: string[];
    reason: string;
    confidence: number;
  };
}

/**
 * Configuration for the UserProfileAgent
 */
export interface ProfileAgentConfig {
  model?: 'gpt-4-turbo' | 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro';
  temperature?: number;
  verbose?: boolean;
  mode?: 'apply' | 'intercept';
}

/**
 * Initialize the profile extraction model with tools
 * Using lower temperature for consistent extraction
 */
const initializeModel = (config: ProfileAgentConfig = {}) => {
  const { 
    model = 'gpt-4-turbo', 
    temperature = 0.2  // Low temperature for consistent extraction
  } = config;

  // Use OpenAI for now (better tool calling support)
  // Can switch to Gemini later if needed
  if (model.startsWith('gemini')) {
    const geminiModel = new ChatGoogleGenerativeAI({
      model: model,
      temperature,
      maxOutputTokens: 1000,
    });
    return geminiModel.bindTools([profilePatchTool]);
  }

  const openaiModel = new ChatOpenAI({
    model: model,
    temperature,
    maxTokens: 1000,
  });
  
  return openaiModel.bindTools([profilePatchTool]);
};

/**
 * UserProfileAgent - Extracts and updates user profile information
 * 
 * This agent analyzes user messages for fitness-related information
 * and updates the profile when appropriate with high confidence
 */
export const userProfileAgent = async ({
  userId,
  message,
  currentProfile,
  config = {},
}: {
  userId: string;
  message: string;
  currentProfile: FitnessProfile | null;
  config?: ProfileAgentConfig;
}): Promise<ProfileAgentResult> => {
  try {
    const { verbose = false, mode = 'apply' } = config;
    
    // Initialize the model with tools
    const model = initializeModel(config);
    
    // Build the system prompt
    const systemPrompt = buildUserProfileSystemPrompt(currentProfile);
    
    // Create the message array
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(message)
    ];
    
    if (verbose) {
      console.log('UserProfileAgent analyzing message:', message);
    }
    
    // Invoke the model with the tool
    const response = await model.invoke(messages, {
      configurable: { userId }
    });
    
    // Initialize result
    let wasUpdated = false;
    let updatedProfile = currentProfile;
    let updateSummary: ProfileAgentResult['updateSummary'] = undefined;
    
    // Check if the model called the tool
    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        if (toolCall.name === 'update_user_profile') {
          if (verbose) {
            console.log('Profile update tool called with:', toolCall.args);
          }
          
          if (mode === 'intercept' || !userId) {
            // Interception mode: do not apply, just return intent
            wasUpdated = false;
            const args = toolCall.args as { updates?: Record<string, unknown>; reason?: string; confidence?: number };
            updateSummary = {
              fieldsUpdated: Object.keys(args?.updates || {}),
              reason: args?.reason || '',
              confidence: args?.confidence ?? 0,
            };
          } else {
            // Execute the tool - args are already properly typed by LangChain
            const result = await profilePatchTool.invoke(
              toolCall.args as Parameters<typeof profilePatchTool.invoke>[0],
              { configurable: { userId } }
            );
            
            // Check if the update was applied
            if (result.applied) {
              wasUpdated = true;
              updatedProfile = result.updatedProfile as FitnessProfile;
              const args = toolCall.args as { reason?: string; confidence?: number };
              updateSummary = {
                fieldsUpdated: result.fieldsUpdated || [],
                reason: args?.reason || '',
                confidence: args?.confidence ?? 0,
              };
              
              if (verbose) {
                console.log('Profile updated successfully:', updateSummary);
              }
            } else if (verbose) {
              console.log('Profile update not applied:', result.reason);
            }
          }
        }
      }
    } else if (verbose) {
      console.log('No profile updates detected in message');
    }
    
    return {
      profile: updatedProfile,
      wasUpdated,
      updateSummary
    };
    
  } catch (error) {
    console.error('UserProfileAgent error:', error);
    
    // Return the original profile on error
    return {
      profile: currentProfile,
      wasUpdated: false
    };
  }
};

/**
 * Batch process multiple messages through the UserProfileAgent
 * Useful for processing conversation history or bulk updates
 */
export const batchProfileExtraction = async ({
  userId,
  messages,
  currentProfile,
  config = {},
}: {
  userId: string;
  messages: string[];
  currentProfile: FitnessProfile | null;
  config?: ProfileAgentConfig;
}): Promise<ProfileAgentResult> => {
  let profile = currentProfile;
  let totalUpdates = 0;
  const allFieldsUpdated: string[] = [];
  
  for (const message of messages) {
    const result = await userProfileAgent({
      userId,
      message,
      currentProfile: profile,
      config
    });
    
    if (result.wasUpdated) {
      profile = result.profile;
      totalUpdates++;
      
      if (result.updateSummary) {
        allFieldsUpdated.push(...result.updateSummary.fieldsUpdated);
      }
    }
  }
  
  return {
    profile,
    wasUpdated: totalUpdates > 0,
    updateSummary: totalUpdates > 0 ? {
      fieldsUpdated: [...new Set(allFieldsUpdated)], // Remove duplicates
      reason: `Batch processed ${messages.length} messages`,
      confidence: 0.8 // Average confidence for batch
    } : undefined
  };
};

/**
 * Test the agent with a sample message (for debugging)
 */
export const testProfileExtraction = async (
  message: string,
  currentProfile: FitnessProfile | null = null
): Promise<ProfileAgentResult> => {
  console.log('Testing profile extraction with message:', message);
  
  return userProfileAgent({
    userId: 'test-user',
    message,
    currentProfile,
    config: { verbose: true }
  });
};