import { UserWithProfile } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import { ProfileUpdateRepository, NewProfileUpdate } from '@/server/repositories/profileUpdateRepository';
import type { User, FitnessProfile } from '@/server/models/user/schemas';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { createGoalsAgent } from '../agents/profile/goals/chain';
import { createActivitiesAgent } from '../agents/profile/activities/chain';
import { createConstraintsAgent } from '../agents/profile/constraints/chain';
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

  /**
   * Main onboarding method that processes fitness profile information using sub-agents
   * Returns profile updates and metadata for patch operations
   */
  async extractFitnessProfile(user: UserWithProfile, request: CreateFitnessProfileRequest): Promise<Partial<ProfileExtractionResults> | null> {
      // Initialize all agents
      const goalsAgent = createGoalsAgent();
      const activitiesAgent = createActivitiesAgent();
      const constraintsAgent = createConstraintsAgent();
      // const environmentAgent = createEnvironmentAgent();
      // const metricsAgent = createMetricsAgent();

      // Prepare messages for each agent based on request data
      const messages = {
        goals: request.fitnessGoals,
        activities: request.currentExercise,
        constraints: request.injuries,
      };

      // Run all agents in parallel for efficiency
      const [goalsResult, activitiesResult, constraintsResult] = await Promise.all([
        messages.goals ? goalsAgent({ message: messages.goals, user }) : Promise.resolve({ data: null, hasData: false, confidence: 0, reason: 'No goals data provided' } as const),
        messages.activities ? activitiesAgent({ message: messages.activities, user }) : Promise.resolve({ data: null, hasData: false, confidence: 0, reason: 'No activities data provided' } as const),
        messages.constraints ? constraintsAgent({ message: messages.constraints, user }) : Promise.resolve({ data: null, hasData: false, confidence: 0, reason: 'No constraints data provided' } as const),
      ]);

      const results = {
        goals: {
          hasData: goalsResult.hasData,
          confidence: goalsResult.confidence,
          reason: goalsResult.reason,
          data: goalsResult.data
        },
        activities: {
          hasData: activitiesResult.hasData,
          confidence: activitiesResult.confidence,
          reason: activitiesResult.reason,
          data: activitiesResult.data
        },
        constraints: {
          hasData: constraintsResult.hasData,
          confidence: constraintsResult.confidence,
          reason: constraintsResult.reason,
          data: constraintsResult.data
        }
      }
      // Log agent results for debugging
      console.log('Agent results:', results);

      return results;

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

      // Prepare fitness profile request from form data
      const fitnessProfileRequest: CreateFitnessProfileRequest = {
        fitnessGoals: request.fitnessGoals,
        currentExercise: request.currentExercise,
        injuries: request.injuries,
      };

      // Check if we have any fitness profile data to process
      const hasFitnessData = Object.values(fitnessProfileRequest).some(value => value && value.trim());

      if (hasFitnessData) {
        // Use onboard method to process text fields and get updates
        const onboardResult = await this.extractFitnessProfile(user, fitnessProfileRequest);
        
        if (!onboardResult) {
          throw new Error('Failed to extract fitness profile data');
        }

        const updatedUser = await this.patchProfile(user, 'onboarding', onboardResult);

        return updatedUser.user.profile;
      } 
      return null;
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