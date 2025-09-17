import { UserModel, CreateUserData, CreateFitnessProfileData } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import type { User, FitnessProfile } from '@/server/models/user/schemas';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { fitnessProfileService, CreateFitnessProfileRequest } from './fitnessProfileService';

export interface CreateUserRequest {
  name: string;
  phoneNumber: string;
  age?: number;
  gender?: string;
  timezone: string;
  preferredSendHour: number;
  email?: string;
  stripeCustomerId?: string;
  // Fitness profile fields
  fitnessGoals?: string;
  currentExercise?: string;
  injuries?: string;
}

export interface CreateUserResult {
  user: User;
  profile: FitnessProfile;
}

export class UserService {
  private static instance: UserService;
  private userRepository: UserRepository;
  private circuitBreaker: CircuitBreaker;

  private constructor() {
    this.userRepository = new UserRepository();
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000 // 1 minute
    });
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async createUser(request: CreateUserRequest): Promise<CreateUserResult> {
    const result = await this.circuitBreaker.execute(async () => {
      // Check if user already exists using repository
      const existingUser = await this.userRepository.findByPhoneNumber(request.phoneNumber);
      if (existingUser) {
        throw new Error('User already exists with this phone number');
      }

      // Prepare user data
      const userData: CreateUserData = {
        name: request.name,
        phoneNumber: request.phoneNumber,
        age: request.age || null,
        gender: request.gender || null,
        timezone: request.timezone,
        preferredSendHour: request.preferredSendHour,
        email: request.email || null,
        stripeCustomerId: request.stripeCustomerId || null,
      };

      // Validate user data using domain model
      UserModel.validateUserData(userData);

      // Create the user using repository
      const user = await this.userRepository.create(userData);

      // Get user with profile for agent processing
      const userWithProfile = await this.userRepository.findWithProfile(user.id);
      if (!userWithProfile) {
        throw new Error('Failed to retrieve created user');
      }

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
        const fitnessProfileResult = await fitnessProfileService.onboardFitnessProfile(userWithProfile, fitnessProfileRequest);
        
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
      } else {
        // Create default fitness profile if no data provided
        const defaultProfileData = UserModel.createDefaultFitnessProfile();
        UserModel.validateFitnessProfileData(defaultProfileData);
        
        const createdProfile = await this.userRepository.createOrUpdateFitnessProfile(user.id, defaultProfileData);
        if (!createdProfile) {
          throw new Error('Failed to create default fitness profile');
        }
        profile = createdProfile;
      }

      return { user, profile };
    });
    
    if (!result) {
      throw new Error('Failed to create user');
    }
    
    return result;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await this.circuitBreaker.execute(async () => {
      return await this.userRepository.findById(id);
    });
    return result || undefined;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const result = await this.circuitBreaker.execute(async () => {
      return await this.userRepository.findByPhoneNumber(phoneNumber);
    });
    return result || undefined;
  }

  async getUserWithProfile(userId: string) {
    return await this.circuitBreaker.execute(async () => {
      return await this.userRepository.findWithProfile(userId);
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await this.circuitBreaker.execute(async () => {
      // Validate updates using domain model
      UserModel.validateUserUpdates(updates);
      
      // Update using repository
      return await this.userRepository.update(id, updates);
    });
    
    if (!result) {
      throw new Error('Failed to update user');
    }
    
    return result;
  }

  async updateFitnessProfile(userId: string, profileData: CreateFitnessProfileData): Promise<FitnessProfile> {
    const result = await this.circuitBreaker.execute(async () => {
      // Validate profile data using domain model
      UserModel.validateFitnessProfileData(profileData);
      
      // Update using repository
      return await this.userRepository.createOrUpdateFitnessProfile(userId, profileData);
    });
    
    if (!result) {
      throw new Error('Failed to update fitness profile');
    }
    
    return result;
  }
}

// Export singleton instance
export const userService = UserService.getInstance();