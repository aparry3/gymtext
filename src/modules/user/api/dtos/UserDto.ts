/**
 * DTOs for User API layer
 * These are the data structures exposed to external consumers
 */

/**
 * User response DTO
 */
export interface UserResponseDto {
  id: string;
  name: string;
  phoneNumber: string;
  email: string | null;
  hasStripeCustomer: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fitness profile response DTO
 */
export interface FitnessProfileResponseDto {
  id: string;
  userId: string;
  fitnessGoals: string;
  skillLevel: string;
  exerciseFrequency: string;
  gender: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * User with profile response DTO
 */
export interface UserWithProfileResponseDto {
  user: UserResponseDto;
  profile: FitnessProfileResponseDto | null;
  hasCompletedOnboarding: boolean;
}

/**
 * Create user request DTO
 */
export interface CreateUserRequestDto {
  name: string;
  phoneNumber: string;
  email?: string | null;
}

/**
 * Update user request DTO
 */
export interface UpdateUserRequestDto {
  name?: string;
  phoneNumber?: string;
  email?: string | null;
}

/**
 * Create/Update fitness profile request DTO
 */
export interface CreateFitnessProfileRequestDto {
  fitnessGoals: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  exerciseFrequency: '1-2_per_week' | '3_per_week' | '4+_per_week';
  gender: 'male' | 'female' | 'other';
  age: number;
}