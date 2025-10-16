import { UserWithProfile } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import { ProfileUpdateRepository, NewProfileUpdate } from '@/server/repositories/profileUpdateRepository';
import type { User, FitnessProfile } from '@/server/models/user/schemas';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { updateUserProfile } from '../agents/profile/chain';
import { ProfileExtractionResults } from '../agents/profile/types';


export interface CreateFitnessProfileRequest {
  fitnessGoals?: string;
  currentExercise?: string;
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

  private constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000 // 1 minute
    });
    this.userRepository = new UserRepository();
    this.profileUpdateRepository = new ProfileUpdateRepository();
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

  async createFitnessProfile(user: UserWithProfile, request: CreateFitnessProfileRequest): Promise<FitnessProfile | null> {
    return this.circuitBreaker.execute<FitnessProfile | null>(async (): Promise<FitnessProfile | null> => {
      // Check if we have any fitness profile data to process
      const hasFitnessData = Object.values(request).some(value => value && value.trim());

      if (!hasFitnessData) {
        return null;
      }

      // Build a formatted message from all the request fields
      const messageParts: string[] = [];

      if (request.fitnessGoals?.trim()) {
        messageParts.push(`***Goals***:\n${request.fitnessGoals.trim()}`);
      }

      if (request.currentExercise?.trim()) {
        messageParts.push(`***Current Activity***:\n${request.currentExercise.trim()}`);
      }

      if (request.injuries?.trim()) {
        messageParts.push(`***Injuries or Limitations***:\n${request.injuries.trim()}`);
      }

      const message = messageParts.join('\n\n');

      // Use the unified profile agent to extract and update the profile
      const result = await updateUserProfile(message, user);

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
}

// Export singleton instance
export const fitnessProfileService = FitnessProfileService.getInstance();