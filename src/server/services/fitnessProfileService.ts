import { UserWithProfile } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import { ProfileUpdateRepository, NewProfileUpdate } from '@/server/repositories/profileUpdateRepository';
import type { User, FitnessProfile } from '@/server/models/user/schemas';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { createGoalsAgent } from '../agents/profile/goals/chain';
import { createActivitiesAgent } from '../agents/profile/activities/chain';
import { createConstraintsAgent } from '../agents/profile/constraints/chain';
import { ProfileExtractionResults } from '../agents/profile/types';
// import { createUserAgent } from '../agents/profile/user/chain';
// import { createEnvironmentAgent } from '../agents/profile/environment/chain';
// import { createMetricsAgent } from '../agents/profile/metrics/chain';

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

type ExtractedUpdates = {
  profile: Partial<FitnessProfile>;
  user: Partial<User>;
  metadata: {
    source: string;
    reason: string;
    confidence: number;
    path: string;
  }
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
  public async patchProfile(
    userId: string,
    profileUpdates: Partial<FitnessProfile>,
    options: ProfilePatchOptions,
    userUpdates: Partial<User> = {}
  ): Promise<FitnessProfile> {
    const CONFIDENCE_THRESHOLD = 0.75;
    
    if (options.confidence < CONFIDENCE_THRESHOLD) {
      console.log(`Profile update skipped - low confidence: ${options.confidence} < ${CONFIDENCE_THRESHOLD}`);
      // Return current profile without changes
      const userWithProfile = await this.userRepository.findWithProfile(userId);
      if (!userWithProfile?.profile) {
        throw new Error('Unable to retrieve current profile');
      }
      return userWithProfile.profile;
    }

    try {
      // Update user demographics first if needed
      if (Object.keys(userUpdates).length > 0) {
        await this.userRepository.update(userId, userUpdates);
      }

      // Update profile if there are profile updates
      if (Object.keys(profileUpdates).length > 0) {
        // Use the repository's patchProfile method for atomic JSONB merge
        const updatedUserWithProfile = await this.userRepository.patchProfile(userId, profileUpdates);
        
        if (!updatedUserWithProfile?.profile) {
          throw new Error('Failed to update fitness profile');
        }

        // Store the patch in profile_updates table for audit trail
        const updateRecord: NewProfileUpdate = {
          userId,
          patch: JSON.parse(JSON.stringify(profileUpdates)), // Ensure it's a plain object
          source: options.source,
          reason: options.reason,
          path: options.path || null,
        };

        await this.profileUpdateRepository.create(updateRecord);

        console.log(`Profile update applied:`, {
          confidence: options.confidence,
          reason: options.reason,
          source: options.source,
          fieldsUpdated: Object.keys(profileUpdates)
        });
        
        return updatedUserWithProfile.profile;
      }

      // If no profile updates, return current profile
      const userWithProfile = await this.userRepository.findWithProfile(userId);
      if (!userWithProfile?.profile) {
        throw new Error('Unable to retrieve current profile');
      }
      return userWithProfile.profile;

    } catch (error) {
      console.error('Profile patch error:', error);
      throw new Error(`Profile update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Main onboarding method that processes fitness profile information using sub-agents
   * Returns profile updates and metadata for patch operations
   */
  async onboardFitnessProfile(user: UserWithProfile, request: CreateFitnessProfileRequest): Promise<ExtractedUpdates | null> {
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

      return this.consolidateResults(results);

  }

  private consolidateResults(results: Partial<ProfileExtractionResults>): ExtractedUpdates | null {
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

      // Return null if no updates were extracted
      if (Object.keys(profileUpdates).length === 0 && Object.keys(userUpdates).length === 0) {
        return null;
      }

      // Return the updates and options for patching
      return {
        profile: profileUpdates,
        user: userUpdates,
        metadata: {
          source: 'fitness_profile_onboarding',
          reason: reasons.join(', '),
          confidence: maxConfidence,
          path: 'onboarding'
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
        const onboardResult = await this.onboardFitnessProfile(user, fitnessProfileRequest);
        
        if (!onboardResult) {
          throw new Error('Failed to extract fitness profile data');
        }

        // Apply the profile patch using the extracted updates
        const updatedProfile = await this.patchProfile(
          user.id,
          onboardResult.profile,
          onboardResult.metadata,
          onboardResult.user
        );
        
        return updatedProfile;
      } 
      return null;
    });
  }
    
}

// Export singleton instance
export const fitnessProfileService = FitnessProfileService.getInstance();