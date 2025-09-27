// Import the new modular architecture
import { extractGoalsData } from './goals/chain';
import type { FitnessProfile, User } from '../../models/user/schemas';
import type { UserWithProfile } from '../../models/userModel';
import type { ProfileAgentResult } from './types';
import { profilePatchTool } from '../tools/profilePatchTool';
import { userInfoPatchTool } from '../tools/userInfoPatchTool';
import { AgentConfig } from '../base';
import { RunnableMap } from '@langchain/core/runnables';
import { extractActivitiesData } from './activities/chain';
import { extractMetricsData } from './metrics/chain';

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
  config?: AgentConfig;
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
      profile: user.profile as FitnessProfile | null,
      user: user,
      wasUpdated: false
    };
    
  } catch (error) {
    console.error('[ModularProfileAgent] Error:', error);
    
    return {
      profile: user.profile as FitnessProfile | null,
      user: user,
      wasUpdated: false
    };
  }
};


/**
 * UserProfileAgent - Extracts and updates user profile information (Phase 4 - Pass-through)
 * 
 * This agent analyzes user messages for fitness-related information
 * and returns updated partial profile objects using pure functions
 */
export const updateUserProfile = async (
  message: string,
  user: UserWithProfile,
  config?: AgentConfig
): Promise<ProfileAgentResult> => {  
  try {
    const { verbose = false } = config;
    
   
    if (verbose) {
      console.log('UserProfileAgent analyzing message:', message);
    }
    
    // Invoke the model with the tool - no config needed for pass-through
    const response = await model.invoke(messages);
    
    const profileUpdates = new RunnableMap({
      goals: extractGoalsData(message, user, config),
      activities: extractActivitiesData(message, user, config),
      metrics: extractMetricsData(message, user, config),
      constraints: extractConstraintsData(message, user, config),
      environment: extractEnvironmentData(message, user, config),
      equipment: extractEquipmentData(message, user, config),

    })
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
