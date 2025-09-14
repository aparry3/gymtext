// Re-export all types and schemas from schemas.ts
export * from './schemas';

// Import what we need for the UserModel class
import { UserRepository } from '@/server/repositories/userRepository';
import type { User, NewUser, FitnessProfile } from './schemas';
import { validateUSPhoneNumber } from '@/shared/utils/phoneUtils';

export type CreateUserData = Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateFitnessProfileData = Partial<FitnessProfile>;

export interface UserWithProfile extends User {
  parsedProfile: FitnessProfile | null;
  info: string[];
}

export class UserModel {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: CreateUserData): Promise<User> {
    // Business logic for user creation
    this.validateUserData(userData);
    return await this.userRepository.create(userData);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return await this.userRepository.findById(id);
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    return await this.userRepository.findByPhoneNumber(phoneNumber);
  }

  async getUserWithProfile(userId: string): Promise<UserWithProfile | undefined> {
    const result = await this.userRepository.findWithProfile(userId);
    return result ?? undefined;
  }

  async createOrUpdateFitnessProfile(userId: string, profileData: CreateFitnessProfileData): Promise<FitnessProfile> {
    // Business logic for fitness profile creation/update
    // this.validateFitnessProfile(profileData); // Commented out - validation handled by Zod schemas
    return await this.userRepository.createOrUpdateFitnessProfile(userId, profileData);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    // Business logic for user updates
    return await this.userRepository.update(id, updates);
  }

  private validateUserData(userData: CreateUserData): void {
    if (!userData.name || userData.name.trim().length < 2) {
      throw new Error('User name must be at least 2 characters long');
    }
    
    if (!userData.phoneNumber || !validateUSPhoneNumber(userData.phoneNumber)) {
      throw new Error('Valid US phone number is required');
    }
    
    if (userData.email && !this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }
  }

  // Phone validation is now handled by phoneUtils.validateUSPhoneNumber

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}