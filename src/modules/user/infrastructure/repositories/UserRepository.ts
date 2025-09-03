import { Kysely } from 'kysely';
import type { DB } from '@/shared/database/generated/generated';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User, CreateUserInput, UpdateUserInput } from '../../domain/models/User';
import { FitnessProfile, CreateFitnessProfileInput, UpdateFitnessProfileInput } from '../../domain/models/FitnessProfile';
import { UserMapper } from '../mappers/UserMapper';

/**
 * Implementation of IUserRepository using Kysely
 */
export class UserRepository implements IUserRepository {
  constructor(private db: Kysely<DB>) {}

  async create(input: CreateUserInput): Promise<User> {
    const dbData = UserMapper.toDatabase(input);
    const result = await this.db
      .insertInto('users')
      .values(dbData)
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return UserMapper.toDomain(result);
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
    
    return result ? UserMapper.toDomain(result) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const result = await this.db
      .selectFrom('users')
      .where('phoneNumber', '=', phoneNumber)
      .selectAll()
      .executeTakeFirst();
    
    return result ? UserMapper.toDomain(result) : null;
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
    const result = await this.db
      .selectFrom('users')
      .where('stripeCustomerId', '=', stripeCustomerId)
      .selectAll()
      .executeTakeFirst();
    
    return result ? UserMapper.toDomain(result) : null;
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const updateData: any = {
      updatedAt: new Date()
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.stripeCustomerId !== undefined) updateData.stripeCustomerId = input.stripeCustomerId;

    const result = await this.db
      .updateTable('users')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return UserMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .deleteFrom('users')
      .where('id', '=', id)
      .execute();
  }

  async createFitnessProfile(input: CreateFitnessProfileInput): Promise<FitnessProfile> {
    const dbData = UserMapper.fitnessProfileToDatabase(input);
    const result = await this.db
      .insertInto('fitnessProfiles')
      .values(dbData)
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return UserMapper.fitnessProfileToDomain(result);
  }

  async findFitnessProfileByUserId(userId: string): Promise<FitnessProfile | null> {
    const result = await this.db
      .selectFrom('fitnessProfiles')
      .where('userId', '=', userId)
      .selectAll()
      .executeTakeFirst();
    
    return result ? UserMapper.fitnessProfileToDomain(result) : null;
  }

  async updateFitnessProfile(id: string, input: UpdateFitnessProfileInput): Promise<FitnessProfile> {
    const updateData: any = {
      updatedAt: new Date()
    };

    if (input.fitnessGoals !== undefined) updateData.fitnessGoals = input.fitnessGoals;
    if (input.skillLevel !== undefined) updateData.skillLevel = input.skillLevel;
    if (input.exerciseFrequency !== undefined) updateData.exerciseFrequency = input.exerciseFrequency;
    if (input.gender !== undefined) updateData.gender = input.gender;
    if (input.age !== undefined) updateData.age = input.age;

    const result = await this.db
      .updateTable('fitnessProfiles')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return UserMapper.fitnessProfileToDomain(result);
  }

  async findUserWithProfile(userId: string): Promise<{ user: User; profile: FitnessProfile | null } | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const profile = await this.findFitnessProfileByUserId(userId);
    return { user, profile };
  }
}