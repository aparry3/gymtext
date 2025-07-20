import { IUserService } from '../../domain/interfaces/IUserService';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User, CreateUserInput, UpdateUserInput } from '../../domain/models/User';
import { FitnessProfile, CreateFitnessProfileInput } from '../../domain/models/FitnessProfile';

/**
 * Implementation of IUserService
 * Contains business logic for user operations
 */
export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async registerUser(input: CreateUserInput): Promise<User> {
    // Check if user already exists with phone number
    const existingUser = await this.userRepository.findByPhoneNumber(input.phoneNumber);
    if (existingUser) {
      throw new Error('User with this phone number already exists');
    }

    // Create new user
    return await this.userRepository.create(input);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User> {
    const user = await this.userRepository.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new Error(`User with phone number ${phoneNumber} not found`);
    }
    return user;
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    // Verify user exists
    await this.getUserById(id);

    // If updating phone number, check it's not already taken
    if (input.phoneNumber) {
      const existingUser = await this.userRepository.findByPhoneNumber(input.phoneNumber);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Phone number is already in use');
      }
    }

    return await this.userRepository.update(id, input);
  }

  async createOrUpdateFitnessProfile(
    userId: string, 
    input: Omit<CreateFitnessProfileInput, 'userId'>
  ): Promise<FitnessProfile> {
    // Verify user exists
    await this.getUserById(userId);

    // Check if profile already exists
    const existingProfile = await this.userRepository.findFitnessProfileByUserId(userId);
    
    if (existingProfile) {
      // Update existing profile
      return await this.userRepository.updateFitnessProfile(existingProfile.id, input);
    } else {
      // Create new profile
      const createInput: CreateFitnessProfileInput = {
        ...input,
        userId
      };
      return await this.userRepository.createFitnessProfile(createInput);
    }
  }

  async getUserWithProfile(userId: string): Promise<{ user: User; profile: FitnessProfile | null }> {
    const result = await this.userRepository.findUserWithProfile(userId);
    if (!result) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return result;
  }

  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const profile = await this.userRepository.findFitnessProfileByUserId(userId);
    return profile !== null;
  }
}