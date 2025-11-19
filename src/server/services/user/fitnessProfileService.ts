import { UserWithProfile } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import { ProfileUpdateRepository, NewProfileUpdate } from '@/server/repositories/profileUpdateRepository';
import { ProfileRepository } from '@/server/repositories/profileRepository';
import type { User, FitnessProfile } from '@/server/models/user/schemas';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { createProfileAgent } from '../../agents/profile/chain';
import { ProfileExtractionResults } from '../../agents/profile/types';
import { formatSignupDataForLLM } from './signupDataFormatter';
import type { SignupData } from '@/server/repositories/onboardingRepository';
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


  private consolidateResults(source: string, results: Partial<ProfileExtractionResults>): ExtractedUpdates | null {
      // Build profile updates from successful extractions
      const profileUpdates: Partial<FitnessProfile> = {};
      const userUpdates: Partial<User> = {};
      const allFieldsUpdated: string[] = [];
      const reasons: string[] = [];
      let maxConfidence = 0;

      // Process goals
      if (results.goals && results.goals.hasData && results.goals.data && results.goals.confidence > 0.5) {
        profileUpdates.goals = results.goals.data;
        allFieldsUpdated.push('goals');
        reasons.push(results.goals.reason);
        maxConfidence = Math.max(maxConfidence, results.goals.confidence);
      }

      // Process activities
      if (results.activities && results.activities.hasData && results.activities.data && results.activities.confidence > 0.5) {
        profileUpdates.activities = results.activities.data;
        allFieldsUpdated.push('activities');
        reasons.push(results.activities.reason);
        maxConfidence = Math.max(maxConfidence, results.activities.confidence);

        // Extract overall experience level from activities agent
        if (results.activities.overallExperience) {
          profileUpdates.experienceLevel = results.activities.overallExperience;
          allFieldsUpdated.push('experienceLevel');
        }
      }

      // Process constraints
      if (results.constraints && results.constraints.hasData && results.constraints.data && results.constraints.confidence > 0.5) {
        profileUpdates.constraints = results.constraints.data;
        allFieldsUpdated.push('constraints');
        reasons.push(results.constraints.reason);
        maxConfidence = Math.max(maxConfidence, results.constraints.confidence);
      }

      // Process user data (flat structure)
      if (results.user && results.user.hasData && results.user.data && results.user.confidence > 0.5) {
        // Directly assign the flat user data, filtering out undefined values
        Object.assign(userUpdates, results.user.data);
        
        allFieldsUpdated.push('user');
        reasons.push(results.user.reason);
        maxConfidence = Math.max(maxConfidence, results.user.confidence);
      }

      // Process environment data
      if (results.environment && results.environment.hasData && results.environment.data && results.environment.confidence > 0.5) {
        if (results.environment.data.equipmentAccess) {
          profileUpdates.equipmentAccess = results.environment.data.equipmentAccess;
        }
        if (results.environment.data.availability) {
          profileUpdates.availability = results.environment.data.availability;
        }
        allFieldsUpdated.push('environment');
        reasons.push(results.environment.reason);
        maxConfidence = Math.max(maxConfidence, results.environment.confidence);
      }

      // Return null if no updates were extracted
      if (Object.keys(profileUpdates).length === 0 && Object.keys(userUpdates).length === 0) {
        return null;
      }

      // Return the updates and options for patching
      return {
        profile: profileUpdates,
        user: userUpdates,
        metadata: {
          source: source,
          reason: reasons.join(', '),
          confidence: maxConfidence,
        }
      };
  }

  /**
   * Build baseline profile from structured signup data
   * Maps direct fields that don't require LLM extraction
   *
   * @param signupData - Raw signup data from onboarding form
   * @returns Partial profile with baseline fields populated
   */
  private buildBaselineProfile(signupData: SignupData): Partial<FitnessProfile> {
    const baselineProfile: Partial<FitnessProfile> = {};

    // Direct mapping: experience level
    if (signupData.experienceLevel) {
      baselineProfile.experienceLevel = signupData.experienceLevel;
      console.log(`[FitnessProfileService] Setting baseline experienceLevel: ${signupData.experienceLevel}`);
    }

    // Direct mapping: primary goal (from first item in array)
    if (signupData.primaryGoals && signupData.primaryGoals.length > 0) {
      baselineProfile.goals = {
        primary: signupData.primaryGoals[0],
        summary: signupData.goalsElaboration || null,
        timeline: null,
        specific: null,
        motivation: null
      };
      console.log(`[FitnessProfileService] Setting baseline goal: ${signupData.primaryGoals[0]}`);
    }

    return baselineProfile;
  }

  async createFitnessProfile(user: UserWithProfile, signupData: SignupData): Promise<FitnessProfile | null> {
    return this.circuitBreaker.execute<FitnessProfile | null>(async (): Promise<FitnessProfile | null> => {
      // STEP 1: Build and apply baseline profile from structured signup data
      const baselineProfile = this.buildBaselineProfile(signupData);

      // Apply baseline profile immediately if we have any data
      if (Object.keys(baselineProfile).length > 0) {
        await this.userRepository.patchProfile(user.id, baselineProfile);
        console.log('[FitnessProfileService] Applied baseline profile from signup data');
      }

      // STEP 2: Format ALL signup data for LLM using existing formatter
      const formattedData = formatSignupDataForLLM(signupData);

      // Check if we have any fitness profile data to process
      const hasFitnessData = Object.values(formattedData).some(value => value && value.trim());

      if (!hasFitnessData) {
        console.log('[FitnessProfileService] No additional fitness data to extract');
        // Return the baseline profile we just created
        const userWithBaseline = await this.userRepository.findWithProfile(user.id);
        return userWithBaseline?.profile || null;
      }

      // STEP 3: Build formatted message for agent (existing logic)
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

      // STEP 4: Reload user with baseline profile
      const userWithBaseline = await this.userRepository.findWithProfile(user.id);
      if (!userWithBaseline) {
        throw new Error('Failed to reload user after baseline profile creation');
      }

      // STEP 5: Run profile agent to enhance/merge with baseline
      const profileAgent = createProfileAgent({
        patchProfile: this.patchProfile.bind(this),
      });

      console.log('[FitnessProfileService] Running profile agent to enhance baseline');
      const result = await profileAgent.invoke({
        message,
        user: userWithBaseline  // Agent now sees baseline + formatted text
      });

      return result.user.profile;
    });
  }

  public async patchProfile(user: UserWithProfile, source: string,results: Partial<ProfileExtractionResults>): Promise<ProfilePatchResult> {
    const updates = this.consolidateResults(source, results);
    if (!updates) {
      return {
        user: user,
        summary: {
          source: source,
          reason: 'No updates were extracted',
          confidence: 0,
        }
      };
    }
    // Apply the profile patch using the extracted updates
    const updatedUser = await this.applyPatches(
      user,
      updates
    );
    return {
      user: updatedUser,
      summary: updates.metadata
    };
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