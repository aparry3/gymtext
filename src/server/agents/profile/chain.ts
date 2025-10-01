// Import the new modular architecture
import { goalsRunnable } from './goals/chain';
import type { UserWithProfile } from '../../models/userModel';
import type { ProfileExtractionResults } from './types';
import { AgentConfig } from '../base';
import { RunnableLambda, RunnableMap, RunnableSequence } from '@langchain/core/runnables';
import { activitiesRunnable } from './activities/chain';
import { constraintsRunnable } from './constraints/chain';
import { environmentRunnable } from './environment/chain';
import { userRunnable } from './user/chain';
import { fitnessProfileService } from '@/server/services';
import { ProfilePatchResult } from '@/server/services/fitnessProfileService';


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
): Promise<ProfilePatchResult> => {
  try {
    console.log('[PROFILE AGENT] Starting profile extraction for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

    const profileUpdatesRunnable = RunnableMap.from({
      goals: goalsRunnable(config),
      activities: activitiesRunnable(config),
      constraints: constraintsRunnable(config),
      environment: environmentRunnable(config),
      user: userRunnable(config)
    })

    const patchProfileRunnable = RunnableLambda.from(async (input: ProfileExtractionResults) => {
      console.log('[PROFILE AGENT] Profile extraction results:', input);
      const result = await fitnessProfileService.patchProfile(user, 'chat', input);
      console.log('[PROFILE AGENT] Profile patch completed:', {
        updated: result.summary?.reason !== 'No updates detected',
        reason: result.summary?.reason,
        confidence: result.summary?.confidence
      });
      return result;
    })

    const profileUpdateSequence = RunnableSequence.from([
      profileUpdatesRunnable,
      patchProfileRunnable,
    ])

    const profilePatchResult = await profileUpdateSequence.invoke({ message, user });

    return profilePatchResult;
    
  } catch (error) {
    console.error('UserProfileAgent error:', error);
    
    // Return the original profile and user on error
    return {
      user: user,
      summary: {
        source: 'chat',
        reason: 'Error',
        confidence: 0,
      }
    };
  }
};

export const profileAgentRunnable = (config?: AgentConfig) => RunnableLambda.from(async (input: { message: string; user: UserWithProfile }) => {
  return await updateUserProfile(input.message, input.user, config);
});