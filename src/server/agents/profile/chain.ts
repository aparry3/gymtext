// Import the new modular architecture
import { extractGoalsData } from './goals/chain';
import { buildUserProfileSystemPrompt, buildContextualProfilePrompt } from './prompts';
import type { FitnessProfile, User } from '../../models/user/schemas';
import type { UserWithProfile } from '../../models/userModel';
import type { ProfileAgentResult, ProfileAgentConfig } from './types';

// Types are now imported from ./types.ts

/**
 * NEW MODULAR ARCHITECTURE - Route to specialized sub-agents
 * This is the future direction for profile extraction
 */
export const userProfileAgentModular = async ({
  message,
  user,
  config = {},
}: {
  message: string;
  user: UserWithProfile;
  config?: ProfileAgentConfig;
}): Promise<ProfileAgentResult> => {
  
  try {
    const { verbose = false } = config;
    
    if (verbose) {
      console.log(`[ModularProfileAgent] Processing message for user ${user.id}`);
    }
    
    // For now, just route everything to Goals Agent
    // TODO: Add intelligent routing based on message content
    const goalsResult = await extractGoalsData(message, user, config);
    
    // For demo purposes, convert to old format (in real usage, caller would handle patch tools)
    if (goalsResult.hasData && goalsResult.confidence > 0.7 && goalsResult.data) {
      return {
        profile: { goals: goalsResult.data } as FitnessProfile,
        user: user,
        wasUpdated: true,
        updateSummary: {
          fieldsUpdated: ['goals'],
          reason: goalsResult.reason,
          confidence: goalsResult.confidence
        }
      };
    }
    
    return {
      profile: user.parsedProfile as FitnessProfile | null,
      user: user,
      wasUpdated: false
    };
    
  } catch (error) {
    console.error('[ModularProfileAgent] Error:', error);
    
    return {
      profile: user.parsedProfile as FitnessProfile | null,
      user: user,
      wasUpdated: false
    };
  }
};

// ORIGINAL MONOLITHIC AGENT (PRESERVED FOR BACKWARD COMPATIBILITY)

/**
 * Initialize the profile extraction model with tools
 * Using lower temperature for consistent extraction
 */
