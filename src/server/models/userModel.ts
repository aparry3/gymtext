import { UserRepository } from '@/server/repositories/userRepository';
import type { Users, FitnessProfiles } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';

export type User = Selectable<Users>;
export type NewUser = Insertable<Users>;
export type UserUpdate = Updateable<Users>;

export type FitnessProfile = Selectable<FitnessProfiles>;
export type NewFitnessProfile = Insertable<FitnessProfiles>;
export type FitnessProfileUpdate = Updateable<FitnessProfiles>;

export interface UserWithProfile extends User {
  profile: FitnessProfile | null;
  info: string[];
}
export type CreateUserData = Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateFitnessProfileData = Omit<NewFitnessProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;


export interface UserWithProfile extends User {
  profile: FitnessProfile | null;
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

  async createFitnessProfile(userId: string, profileData: CreateFitnessProfileData): Promise<FitnessProfile> {
    // Business logic for fitness profile creation
    this.validateFitnessProfile(profileData);
    return await this.userRepository.createFitnessProfile(userId, profileData);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    // Business logic for user updates
    return await this.userRepository.update(id, updates);
  }

  private validateUserData(userData: CreateUserData): void {
    if (!userData.name || userData.name.trim().length < 2) {
      throw new Error('User name must be at least 2 characters long');
    }
    
    if (!userData.phoneNumber || !this.isValidPhoneNumber(userData.phoneNumber)) {
      throw new Error('Valid phone number is required');
    }
    
    if (userData.email && !this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }
  }

  private validateFitnessProfile(profileData: CreateFitnessProfileData): void {
    if (!profileData.skillLevel || !['beginner', 'intermediate', 'advanced'].includes(profileData.skillLevel)) {
      throw new Error('Valid skill level is required');
    }
    
    if (!profileData.fitnessGoals || profileData.fitnessGoals.length === 0) {
      throw new Error('At least one fitness goal is required');
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation - can be enhanced
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}