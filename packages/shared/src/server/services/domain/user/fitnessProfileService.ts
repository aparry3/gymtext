/**
 * FitnessProfileService - Markdown-based Profile Management
 *
 * This service manages Markdown "Living Dossier" profiles with full history tracking.
 *
 * Key features:
 * - Uses ProfileRepository for Markdown profile storage
 * - Uses SimpleAgentRunner for AI-powered profile creation
 * - Each update creates a new profile row (history tracking)
 * - Profiles stored as Markdown text
 * - Circuit breaker pattern for resilience
 */

import { UserWithProfile } from '@/server/models/user';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { createEmptyProfile } from '@/server/utils/profile/jsonToMarkdown';
import { formatSignupDataForLLM } from './signupDataFormatter';
import type { SignupData } from '@/server/repositories/onboardingRepository';
import { formatForAI } from '@/shared/utils/date';
import type { RepositoryContainer } from '../../../repositories/factory';
import type { SimpleAgentRunnerInstance } from '@/server/agents/runner';

/**
 * Result returned when patching/updating a profile
 */
export interface ProfileUpdateResult {
  /** Updated Markdown profile text */
  profile: string;
  /** Whether the profile was actually updated */
  wasUpdated: boolean;
  /** Summary of changes made. Empty string if nothing was updated. */
  updateSummary: string;
}

/**
 * FitnessProfileServiceInstance interface
 */
export interface FitnessProfileServiceInstance {
  getCurrentProfile(userId: string): Promise<string | null>;
  saveProfile(userId: string, profile: string): Promise<void>;
  createFitnessProfile(user: UserWithProfile, signupData: SignupData): Promise<string | null>;
  getProfileHistory(userId: string, limit?: number): Promise<Array<{ profile: string; createdAt: Date }>>;
}

/**
 * Create a FitnessProfileService instance with injected repositories
 *
 * @param repos - Repository container
 * @param getAgentRunner - Lazy getter for SimpleAgentRunner (created later in factory bootstrap)
 */
export function createFitnessProfileService(
  repos: RepositoryContainer,
  getAgentRunner?: () => SimpleAgentRunnerInstance
): FitnessProfileServiceInstance {
  const circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 60000,
  });

  return {
    async getCurrentProfile(userId: string): Promise<string | null> {
      return await repos.profile.getCurrentProfileText(userId);
    },

    async saveProfile(userId: string, profile: string): Promise<void> {
      try {
        await repos.profile.createProfileForUser(userId, profile);
        console.log(`[FitnessProfileService] Saved profile for user ${userId}`);
      } catch (error) {
        console.error(`[FitnessProfileService] Error saving profile for user ${userId}:`, error);
        throw error;
      }
    },

    async createFitnessProfile(user: UserWithProfile, signupData: SignupData): Promise<string | null> {
      return circuitBreaker.execute<string | null>(async (): Promise<string | null> => {
        try {
          if (!getAgentRunner) {
            throw new Error('agentRunner is required for createFitnessProfile');
          }
          const agentRunner = getAgentRunner();

          const formattedData = formatSignupDataForLLM(signupData);

          const messageParts: string[] = [];

          if (formattedData.fitnessGoals?.trim()) {
            messageParts.push(`***Goals***:\n${formattedData.fitnessGoals.trim()}`);
          }

          if (formattedData.currentExercise?.trim()) {
            messageParts.push(`***Current Activity***:\n${formattedData.currentExercise.trim()}`);
          }

          if (formattedData.environment?.trim()) {
            messageParts.push(`***Training Environment***:\n${formattedData.environment.trim()}`);
          }

          if (formattedData.injuries?.trim()) {
            messageParts.push(`***Injuries or Limitations***:\n${formattedData.injuries.trim()}`);
          }

          const message = messageParts.join('\n\n');
          const currentProfile = createEmptyProfile(user);
          const currentDate = formatForAI(new Date(), user.timezone);

          const result = await agentRunner.invoke('profile:update', {
            input: message,
            context: currentProfile ? [`<Profile>${currentProfile}</Profile>`] : [],
            params: { user, currentDate },
          });

          const updatedProfile = result.response;

          console.log('[FitnessProfileService] Created initial profile via profile:update agent');

          await repos.profile.createProfileForUser(user.id, updatedProfile);

          return updatedProfile;
        } catch (error) {
          console.error('[FitnessProfileService] Error creating profile:', error);
          throw error;
        }
      });
    },

    async getProfileHistory(userId: string, limit: number = 10) {
      return await repos.profile.getProfileHistory(userId, limit);
    },
  };
}

// =============================================================================
