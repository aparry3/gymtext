import { UserModel, CreateUserData, CreateFitnessProfileData, UserWithProfile } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import type { User, FitnessProfile } from '@/server/models/user/schemas';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { extractGoalsData } from '../agents/profile/goals/chain';
import { extractActivitiesData } from '../agents/profile/activities/chain';
import { extractConstraintsData } from '../agents/profile/constraints/chain';

export interface CreateFitnessProfileRequest {
  fitnessGoals?: string;
  currentExercise?: string;
  injuries?: string;
}

export class FitnessProfileService {
  private static instance: FitnessProfileService;
  private circuitBreaker: CircuitBreaker;

  private constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000 // 1 minute
    });
  }

  public static getInstance(): FitnessProfileService {
    if (!FitnessProfileService.instance) {
      FitnessProfileService.instance = new FitnessProfileService();
    }
    return FitnessProfileService.instance;
  }

  async onboardFitnessProfile(user: UserWithProfile, request: CreateFitnessProfileRequest): Promise<FitnessProfile> {

    const [goals, activities, constraints] = await Promise.all([
        request.fitnessGoals ? extractGoalsData(request.fitnessGoals, user) : Promise.resolve(null),
        request.currentExercise ? extractActivitiesData(request.currentExercise, user) : Promise.resolve(null),
        request.injuries ? extractConstraintsData(request.injuries, user) : Promise.resolve(null)
    ]);

    const fitnessProfileData: CreateFitnessProfileData = {
        goals: goals?.data,
        constraints: constraints?.data,
        activityData: activities?.data,
    };

      // Validate fitness profile data using domain model
      UserModel.validateFitnessProfileData(fitnessProfileData);

      return fitnessProfileData;
    
  }

  async updateFitnessProfile(userId: string, profileData: CreateFitnessProfileData): Promise<FitnessProfile> {
    // const result = await this.circuitBreaker.execute(async () => {
    //   // Validate profile data using domain model
    //   UserModel.validateFitnessProfileData(profileData);
      
    //   // Update using repository
    //   return await this.userRepository.createOrUpdateFitnessProfile(userId, profileData);
    // });
    
    // if (!result) {
    //   throw new Error('Failed to update fitness profile');
    // }
    
    // return result;
  }
}

// Export singleton instance
export const userService = UserService.getInstance();