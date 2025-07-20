import { User, CreateUserInput, UpdateUserInput } from '../models/User';
import { FitnessProfile, CreateFitnessProfileInput, UpdateFitnessProfileInput } from '../models/FitnessProfile';

/**
 * Repository interface for User domain
 * This interface defines the contract for data access operations
 */
export interface IUserRepository {
  /**
   * Create a new user
   */
  create(input: CreateUserInput): Promise<User>;

  /**
   * Find a user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by phone number
   */
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;

  /**
   * Find a user by Stripe customer ID
   */
  findByStripeCustomerId(stripeCustomerId: string): Promise<User | null>;

  /**
   * Update a user
   */
  update(id: string, input: UpdateUserInput): Promise<User>;

  /**
   * Delete a user
   */
  delete(id: string): Promise<void>;

  /**
   * Create a fitness profile for a user
   */
  createFitnessProfile(input: CreateFitnessProfileInput): Promise<FitnessProfile>;

  /**
   * Find a fitness profile by user ID
   */
  findFitnessProfileByUserId(userId: string): Promise<FitnessProfile | null>;

  /**
   * Update a fitness profile
   */
  updateFitnessProfile(id: string, input: UpdateFitnessProfileInput): Promise<FitnessProfile>;

  /**
   * Find a user with their fitness profile
   */
  findUserWithProfile(userId: string): Promise<{ user: User; profile: FitnessProfile | null } | null>;
}