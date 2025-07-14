import { BaseRepository } from './base.repository';
import {
  User,
  FitnessProfile,
  UserWithProfile,
} from '@/server/types';

export interface CreateUserData {
  name: string;
  phoneNumber: string;
  email?: string | null;
  stripeCustomerId?: string | null;
}

export interface CreateFitnessProfileData {
  userId: string;
  fitnessGoals: string;
  skillLevel: string;
  exerciseFrequency: string;
  gender: string;
  age: number;
}

export interface UpdateUserData {
  name?: string;
  phoneNumber?: string;
  email?: string | null;
  stripeCustomerId?: string | null;
}

export interface UpdateFitnessProfileData {
  fitnessGoals?: string;
  skillLevel?: string;
  exerciseFrequency?: string;
  gender?: string;
  age?: number;
}

export class UserRepository extends BaseRepository {
  async createUser(userData: CreateUserData): Promise<User> {
    return await this.db
      .insertInto('users')
      .values({
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        email: userData.email || null,
        stripeCustomerId: userData.stripeCustomerId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async createFitnessProfile(profileData: CreateFitnessProfileData): Promise<FitnessProfile> {
    return await this.db
      .insertInto('fitnessProfiles')
      .values({
        userId: profileData.userId,
        fitnessGoals: profileData.fitnessGoals,
        skillLevel: profileData.skillLevel,
        exerciseFrequency: profileData.exerciseFrequency,
        gender: profileData.gender,
        age: profileData.age,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
    
    return result || null;
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
    const result = await this.db
      .selectFrom('users')
      .where('stripeCustomerId', '=', stripeCustomerId)
      .selectAll()
      .executeTakeFirst();
    
    return result || null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const result = await this.db
      .selectFrom('users')
      .where('phoneNumber', '=', phoneNumber)
      .selectAll()
      .executeTakeFirst();
    
    return result || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst();
    
    return result || null;
  }

  async findWithProfile(userId: string): Promise<UserWithProfile | null> {
    const user = await this.findById(userId);
    
    if (!user) {
      return null;
    }

    const profile = await this.db
      .selectFrom('fitnessProfiles')
      .where('userId', '=', userId)
      .selectAll()
      .executeTakeFirst();

    return {
      ...user,
      profile: profile || null,
      info: []
    };
  }

  async getUserFitnessProfile(userId: string): Promise<FitnessProfile | null> {
    const profile = await this.db
      .selectFrom('fitnessProfiles')
      .where('userId', '=', userId)
      .selectAll()
      .executeTakeFirst();

    return profile || null;
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    return await this.db
      .updateTable('users')
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateFitnessProfile(userId: string, profileData: UpdateFitnessProfileData): Promise<FitnessProfile> {
    return await this.db
      .updateTable('fitnessProfiles')
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where('userId', '=', userId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteUser(id: string): Promise<void> {
    await this.db
      .deleteFrom('users')
      .where('id', '=', id)
      .execute();
  }

  async deleteFitnessProfile(userId: string): Promise<void> {
    await this.db
      .deleteFrom('fitnessProfiles')
      .where('userId', '=', userId)
      .execute();
  }
}

// Re-export types for backward compatibility
export type { User, FitnessProfile, UserWithProfile } from '@/server/types';