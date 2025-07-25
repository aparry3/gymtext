import { BaseRepository } from '@/server/repositories/baseRepository';
import type { 
  User, 
  FitnessProfile, 
  UserWithProfile, 
  CreateUserData, 
  CreateFitnessProfileData 
} from '@/server/models/userModel';

export class UserRepository extends BaseRepository {
  async create(userData: CreateUserData): Promise<User> {
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

  async findById(id: string): Promise<User | undefined> {
    return await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return await this.db
      .selectFrom('users')
      .where('phoneNumber', '=', phoneNumber)
      .selectAll()
      .executeTakeFirst();
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    return await this.db
      .selectFrom('users')
      .where('stripeCustomerId', '=', stripeCustomerId)
      .selectAll()
      .executeTakeFirst();
  }

  async update(id: string, userData: Partial<CreateUserData>): Promise<User> {
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

  async createFitnessProfile(userId: string, profileData: CreateFitnessProfileData): Promise<FitnessProfile> {
    return await this.db
      .insertInto('fitnessProfiles')
      .values({
        userId: userId,
        fitnessGoals: profileData.fitnessGoals,
        skillLevel: profileData.skillLevel,
        exerciseFrequency: profileData.exerciseFrequency,
        gender: profileData.gender,
        age: profileData.age,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow() as FitnessProfile;
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

  async findFitnessProfileByUserId(userId: string): Promise<FitnessProfile | undefined> {
    return await this.db
      .selectFrom('fitnessProfiles')
      .where('userId', '=', userId)
      .selectAll()
      .executeTakeFirst();
  }
}