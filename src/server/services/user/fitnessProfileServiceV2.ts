/**
 * FitnessProfileService V2 - Markdown-based Profile Management
 *
 * This is the new service that uses Markdown "Living Dossier" profiles
 * with full history tracking instead of JSON profiles.
 *
 * Key changes from V1:
 * - Uses ProfileRepository for Markdown profile storage
 * - Single Profile Update Agent instead of multiple sub-agents
 * - Each update creates a new profile row (history tracking)
 * - Profiles stored as Markdown text, not JSON
 */

import { UserWithProfile } from '@/server/models/userModel';
import { ProfileRepository } from '@/server/repositories/profileRepository';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { createProfileUpdateAgent } from '@/server/agents/profile';
import { createEmptyMarkdownProfile } from '@/server/utils/profile/jsonToMarkdown';
import { formatSignupDataForLLM } from './signupDataFormatter';
import type { SignupData } from '@/server/repositories/onboardingRepository';
import { formatForAI } from '@/shared/utils/date';

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

export class FitnessProfileServiceV2 {
  private static instance: FitnessProfileServiceV2;
  private circuitBreaker: CircuitBreaker;
  private profileRepository: ProfileRepository;

  private constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000 // 1 minute
    });
    this.profileRepository = new ProfileRepository();
  }

  public static getInstance(): FitnessProfileServiceV2 {
    if (!FitnessProfileServiceV2.instance) {
      FitnessProfileServiceV2.instance = new FitnessProfileServiceV2();
    }
    return FitnessProfileServiceV2.instance;
  }

  /**
   * Get the current Markdown profile for a user
   *
   * @param userId - UUID of the user
   * @returns Markdown profile text or null if no profile exists
   */
  async getCurrentProfile(userId: string): Promise<string | null> {
    return await this.profileRepository.getCurrentProfileText(userId);
  }

  /**
   * Create initial fitness profile from signup data
   * Converts signup data to Markdown format and stores it
   *
   * @param user - User to create profile for
   * @param signupData - Onboarding signup data
   * @returns Markdown profile text
   */
  async createFitnessProfile(user: UserWithProfile, signupData: SignupData): Promise<string | null> {
    return this.circuitBreaker.execute<string | null>(async (): Promise<string | null> => {
      try {
        // Format signup data for agent processing
        const formattedData = formatSignupDataForLLM(signupData);

        // Build message from signup data
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

        // Start with empty profile
        const currentProfile = createEmptyMarkdownProfile(user);

        // Use Profile Update Agent to build initial profile from signup data
        const currentDate = formatForAI(new Date(), user.timezone);
        const agent = createProfileUpdateAgent();

        const result = await agent.invoke({
          currentProfile,
          message,
          user,
          currentDate,
        });

        console.log('[FitnessProfileServiceV2] Created initial profile:', {
          wasUpdated: result.wasUpdated,
          summary: result.updateSummary,
        });

        // Store the profile in profiles table
        await this.profileRepository.createProfileForUser(user.id, result.updatedProfile);

        return result.updatedProfile;
      } catch (error) {
        console.error('[FitnessProfileServiceV2] Error creating profile:', error);
        throw error;
      }
    });
  }

  /**
   * Get profile update history for a user
   *
   * @param userId - UUID of the user
   * @param limit - Number of historical profiles to retrieve
   * @returns Array of profile snapshots with timestamps
   */
  async getProfileHistory(userId: string, limit: number = 10) {
    return await this.profileRepository.getProfileHistory(userId, limit);
  }
}

// Export singleton instance
export const fitnessProfileServiceV2 = FitnessProfileServiceV2.getInstance();
