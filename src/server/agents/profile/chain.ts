import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { profilePatchTool } from '@/server/agents/tools/profilePatchTool';
import { userInfoPatchTool } from '@/server/agents/tools/userInfoPatchTool';
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
    return geminiModel.bindTools([profilePatchTool, userInfoPatchTool]);
  }

  const openaiModel = new ChatOpenAI({
    model: model,
    temperature,
    maxTokens: 1000,
  });
  
  return openaiModel.bindTools([profilePatchTool, userInfoPatchTool]);
};

/**
 * UserProfileAgent - Extracts and updates user profile information (Phase 4 - Pass-through)
 * 
 * This agent analyzes user messages for fitness-related information
 * and returns updated partial profile objects using pure functions
 */
export const userProfileAgent = async ({
  userId, // Kept for backward compatibility but not used in pass-through mode
  message,
  currentProfile,
  config = {},
}: {
  userId: string;
  message: string;
  currentProfile: Partial<FitnessProfile>;
  config?: ProfileAgentConfig;
}): Promise<ProfileAgentResult> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _userId = userId; // Suppress unused variable warning
  
  try {
    const { verbose = false } = config;
    
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
    
    // Invoke the model with the tool - no config needed for pass-through
    const response = await model.invoke(messages);
    
    // Initialize result accumulators
    let wasUpdated = false;
    let updatedProfile = currentProfile;
    const combinedFieldsUpdated: string[] = [];
    const reasons: string[] = [];
    let maxConfidence = 0;
    
    // Check if the model called the tool
    if (response.tool_calls && response.tool_calls.length > 0) {
      if (verbose) {
        console.log("response.tool_calls", response.tool_calls);
      }
      
      for (const toolCall of response.tool_calls) {
        if (toolCall.name === 'update_user_profile') {
          if (verbose) {
            console.log('Profile update tool called with:', toolCall.args);
          }
          
          // Use the new pass-through approach
          const result = await profilePatchTool.invoke({
            ...toolCall.args,
            currentProfile: updatedProfile
          } as Parameters<typeof profilePatchTool.invoke>[0]);
          
          // Check if the update was applied
          if (result.applied) {
            wasUpdated = true;
            updatedProfile = result.updatedProfile as FitnessProfile;
            combinedFieldsUpdated.push(...(result.fieldsUpdated || []));
            
            const args = toolCall.args as { reason?: string; confidence?: number };
            if (args?.reason) reasons.push(args.reason);
            if ((args?.confidence ?? 0) > maxConfidence) maxConfidence = args?.confidence ?? 0;
            
            if (verbose) {
              console.log('Profile updated successfully:', {
                fieldsUpdated: result.fieldsUpdated || [],
                reason: args?.reason || '',
                confidence: args?.confidence ?? 0,
              });
            }
          } else if (verbose) {
            console.log('Profile update not applied:', result.reason);
          }
        }
        // Note: User info updates are handled separately in onboarding service
      }
    } else if (verbose) {
      console.log('No profile updates detected in message');
    }
    
    const updateSummary = combinedFieldsUpdated.length > 0
      ? {
          fieldsUpdated: Array.from(new Set(combinedFieldsUpdated)),
          reason: reasons.filter(Boolean).join('; '),
          confidence: maxConfidence,
        }
      : undefined;

    return {
      profile: updatedProfile as FitnessProfile,
      wasUpdated,
      updateSummary,
    };
    
  } catch (error) {
    console.error('UserProfileAgent error:', error);
    
    // Return the original profile on error
    return {
      profile: currentProfile as FitnessProfile,
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
  currentProfile: Partial<FitnessProfile>;
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
    
    if (result.wasUpdated && result.profile) {
      profile = result.profile as Partial<FitnessProfile>;
      totalUpdates++;
      
      if (result.updateSummary) {
        allFieldsUpdated.push(...result.updateSummary.fieldsUpdated);
      }
    }
  }
  
  return {
    profile: profile as FitnessProfile,
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
  currentProfile: Partial<FitnessProfile> = {}
): Promise<ProfileAgentResult> => {
  console.log('Testing profile extraction with message:', message);
  
  return userProfileAgent({
    userId: 'test-user',
    message,
    currentProfile,
    config: { verbose: true }
  });
};