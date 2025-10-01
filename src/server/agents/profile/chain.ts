// Import the new modular architecture
import { goalsRunnable } from './goals/chain';
import type { UserWithProfile } from '../../models/userModel';
import type { ProfileExtractionResults } from './types';
import { AgentConfig } from '../base';
import { RunnableLambda, RunnableMap, RunnableSequence } from '@langchain/core/runnables';
import { activitiesRunnable } from './activities/chain';
import { metricsRunnable } from './metrics/chain';
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
    const profileUpdatesRunnable = RunnableMap.from({
      goals: goalsRunnable(config),
      activities: activitiesRunnable(config),
      metrics: metricsRunnable(config),
      constraints: constraintsRunnable(config),
      environment: environmentRunnable(config),
      user: userRunnable(config)
    })

    const patchProfileRunnable = RunnableLambda.from(async (input: ProfileExtractionResults) => {
      return await fitnessProfileService.patchProfile(user, 'chat', input);
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