const initializeModel = (config: ProfileAgentConfig = {}) => {
  const { 
    model = 'gpt-5-nano', 
    temperature = 0.2  // Low temperature for consistent extraction
  } = config;

  // Use OpenAI for now (better tool calling support)
  // Can switch to Gemini later if needed
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
 * UserProfileAgent - Extracts and updates user profile information (Phase 4 - Pass-through)
 * 
 * This agent analyzes user messages for fitness-related information
 * and returns updated partial profile objects using pure functions
 */
export const userProfileAgent = async ({
  userId, // Kept for backward compatibility but not used in pass-through mode
  message,
  currentProfile,
  currentUser = {},
  config = {},
  recentMessages = [],
}: {
  userId: string;
  message: string;
  currentProfile: Partial<FitnessProfile>;
  currentUser?: Partial<User>;
  config?: ProfileAgentConfig;
  recentMessages?: string[];
}): Promise<ProfileAgentResult> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _userId = userId; // Suppress unused variable warning
  
  try {
    const { verbose = false } = config;
    
    // Initialize the model with tools
    const model = initializeModel(config);
    
    // Build the system prompt with conversation context if available
    const systemPrompt = recentMessages.length > 0 
      ? buildContextualProfilePrompt(currentProfile as FitnessProfile, recentMessages, currentUser)
      : buildUserProfileSystemPrompt(currentProfile, currentUser);
    
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
    
    // Types for tool handling
    interface ToolState {
      wasUpdated: boolean;
      updatedProfile: Partial<FitnessProfile>;
      updatedUser: Partial<User>;
      combinedFieldsUpdated: string[];
      reasons: string[];
      maxConfidence: number;
    }

    interface ToolCallArgs {
      reason?: string;
      confidence?: number;
      [key: string]: unknown;
    }

    interface ToolResult {
      applied: boolean;
      fieldsUpdated?: string[];
      reason?: string;
      updatedProfile?: Partial<FitnessProfile>;
      updatedUser?: Partial<User>;
    }

    // Tool handler configuration
    const toolHandlers = {
      'update_user_profile': {
        tool: profilePatchTool,
        invoke: async (args: ToolCallArgs, state: ToolState): Promise<ToolResult> => profilePatchTool.invoke({
          ...args,
          currentProfile: state.updatedProfile
        } as Parameters<typeof profilePatchTool.invoke>[0]),
        updateState: (result: ToolResult, state: ToolState): ToolState => ({
          ...state,
          updatedProfile: result.updatedProfile as FitnessProfile
        }),
        successMessage: 'Profile updated successfully'
      },
      'update_user_info': {
        tool: userInfoPatchTool,
        invoke: async (args: ToolCallArgs, state: ToolState): Promise<ToolResult> => userInfoPatchTool.invoke({
          ...args,
          currentUser: state.updatedUser
        } as Parameters<typeof userInfoPatchTool.invoke>[0]),
        updateState: (result: ToolResult, state: ToolState): ToolState => ({
          ...state,
          updatedUser: result.updatedUser as Partial<User>
        }),
        successMessage: 'User info updated successfully'
      }
    };

    // Generic tool handler function
    const handleToolCall = async (toolCall: { name: string; args: ToolCallArgs }, state: ToolState): Promise<ToolState> => {
      const handler = toolHandlers[toolCall.name as keyof typeof toolHandlers];
      console.log("name", toolCall.name)
      console.log("args", toolCall.args)
      if (!handler) {
        if (verbose) {
          console.log(`Unknown tool called: ${toolCall.name}`);
        }
        return state;
      }

      if (verbose) {
        console.log(`${toolCall.name} tool called with:`, toolCall.args);
      }

      const result = await handler.invoke(toolCall.args, state);
      
      if (result.applied) {
        const newState = handler.updateState(result, state);
        newState.wasUpdated = true;
        newState.combinedFieldsUpdated.push(...(result.fieldsUpdated || []));
        
        const args = toolCall.args;
        if (args?.reason) newState.reasons.push(args.reason);
        if ((args?.confidence ?? 0) > newState.maxConfidence) {
          newState.maxConfidence = args?.confidence ?? 0;
        }
        
        if (verbose) {
          console.log(`${handler.successMessage}:`, {
            fieldsUpdated: result.fieldsUpdated || [],
            reason: args?.reason || '',
            confidence: args?.confidence ?? 0,
          });
        }
        
        return newState;
      } else {
        if (verbose) {
          console.log(`${toolCall.name} update not applied:`, result.reason);
        }
        return state;
      }
    };
    
    // Initialize result state
    let state: ToolState = {
      wasUpdated: false,
      updatedProfile: currentProfile,
      updatedUser: currentUser,
      combinedFieldsUpdated: [],
      reasons: [],
      maxConfidence: 0
    };
    
    // Process all tool calls
    if (response.tool_calls && response.tool_calls.length > 0) {
      if (verbose) {
        console.log("response.tool_calls", response.tool_calls);
      }
      
      for (const toolCall of response.tool_calls) {
        state = await handleToolCall(toolCall, state);
      }
    } else if (verbose) {
      console.log('No updates detected in message');
    }
    
    const { wasUpdated, updatedProfile, updatedUser, combinedFieldsUpdated, reasons, maxConfidence } = state;
    
    const updateSummary = combinedFieldsUpdated.length > 0
      ? {
          fieldsUpdated: Array.from(new Set(combinedFieldsUpdated)),
          reason: reasons.filter(Boolean).join('; '),
          confidence: maxConfidence,
        }
      : undefined;

    return {
      profile: updatedProfile as FitnessProfile,
      user: updatedUser,
      wasUpdated,
      updateSummary,
    };
    
  } catch (error) {
    console.error('UserProfileAgent error:', error);
    
    // Return the original profile and user on error
    return {
      profile: currentProfile as FitnessProfile,
      user: currentUser,
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
  currentUser = {},
  config = {},
  recentMessages = [],
}: {
  userId: string;
  messages: string[];
  currentProfile: Partial<FitnessProfile>;
  currentUser?: Partial<User>;
  config?: ProfileAgentConfig;
  recentMessages?: string[];
}): Promise<ProfileAgentResult> => {
  let profile = currentProfile;
  let user = currentUser;
  let totalUpdates = 0;
  const allFieldsUpdated: string[] = [];
  
  for (const message of messages) {
    const result = await userProfileAgent({
      userId,
      message,
      currentProfile: profile,
      currentUser: user,
      config,
      recentMessages
    });
    
    if (result.wasUpdated) {
      if (result.profile) {
        profile = result.profile as Partial<FitnessProfile>;
      }
      if (result.user) {
        user = result.user;
      }
      totalUpdates++;
      
      if (result.updateSummary) {
        allFieldsUpdated.push(...result.updateSummary.fieldsUpdated);
      }
    }
  }
  
  return {
    profile: profile as FitnessProfile,
    user,
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
  currentProfile: Partial<FitnessProfile> = {},
  currentUser: Partial<User> = {}
): Promise<ProfileAgentResult> => {
  console.log('Testing profile extraction with message:', message);
  
  return userProfileAgent({
    userId: 'test-user',
    message,
    currentProfile,
    currentUser,
    config: { verbose: true }
  });
};