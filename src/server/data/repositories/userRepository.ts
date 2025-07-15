import { BaseRepository } from './baseRepository';
import { User, FitnessProfile, UserWithProfile, CreateUserData, CreateFitnessProfileData } from '@/shared/types/user';
import { UsersTable, FitnessProfilesTable } from '@/shared/types/database';
import { Insertable, Selectable, Updateable } from 'kysely';

export type UserRecord = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

export type FitnessProfileRecord = Selectable<FitnessProfilesTable>;
export type NewFitnessProfile = Insertable<FitnessProfilesTable>;
export type FitnessProfileUpdate = Updateable<FitnessProfilesTable>;

export class UserRepository extends BaseRepository {
  async create(userData: CreateUserData): Promise<User> {
    return await this.db
      .insertInto('users')
      .values({
        name: userData.name,
        phone_number: userData.phone_number,
        email: userData.email || null,
        stripe_customer_id: userData.stripe_customer_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
      .where('phone_number', '=', phoneNumber)
      .selectAll()
      .executeTakeFirst();
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    return await this.db
      .selectFrom('users')
      .where('stripe_customer_id', '=', stripeCustomerId)
      .selectAll()
      .executeTakeFirst();
  }

  async update(id: string, userData: Partial<CreateUserData>): Promise<User> {
    return await this.db
      .updateTable('users')
      .set({
        ...userData,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async createFitnessProfile(profileData: CreateFitnessProfileData): Promise<FitnessProfile> {
    return await this.db
      .insertInto('fitness_profiles')
      .values({
        user_id: profileData.user_id,
        fitness_goals: profileData.fitness_goals,
        skill_level: profileData.skill_level,
        exercise_frequency: profileData.exercise_frequency,
        gender: profileData.gender,
        age: profileData.age,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findWithProfile(userId: string): Promise<UserWithProfile | null> {
    const user = await this.findById(userId);
    
    if (!user) {
      return null;
    }

    const profile = await this.db
      .selectFrom('fitness_profiles')
      .where('user_id', '=', userId)
      .selectAll()
      .executeTakeFirst();

    return {
      ...user,
      profile: profile || null,
      info: []
    };
  }
}