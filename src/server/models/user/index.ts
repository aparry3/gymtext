import { UserRepository } from '@/server/repositories/userRepository';
import type { Users } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';

export type User = Selectable<Users>;
export type NewUser = Insertable<Users>;
export type UserUpdate = Updateable<Users>;

// FitnessProfile is now stored as JSONB in the users table
export interface FitnessProfile {
  version?: number;
  userId?: string;
  
  // Legacy fields for backward compatibility
  fitnessGoals?: string;
  skillLevel?: string;
  exerciseFrequency?: string;
  gender?: string;
  age?: number;
  
  // New comprehensive profile fields
  primaryGoal?: string;
  specificObjective?: string;
  eventDate?: string;
  timelineWeeks?: number;
  experienceLevel?: string;
  
  currentActivity?: string;
  currentTraining?: {
    programName?: string;
    weeksCompleted?: number;
    focus?: string;
    notes?: string;
  };
  
  availability?: {
    daysPerWeek?: number;
    minutesPerSession?: number;
    preferredTimes?: string;
    travelPattern?: string;
    notes?: string;
  };
  
  equipment?: {
    access?: string;
    location?: string;
    items?: string[];
    constraints?: string[];
  };
  
  preferences?: {
    workoutStyle?: string;
    enjoyedExercises?: string[];
    dislikedExercises?: string[];
    coachingTone?: 'friendly' | 'tough-love' | 'clinical' | 'cheerleader';
    musicOrVibe?: string;
  };
  
  metrics?: {
    heightCm?: number;
    bodyweight?: { value: number; unit: 'lbs' | 'kg' };
    bodyFatPercent?: number;
    prLifts?: Record<string, { weight: number; unit: 'lbs' | 'kg'; reps?: number; date?: string }>;
  };
  
  constraints?: Array<{
    id: string;
    type: 'injury' | 'equipment' | 'schedule' | 'mobility' | 'preference' | 'other';
    label: string;
    severity?: 'mild' | 'moderate' | 'severe';
    affectedAreas?: string[];
    modifications?: string;
    startDate?: string;
    endDate?: string;
    status: 'active' | 'resolved';
  }>;
}

export interface UserWithProfile extends User {
  parsedProfile: FitnessProfile | null;
  info: string[];
}

export type CreateUserData = Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateFitnessProfileData = Partial<FitnessProfile>;

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
    this.validateFitnessProfile(profileData);
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
    
    if (!userData.phoneNumber || !this.isValidPhoneNumber(userData.phoneNumber)) {
      throw new Error('Valid phone number is required');
    }
    
    if (userData.email && !this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }
  }

  private validateFitnessProfile(profileData: CreateFitnessProfileData): void {
    // With the new flexible profile structure, validation is more lenient
    // We can add specific validations as needed
    if (profileData.age !== undefined && (profileData.age < 1 || profileData.age > 120)) {
      throw new Error('Age must be between 1 and 120');
    }
    
    if (profileData.skillLevel && !['beginner', 'intermediate', 'advanced'].includes(profileData.skillLevel)) {
      // Allow any skill level for flexibility
      console.warn(`Non-standard skill level: ${profileData.skillLevel}`);
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