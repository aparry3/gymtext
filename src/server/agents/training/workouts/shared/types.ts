import { UserWithProfile } from '@/server/models/userModel';
import type { WorkoutStructure } from '@/server/agents/training/schemas';

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
  // Optional metadata from update operation (tracks if workout was modified)
  wasModified?: boolean;
  modifications?: string;
}

/**
 * Result type from workout chain execution
 */
export interface WorkoutChainResult {
  formatted: string;
  message: string;
  description: string;
  structure?: WorkoutStructure;
}