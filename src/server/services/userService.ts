import { UserModel, CreateUserData, CreateFitnessProfileData } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import type { User, FitnessProfile } from '@/server/models/user/schemas';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';

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

      // TODO: Add service layer for profile parsing and creation
      // For now, create basic fitness profile from form data or use default
      const fitnessProfileData: CreateFitnessProfileData = request.fitnessGoals || request.currentExercise || request.injuries
        ? {
            goals: {
              primary: request.fitnessGoals || '',
              timeline: 12 // Default 12 weeks
            },
            availability: {
              daysPerWeek: 3, // Default value - TODO: parse from text fields
              minutesPerSession: 60 // Default value - TODO: parse from text fields
            },
            equipmentAccess: {
              gymAccess: true // Default assumption - TODO: parse from text fields
            },
            constraints: request.injuries ? [{
              id: crypto.randomUUID(),
              type: 'injury' as const,
              description: request.injuries,
              status: 'active' as const
            }] : [],
            activityData: [] // Start with empty activity data
          }
        : UserModel.createDefaultFitnessProfile(request.fitnessGoals);

      // Validate fitness profile data using domain model
      UserModel.validateFitnessProfileData(fitnessProfileData);

      // Create fitness profile using repository
      const profile = await this.userRepository.createOrUpdateFitnessProfile(user.id, fitnessProfileData);
      if (!profile) {
        throw new Error('Failed to create fitness profile');
      }

      // TODO: Additional service layer calls:
      // - Parse text fields for structured data extraction
      // - Generate initial fitness plan
      // - Send welcome message

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