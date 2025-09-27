// Re-export all types and schemas from schemas.ts
export * from './schemas';

// Import what we need for the UserModel class
import type { User, NewUser, FitnessProfile } from './schemas';
import { validateUSPhoneNumber } from '@/shared/utils/phoneUtils';

export type CreateUserData = Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateFitnessProfileData = Partial<FitnessProfile>;

export type UserWithProfile = Omit<User, 'profile'> & {
  profile: FitnessProfile | null;
}

/**
 * UserModel - Domain logic and validation only
 * No direct repository access - Services orchestrate repository calls
 */
export class UserModel {
  static fromDb(user?: User): UserWithProfile | undefined {
    return user ? {
      ...user,
      profile: this.parseProfile(user.profile)
    } : undefined;
  }

  static parseProfile(profile: unknown): FitnessProfile | null {
    if (!profile || (typeof profile === 'object' && Object.keys(profile).length === 0)) {
      return null;
    }
    
    // If it's a string, parse it
    if (typeof profile === 'string') {
      try {
        return JSON.parse(profile) as FitnessProfile;
      } catch {
        return null;
      }
    }
    
    // If it's already an object, return it
    return profile as FitnessProfile;
  }


  /**
   * Validates user data for creation
   * @param userData - User data to validate
   * @throws Error if validation fails
   */
  static validateUserData(userData: CreateUserData): void {
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

  /**
   * Validates fitness profile data
   * @param profileData - Profile data to validate
   * @throws Error if validation fails
   */
  static validateFitnessProfileData(profileData: CreateFitnessProfileData): void {
    // Add fitness profile validation logic here
    if (profileData.goals?.timeline && (profileData.goals.timeline < 1 || profileData.goals.timeline > 104)) {
      throw new Error('Goals timeline must be between 1 and 104 weeks');
    }
    
    if (profileData.availability?.daysPerWeek && (profileData.availability.daysPerWeek < 1 || profileData.availability.daysPerWeek > 7)) {
      throw new Error('Days per week must be between 1 and 7');
    }
    
    if (profileData.availability?.minutesPerSession && (profileData.availability.minutesPerSession < 15 || profileData.availability.minutesPerSession > 240)) {
      throw new Error('Minutes per session must be between 15 and 240');
    }
  }

  /**
   * Validates user update data
   * @param updates - Update data to validate
   * @throws Error if validation fails
   */
  static validateUserUpdates(updates: Partial<User>): void {
    if (updates.name && updates.name.trim().length < 2) {
      throw new Error('User name must be at least 2 characters long');
    }
    
    if (updates.phoneNumber && !validateUSPhoneNumber(updates.phoneNumber)) {
      throw new Error('Valid US phone number is required');
    }
    
    if (updates.email && !this.isValidEmail(updates.email)) {
      throw new Error('Invalid email format');
    }

    if (updates.preferredSendHour !== undefined && (updates.preferredSendHour < 0 || updates.preferredSendHour > 23)) {
      throw new Error('Preferred send hour must be between 0 and 23');
    }

    if (updates.age !== undefined && updates.age !== null && (updates.age < 1 || updates.age > 120)) {
      throw new Error('Age must be between 1 and 120');
    }
  }

  /**
   * Transforms user data for display/serialization
   * @param user - User data from database
   * @returns Transformed user data
   */
  static transformUserForDisplay(user: User): Omit<User, 'profile'> & { hasProfile: boolean } {
    const { profile, ...userWithoutProfile } = user;
    return {
      ...userWithoutProfile,
      hasProfile: Boolean(profile)
    };
  }

  /**
   * Creates default fitness profile data
   * @param goals - Primary fitness goals
   * @returns Default profile structure
   */
  static createDefaultFitnessProfile(goals?: string): CreateFitnessProfileData {
    return {
      goals: {
        primary: goals || 'General fitness improvement',
        timeline: 12
      },
      availability: {
        daysPerWeek: 3,
        minutesPerSession: 60
      },
      equipmentAccess: {
        gymAccess: true
      },
      activities: [],
      constraints: []
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}