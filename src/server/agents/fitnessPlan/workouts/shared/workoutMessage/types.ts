import type { LongFormWorkout } from '@/server/models/workout/schema';

/**
 * Configuration for workout message agent
 * Static configuration passed at agent creation time
 */
export interface WorkoutMessageConfig {
  operationName?: string;
}

/**
 * Input for workout message agent
 * Runtime context passed through the chain
 */
export interface WorkoutMessageInput {
  longFormWorkout: LongFormWorkout;
}

/**
 * Output from workout message agent
 * Returns an SMS-formatted workout message string
 */
export type WorkoutMessageOutput = string;
