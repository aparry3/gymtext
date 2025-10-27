import { User, CreateUserInput } from '../../domain/models/User';
import { FitnessProfile, SkillLevel, ExerciseFrequency, Gender } from '../../domain/models/FitnessProfile';
import type { Users, FitnessProfiles } from '@/shared/database/generated/generated';
import type { Selectable, Insertable } from 'kysely';

/**
 * Mapper for converting between database entities and domain models
 */
export class UserMapper {
  /**
   * Convert database user record to domain model
   */
  static toDomain(dbUser: Selectable<Users>): User {
    return new User(
      dbUser.id,
      dbUser.name,
      dbUser.phoneNumber,
      dbUser.email,
      dbUser.stripeCustomerId,
      dbUser.createdAt,
      dbUser.updatedAt
    );
  }

  /**
   * Convert domain model to database insert data
   */
  static toDatabase(input: CreateUserInput): Omit<Insertable<Users>, 'id'> {
    return {
      name: input.name,
      phoneNumber: input.phoneNumber,
      email: input.email ?? null,
      stripeCustomerId: input.stripeCustomerId ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Convert database fitness profile record to domain model
   */
  static fitnessProfileToDomain(dbProfile: Selectable<FitnessProfiles>): FitnessProfile {
    return new FitnessProfile(
      dbProfile.id,
      dbProfile.userId,
      dbProfile.fitnessGoals,
      dbProfile.skillLevel as SkillLevel,
      dbProfile.exerciseFrequency as ExerciseFrequency,
      dbProfile.gender as Gender,
      dbProfile.age,
      dbProfile.createdAt,
      dbProfile.updatedAt
    );
  }

  /**
   * Convert fitness profile input to database insert data
   */
  static fitnessProfileToDatabase(
    input: { userId: string; fitnessGoals: string; skillLevel: SkillLevel; exerciseFrequency: ExerciseFrequency; gender: Gender; age: number }
  ): Omit<Insertable<FitnessProfiles>, 'id'> {
    return {
      userId: input.userId,
      fitnessGoals: input.fitnessGoals,
      skillLevel: input.skillLevel,
      exerciseFrequency: input.exerciseFrequency,
      gender: input.gender,
      age: input.age,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}