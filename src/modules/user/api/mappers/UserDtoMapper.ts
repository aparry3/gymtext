import { User, CreateUserInput } from '../../domain/models/User';
import { FitnessProfile, SkillLevel, ExerciseFrequency, Gender } from '../../domain/models/FitnessProfile';
import {
  UserResponseDto,
  FitnessProfileResponseDto,
  UserWithProfileResponseDto,
  CreateUserRequestDto,
  CreateFitnessProfileRequestDto
} from '../dtos/UserDto';

/**
 * Mapper for converting between domain models and API DTOs
 */
export class UserDtoMapper {
  /**
   * Convert User domain model to response DTO
   */
  static toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
      hasStripeCustomer: user.hasStripeCustomer(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  /**
   * Convert FitnessProfile domain model to response DTO
   */
  static toFitnessProfileResponse(profile: FitnessProfile): FitnessProfileResponseDto {
    return {
      id: profile.id,
      userId: profile.userId,
      fitnessGoals: profile.fitnessGoals,
      skillLevel: profile.skillLevel,
      exerciseFrequency: profile.exerciseFrequency,
      gender: profile.gender,
      age: profile.age,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    };
  }

  /**
   * Convert User with profile to response DTO
   */
  static toUserWithProfileResponse(
    user: User, 
    profile: FitnessProfile | null
  ): UserWithProfileResponseDto {
    return {
      user: this.toUserResponse(user),
      profile: profile ? this.toFitnessProfileResponse(profile) : null,
      hasCompletedOnboarding: profile !== null
    };
  }

  /**
   * Convert create user request DTO to domain input
   */
  static fromCreateUserRequest(dto: CreateUserRequestDto): CreateUserInput {
    return {
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      email: dto.email
    };
  }

  /**
   * Convert fitness profile request DTO to domain input
   */
  static fromCreateFitnessProfileRequest(dto: CreateFitnessProfileRequestDto) {
    return {
      fitnessGoals: dto.fitnessGoals,
      skillLevel: dto.skillLevel as SkillLevel,
      exerciseFrequency: dto.exerciseFrequency as ExerciseFrequency,
      gender: dto.gender as Gender,
      age: dto.age
    };
  }
}