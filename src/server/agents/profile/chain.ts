// Import the new modular architecture
import { extractGoalsData, goalsRunnable } from './goals/chain';
import type { FitnessProfile } from '../../models/user/schemas';
import type { UserWithProfile } from '../../models/userModel';
import type { ProfileAgentResult, ProfileExtractionResults } from './types';
import { AgentConfig } from '../base';
import { RunnableLambda, RunnableMap, RunnableSequence } from '@langchain/core/runnables';
import { activitiesRunnable } from './activities/chain';
import { metricsRunnable } from './metrics/chain';
import { constraintsRunnable } from './constraints/chain';
import { environmentRunnable } from './environment/chain';
import { userRunnable } from './user/chain';


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
    const profileUpdatesRunnable = RunnableMap.from({
      goals: goalsRunnable(config),
      activities: activitiesRunnable(config),
      metrics: metricsRunnable(config),
      constraints: constraintsRunnable(config),
      environment: environmentRunnable(config),
      user: userRunnable(config)
    })

    const patchProfileRunnable = RunnableLambda.from(async (input: ProfileExtractionResults) => {
      return await patchProfile();
    })

    const profileUpdateSequence = RunnableSequence.from([
      profileUpdatesRunnable,
      patchProfileRunnable,
    ])
    

    const responses = await profileUpdatesRunnable.invoke({ message, user });

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
