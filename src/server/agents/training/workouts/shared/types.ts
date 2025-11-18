import { UserWithProfile } from '@/server/models/userModel';

/**
 * Base input for all workout operations
 */
export interface BaseWorkoutChainInput {
  user: UserWithProfile;
  date: Date;
}

/**
 * Runtime context that flows through the workout chain
 * Contains all dynamic data needed by downstream agents
 */
export interface WorkoutChainContext extends BaseWorkoutChainInput {
  description: string;
  fitnessProfile: string;
}

/**
 * Result type from workout chain execution
 */
export interface WorkoutChainResult {
  formatted: string;
  message: string;
  description: string;
}
