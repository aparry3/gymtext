/**
 * FitnessProfileService - Markdown-based Profile Management
 *
 * This service manages Markdown "Living Dossier" profiles with full history tracking.
 *
 * Key features:
 * - Uses ProfileRepository for Markdown profile storage
 * - Single Profile Update Agent for AI-powered profile creation
 * - Each update creates a new profile row (history tracking)
 * - Profiles stored as Markdown text
 * - Circuit breaker pattern for resilience
 */

import { UserWithProfile } from '@/server/models/userModel';
import { ProfileRepository } from '@/server/repositories/profileRepository';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { createProfileUpdateAgent, type StructuredProfile } from '@/server/agents/profile';
import { createEmptyProfile } from '@/server/utils/profile/jsonToMarkdown';
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

export class FitnessProfileService {
  private static instance: FitnessProfileService;
  private circuitBreaker: CircuitBreaker;
  private profileRepository: ProfileRepository;

  private constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000, // 1 minute
    });
    this.profileRepository = new ProfileRepository();
  }

  public static getInstance(): FitnessProfileService {
    if (!FitnessProfileService.instance) {
      FitnessProfileService.instance = new FitnessProfileService();
    }
    return FitnessProfileService.instance;
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
   * Save updated profile
   * Creates new row in profiles table for history tracking
   *
   * @param userId - UUID of the user
   * @param profile - Complete profile text
   */
  async saveProfile(userId: string, profile: string): Promise<void> {
    try {
      await this.profileRepository.createProfileForUser(userId, profile);
      console.log(`[FitnessProfileService] Saved profile for user ${userId}`);
    } catch (error) {
      console.error(`[FitnessProfileService] Error saving profile for user ${userId}:`, error);
      throw error;
    }
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
        const currentProfile = createEmptyProfile(user);

        // Use Profile Update Agent to build initial profile from signup data
        const currentDate = formatForAI(new Date(), user.timezone);
        const agent = createProfileUpdateAgent({ model: 'gpt-5.1' });

        const result = await agent.invoke({
          currentProfile,
          message,
          user,
          currentDate,
        });

        console.log('[FitnessProfileService] Created initial profile:', {
          wasUpdated: result.wasUpdated,
          summary: result.updateSummary,
          hasStructured: result.structured !== null,
        });

        // Store profile with structured data
        await this.profileRepository.createProfileWithStructured(
          user.id,
          result.updatedProfile,
          result.structured
        );

        return result.updatedProfile;
      } catch (error) {
        console.error('[FitnessProfileService] Error creating profile:', error);
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

  // ============================================
  // Structured Profile Methods
  // ============================================

  /**
   * Save updated profile with structured data
   * Creates new row in profiles table for history tracking
   *
   * @param userId - UUID of the user
   * @param profile - Complete profile text (Markdown)
   * @param structured - Structured profile data (or null)
   */
  async saveProfileWithStructured(
    userId: string,
    profile: string,
    structured: StructuredProfile | null
  ): Promise<void> {
    try {
      await this.profileRepository.createProfileWithStructured(userId, profile, structured);
      console.log(`[FitnessProfileService] Saved profile with structured data for user ${userId}`);
    } catch (error) {
      console.error(`[FitnessProfileService] Error saving profile for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get current structured profile data
   *
   * @param userId - UUID of the user
   * @returns Structured profile data or null if not available
   */
  async getCurrentStructuredProfile(userId: string): Promise<StructuredProfile | null> {
    return await this.profileRepository.getCurrentStructuredProfile(userId);
  }
}

// Export singleton instance
export const fitnessProfileService = FitnessProfileService.getInstance();
