import { UserWithProfile } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import { ProfileUpdateRepository, NewProfileUpdate } from '@/server/repositories/profileUpdateRepository';
import { ProfileRepository } from '@/server/repositories/profileRepository';
import type { User, FitnessProfile } from '@/server/models/user/schemas';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { convertJsonProfileToMarkdown } from '@/server/utils/profile/jsonToMarkdown';


export interface CreateFitnessProfileRequest {
  fitnessGoals?: string;
  currentExercise?: string;
  environment?: string;
  injuries?: string;
}

export interface ProfilePatchOptions {
  source: string;
  reason: string;
  confidence: number;
  path?: string;
}

type UpdateMetadata = {
  source: string;
  reason: string;
  confidence: number;
}
type ExtractedUpdates = {
  profile: Partial<FitnessProfile>;
  user: Partial<User>;
  metadata: UpdateMetadata;
}

export type ProfilePatchResult = {
  user: UserWithProfile;
  summary: ProfilePatchOptions;
}

export class FitnessProfileService {
  private static instance: FitnessProfileService;
  private circuitBreaker: CircuitBreaker;
  private userRepository: UserRepository;
  private profileUpdateRepository: ProfileUpdateRepository;
  private profileRepository: ProfileRepository;

  private constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000 // 1 minute
    });
    this.userRepository = new UserRepository();
    this.profileUpdateRepository = new ProfileUpdateRepository();
    this.profileRepository = new ProfileRepository();
  }

  public static getInstance(): FitnessProfileService {
    if (!FitnessProfileService.instance) {
      FitnessProfileService.instance = new FitnessProfileService();
    }
    return FitnessProfileService.instance;
  }

  /**
   * Service method to patch a user's fitness profile using extracted data
   * Applies updates and stores patch information for audit trail
   * Returns the updated profile after applying changes to the database
   */
  private async applyPatches(
    user: UserWithProfile,
    updates: ExtractedUpdates
  ): Promise<UserWithProfile> {
    const CONFIDENCE_THRESHOLD = 0.75;
    
    if (updates.metadata.confidence < CONFIDENCE_THRESHOLD) {
      console.log(`Profile update skipped - low confidence: ${updates.metadata.confidence} < ${CONFIDENCE_THRESHOLD}`);
      // Return current profile without changes
      return user;
    }

    try {
      // Update user demographics first if needed
      if (Object.keys(updates.user).length > 0) {
        await this.userRepository.update(user.id, updates.user);
      }

      // Update profile if there are profile updates
      if (Object.keys(updates.profile).length > 0) {
        // Use the repository's patchProfile method for atomic JSONB merge
        const updatedUserWithProfile = await this.userRepository.patchProfile(user.id, updates.profile);
        
        if (!updatedUserWithProfile?.profile) {
          throw new Error('Failed to update fitness profile');
        }

        // Store the patch in profile_updates table for audit trail
        const updateRecord: NewProfileUpdate = {
          userId: user.id,
          patch: JSON.parse(JSON.stringify(updates.profile)), // Ensure it's a plain object
          source: updates.metadata.source,
          reason: updates.metadata.reason,
          path: null,
        };

        await this.profileUpdateRepository.create(updateRecord);

        console.log(`Profile update applied:`, {
          confidence: updates.metadata.confidence,
          reason: updates.metadata.reason,
          source: updates.metadata.source,
          fieldsUpdated: Object.keys(updates.profile)
        });
        
        return updatedUserWithProfile;
      }

      return user;

    } catch (error) {
      console.error('Profile patch error:', error);
      throw new Error(`Profile update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current Markdown profile for a user
   * Handles fallback to JSON conversion during migration period
   *
   * @param userId - UUID of the user
   * @returns Markdown profile text or null if no profile exists
   */
  async getCurrentMarkdownProfile(userId: string): Promise<string | null> {
    try {
      // Try to get Markdown profile from profiles table
      const markdownProfile = await this.profileRepository.getCurrentProfileText(userId);
      if (markdownProfile) {
        return markdownProfile;
      }

      // Fallback: Convert JSON profile if exists (migration compatibility)
      const user = await this.userRepository.findWithProfile(userId);
      if (user?.profile) {
        console.log(`[FitnessProfileService] Converting JSON profile to Markdown for user ${userId}`);
        return convertJsonProfileToMarkdown(user.profile, user);
      }

      return null;
    } catch (error) {
      console.error(`[FitnessProfileService] Error getting Markdown profile for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Save updated Markdown profile
   * Creates new row in profiles table for history tracking
   *
   * @param userId - UUID of the user
   * @param markdownProfile - Complete Markdown profile text
   */
  async saveMarkdownProfile(userId: string, markdownProfile: string): Promise<void> {
    try {
      await this.profileRepository.createProfileForUser(userId, markdownProfile);
      console.log(`[FitnessProfileService] Saved Markdown profile for user ${userId}`);
    } catch (error) {
      console.error(`[FitnessProfileService] Error saving Markdown profile for user ${userId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const fitnessProfileService = FitnessProfileService.getInstance();