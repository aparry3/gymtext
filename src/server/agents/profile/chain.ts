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
import { ProfilePatchResult } from '@/server/services/fitnessProfileService';

/**
 * Callback type for patching profile
 * Services inject this to avoid circular dependencies
 */
export type PatchProfileCallback = (
  user: UserWithProfile,
  source: string,
  results: ProfileExtractionResults
) => Promise<ProfilePatchResult>;

/**
 * Dependencies for Profile Agent (DI)
 */
export interface ProfileAgentDeps {
  patchProfile: PatchProfileCallback;
  config?: AgentConfig;
}


/**
 * UserProfileAgent - Extracts and updates user profile information (Phase 4 - Pass-through)
 *
 * This agent analyzes user messages for fitness-related information
 * and returns updated partial profile objects using pure functions
 *
 * @param deps - Dependencies injected by the service (patchProfile callback)
 * @returns Runnable that can be composed with other runnables
 */
export const createProfileAgent = (deps: ProfileAgentDeps) => {
  return RunnableLambda.from(async (input: { message: string; user: UserWithProfile }) => {
    try {
      console.log('[PROFILE AGENT] Starting profile extraction for message:', input.message.substring(0, 50) + (input.message.length > 50 ? '...' : ''));

      const profileUpdatesRunnable = RunnableMap.from({
        goals: goalsRunnable(deps.config),
        activities: activitiesRunnable(deps.config),
        constraints: constraintsRunnable(deps.config),
        environment: environmentRunnable(deps.config),
        user: userRunnable(deps.config)
      })

      const patchProfileRunnable = RunnableLambda.from(async (extractionResults: ProfileExtractionResults) => {
        console.log('[PROFILE AGENT] Profile extraction results:', extractionResults);
        // Use injected callback instead of direct service import
        const result = await deps.patchProfile(input.user, 'chat', extractionResults);
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

      const profilePatchResult = await profileUpdateSequence.invoke({ message: input.message, user: input.user });

      return profilePatchResult;

    } catch (error) {
      console.error('UserProfileAgent error:', error);

      // Return the original profile and user on error
      return {
        user: input.user,
        summary: {
          source: 'chat',
          reason: 'Error',
          confidence: 0,
        }
      };
    }
  });
};

/**
 * Legacy wrapper for backward compatibility
 * @deprecated Use createProfileAgent instead
 */
export const profileAgentRunnable = () => {
  throw new Error('profileAgentRunnable is deprecated. Use createProfileAgent with dependencies injection instead.');
};