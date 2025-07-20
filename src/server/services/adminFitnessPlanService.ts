import { UserRepository } from '@/server/repositories/userRepository';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import type { 
  UserFitnessPlanData, 
  FitnessPlanDetails,
  UserFitnessPlanSearchResponse 
} from '@/shared/types/admin';

export class AdminFitnessPlanService {
  private userRepository: UserRepository;
  private fitnessPlanRepository: FitnessPlanRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.fitnessPlanRepository = new FitnessPlanRepository();
  }

  async searchUserFitnessPlans(phoneNumber: string): Promise<UserFitnessPlanData | null> {
    // Find user by phone number
    const user = await this.userRepository.findByPhoneNumber(phoneNumber);
    
    if (!user) {
      return null;
    }

    // Get user's fitness profile
    const fitnessProfile = await this.userRepository.findFitnessProfileByUserId(user.id);

    // Get all fitness plans with full hierarchy
    const fitnessPlans = await this.fitnessPlanRepository.getFitnessPlansByUserId(user.id);

    return {
      user,
      fitnessProfile: fitnessProfile || null,
      fitnessPlans
    };
  }

  async getFitnessPlanDetails(planId: string): Promise<FitnessPlanDetails | null> {
    // Get the fitness plan with full hierarchy
    const fitnessPlan = await this.fitnessPlanRepository.getFitnessPlanWithFullHierarchy(planId);
    
    if (!fitnessPlan) {
      return null;
    }

    // Get the user who owns this plan
    const user = await this.userRepository.findById(fitnessPlan.clientId);
    
    if (!user) {
      return null;
    }

    // Get user's fitness profile
    const fitnessProfile = await this.userRepository.findFitnessProfileByUserId(user.id);

    return {
      ...fitnessPlan,
      user,
      fitnessProfile: fitnessProfile || null
    };
  }

  async formatSearchResponse(data: UserFitnessPlanData | null): Promise<UserFitnessPlanSearchResponse | null> {
    if (!data) {
      return null;
    }

    return {
      user: {
        id: data.user.id,
        name: data.user.name,
        phoneNumber: data.user.phoneNumber,
        email: data.user.email
      },
      fitnessProfile: data.fitnessProfile,
      fitnessPlans: data.fitnessPlans
    };
  }
}