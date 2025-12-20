// Re-export types from shared (Zod schemas and inferred types)
export * from '@/shared/types/user';

// Import Kysely DB types
import type { Users } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';

// Kysely-based types (using database schema)
export type User = Selectable<Users>;
export type NewUser = Insertable<Users>;
export type UserUpdate = Updateable<Users>;

// Import what we need for the UserModel class
import type { FitnessProfile } from '@/shared/types/user';
import { validateUSPhoneNumber } from '@/shared/utils/phoneUtils';

export type CreateUserData = Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateFitnessProfileData = Partial<FitnessProfile>;

export type UserWithProfile = User & {
  profile?: string | null; // Joined from profiles table
}

/**
 * UserModel - Domain logic and validation only
 * No direct repository access - Services orchestrate repository calls
 */
export class UserModel {
  static fromDb(user?: User): UserWithProfile | undefined {
    return user ? { ...user } : undefined;
  }

  /**
   * Convert DB result with joined profile to UserWithProfile
   * Used when fetching user with profiles table joined
   */
  static fromDbWithProfile(dbResult: any): UserWithProfile { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { profile, ...userData } = dbResult;
    return {
      ...userData,
      profile: profile || null,
    };
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

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
