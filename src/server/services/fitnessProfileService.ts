import { UserModel, UserWithProfile } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import type { User, FitnessProfile } from '@/server/models/user/schemas';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { createGoalsAgent } from '../agents/profile/goals/chain';
import { createActivitiesAgent } from '../agents/profile/activities/chain';
import { createConstraintsAgent } from '../agents/profile/constraints/chain';
// import { createUserAgent } from '../agents/profile/user/chain';
// import { createEnvironmentAgent } from '../agents/profile/environment/chain';
// import { createMetricsAgent } from '../agents/profile/metrics/chain';

export interface CreateFitnessProfileRequest {
  fitnessGoals?: string;
  currentExercise?: string;
  injuries?: string;
}


export class FitnessProfileService {
  private static instance: FitnessProfileService;
  private circuitBreaker: CircuitBreaker;
  private userRepository: UserRepository;

  private constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000 // 1 minute
    });
    this.userRepository = new UserRepository();
  }

  public static getInstance(): FitnessProfileService {
    if (!FitnessProfileService.instance) {
      FitnessProfileService.instance = new FitnessProfileService();
    }
    return FitnessProfileService.instance;
  }

  /**
   * Service method to patch a user's fitness profile using extracted data
   * Returns the updated profile after applying changes to the database
   */
  private async patchProfile(
    userId: string,
    profileUpdates: Partial<FitnessProfile>,
    userUpdates: Partial<User> = {},
    reason: string,
    confidence: number
  ): Promise<FitnessProfile> {
    const CONFIDENCE_THRESHOLD = 0.75;
    
    if (confidence < CONFIDENCE_THRESHOLD) {
      console.log(`Profile update skipped - low confidence: ${confidence} < ${CONFIDENCE_THRESHOLD}`);
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
        const updatedProfile = await this.userRepository.createOrUpdateFitnessProfile(userId, profileUpdates);
        console.log(`Profile update applied:`, {
          confidence,
          reason,
          fieldsUpdated: Object.keys(profileUpdates)
        });
        return updatedProfile;
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
   */
  async onboardFitnessProfile(user: UserWithProfile, request: CreateFitnessProfileRequest): Promise<FitnessProfile | null> {
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

      // Build profile updates from successful extractions
      const profileUpdates: Partial<FitnessProfile> = {};
      const userUpdates: Partial<User> = {};
      const allFieldsUpdated: string[] = [];
      const reasons: string[] = [];
      let maxConfidence = 0;

      // Process goals
      if (goalsResult.hasData && goalsResult.data && goalsResult.confidence > 0.5) {
        profileUpdates.goals = goalsResult.data;
        allFieldsUpdated.push('goals');
        reasons.push(goalsResult.reason);
        maxConfidence = Math.max(maxConfidence, goalsResult.confidence);
      }

      // Process activities
      if (activitiesResult.hasData && activitiesResult.data && activitiesResult.confidence > 0.5) {
        profileUpdates.activityData = activitiesResult.data;
        allFieldsUpdated.push('activityData');
        reasons.push(activitiesResult.reason);
        maxConfidence = Math.max(maxConfidence, activitiesResult.confidence);
      }

      // Process constraints
      if (constraintsResult.hasData && constraintsResult.data && constraintsResult.confidence > 0.5) {
        profileUpdates.constraints = constraintsResult.data;
        allFieldsUpdated.push('constraints');
        reasons.push(constraintsResult.reason);
        maxConfidence = Math.max(maxConfidence, constraintsResult.confidence);
      }

      // Apply updates using the patch service method
      if (Object.keys(profileUpdates).length > 0 || Object.keys(userUpdates).length > 0) {
        return await this.patchProfile(
          user.id,
          profileUpdates,
          userUpdates,
          reasons.join('; '),
          maxConfidence
        );
      }

      return user.profile!;
  }

  async createFitnessProfile(user: UserWithProfile, request: CreateFitnessProfileRequest): Promise<FitnessProfile | null> {
    return this.circuitBreaker.execute<FitnessProfile>(async (): Promise<FitnessProfile> => {

      // Prepare fitness profile request from form data
      const fitnessProfileRequest: CreateFitnessProfileRequest = {
        fitnessGoals: request.fitnessGoals,
        currentExercise: request.currentExercise,
        injuries: request.injuries,
      };

      // Check if we have any fitness profile data to process
      const hasFitnessData = Object.values(fitnessProfileRequest).some(value => value && value.trim());

      let profile: FitnessProfile;

      if (hasFitnessData) {
        // Use fitness profile service to process text fields and create profile
        const fitnessProfileResult = await fitnessProfileService.onboardFitnessProfile(user, fitnessProfileRequest);
        
        // If fitness profile service returns null (circuit breaker open), create default profile
        if (!fitnessProfileResult) {
          const defaultProfileData = UserModel.createDefaultFitnessProfile();
          UserModel.validateFitnessProfileData(defaultProfileData);
          
          const createdProfile = await this.userRepository.createOrUpdateFitnessProfile(user.id, defaultProfileData);
          if (!createdProfile) {
            throw new Error('Failed to create fallback fitness profile');
          }
          profile = createdProfile;
        } else {
          profile = fitnessProfileResult;
        }
      } else if (!user.profile) {
        // Create default fitness profile if no data provided
        const defaultProfileData = UserModel.createDefaultFitnessProfile();
        UserModel.validateFitnessProfileData(defaultProfileData);
        
        const createdProfile = await this.userRepository.createOrUpdateFitnessProfile(user.id, defaultProfileData);
        if (!createdProfile) {
          throw new Error('Failed to create default fitness profile');
        }
        profile = createdProfile;
      } else {
        profile = user.profile;
      }
      return profile;
    });
  }
    
}

// Export singleton instance
export const fitnessProfileService = FitnessProfileService.getInstance();