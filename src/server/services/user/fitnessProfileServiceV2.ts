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
import { UserRepository } from '@/server/repositories/userRepository';
import { ProfileRepository } from '@/server/repositories/profileRepository';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { createProfileUpdateAgent } from '@/server/agents/profileUpdate';
import type { ProfileUpdateOutput } from '@/server/agents/profileUpdate';
import { convertJsonProfileToMarkdown, createEmptyMarkdownProfile } from '@/server/utils/profile/jsonToMarkdown';
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
  /** Summary of changes made */
  updateSummary?: string;
}

export class FitnessProfileServiceV2 {
  private static instance: FitnessProfileServiceV2;
  private circuitBreaker: CircuitBreaker;
  private userRepository: UserRepository;
  private profileRepository: ProfileRepository;

  private constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000 // 1 minute
    });
    this.userRepository = new UserRepository();
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
   * Falls back to converting JSON profile if Markdown doesn't exist yet
   *
   * @param userId - UUID of the user
   * @returns Markdown profile text or null if no profile exists
   */
  async getCurrentProfile(userId: string): Promise<string | null> {
    // Try to get Markdown profile from new profiles table
    const markdownProfile = await this.profileRepository.getCurrentProfileText(userId);

    if (markdownProfile) {
      return markdownProfile;
    }

    // Fallback: Check if user has old JSON profile
    const user = await this.userRepository.findWithProfile(userId);
    if (user?.profile) {
      console.log('[FitnessProfileServiceV2] Found JSON profile, converting to Markdown');
      // Convert JSON to Markdown (migration helper)
      return convertJsonProfileToMarkdown(user.profile, user);
    }

    return null;
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
   * Update/patch a user's profile based on a message
   * Uses the Profile Update Agent to handle the update
   *
   * @param user - User whose profile to update
   * @param message - User message that may contain profile updates
   * @returns Profile update result
   */
  async updateProfileFromMessage(
    user: UserWithProfile,
    message: string
  ): Promise<ProfileUpdateResult> {
    return this.circuitBreaker.execute<ProfileUpdateResult>(async (): Promise<ProfileUpdateResult> => {
      try {
        // Get current profile (or empty)
        const currentProfile = await this.getCurrentProfile(user.id) || createEmptyMarkdownProfile(user);

        // Get current date for temporal reasoning
        const currentDate = formatForAI(new Date(), user.timezone);

        // Use Profile Update Agent
        const agent = createProfileUpdateAgent();
        const result: ProfileUpdateOutput = await agent.invoke({
          currentProfile,
          message,
          user,
          currentDate,
        });

        console.log('[FitnessProfileServiceV2] Profile update result:', {
          wasUpdated: result.wasUpdated,
          summary: result.updateSummary,
        });

        // If profile was updated, save new version to database
        if (result.wasUpdated) {
          await this.profileRepository.createProfileForUser(user.id, result.updatedProfile);
          console.log('[FitnessProfileServiceV2] Saved updated profile to database');
        }

        return {
          profile: result.updatedProfile,
          wasUpdated: result.wasUpdated,
          updateSummary: result.updateSummary,
        };
      } catch (error) {
        console.error('[FitnessProfileServiceV2] Error updating profile:', error);
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

  /**
   * Migrate a user's JSON profile to Markdown format
   * This is a helper method for the migration process
   *
   * @param userId - UUID of the user
   * @returns True if migration was performed, false if already migrated or no profile
   */
  async migrateUserToMarkdown(userId: string): Promise<boolean> {
    try {
      // Check if already has Markdown profile
      const hasMarkdownProfile = await this.profileRepository.hasProfile(userId);
      if (hasMarkdownProfile) {
        console.log(`[FitnessProfileServiceV2] User ${userId} already has Markdown profile`);
        return false;
      }

      // Get JSON profile
      const user = await this.userRepository.findWithProfile(userId);
      if (!user?.profile) {
        console.log(`[FitnessProfileServiceV2] User ${userId} has no profile to migrate`);
        return false;
      }

      // Convert to Markdown
      const markdownProfile = convertJsonProfileToMarkdown(user.profile, user);

      // Save to profiles table
      await this.profileRepository.createProfileForUser(userId, markdownProfile);

      console.log(`[FitnessProfileServiceV2] Successfully migrated user ${userId} to Markdown profile`);
      return true;
    } catch (error) {
      console.error(`[FitnessProfileServiceV2] Error migrating user ${userId}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const fitnessProfileServiceV2 = FitnessProfileServiceV2.getInstance();
