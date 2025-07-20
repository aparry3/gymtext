import { User, CreateUserInput, UpdateUserInput } from '../models/User';
import { FitnessProfile, CreateFitnessProfileInput, UpdateFitnessProfileInput } from '../models/FitnessProfile';

/**
 * Service interface for User domain
 * This interface defines the business logic operations
 */
export interface IUserService {
  /**
   * Register a new user
   */
  registerUser(input: CreateUserInput): Promise<User>;

  /**
   * Get user by ID
   */
  getUserById(id: string): Promise<User>;

  /**
   * Get user by phone number
   */
  getUserByPhoneNumber(phoneNumber: string): Promise<User>;

  /**
   * Update user information
   */
  updateUser(id: string, input: UpdateUserInput): Promise<User>;

  /**
   * Create or update fitness profile for a user
   */
  createOrUpdateFitnessProfile(userId: string, input: Omit<CreateFitnessProfileInput, 'userId'>): Promise<FitnessProfile>;

  /**
   * Get user with their fitness profile
   */
  getUserWithProfile(userId: string): Promise<{ user: User; profile: FitnessProfile | null }>;

  /**
   * Check if user has completed onboarding (has a fitness profile)
   */
  hasCompletedOnboarding(userId: string): Promise<boolean>;
}