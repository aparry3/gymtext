import type { UserWithProfile } from '@/server/models/userModel';
import type { LongFormWorkout } from '@/server/models/workout/schema';

/**
 * Input for workout message agent
 */
export interface WorkoutMessageInput {
  longFormWorkout: LongFormWorkout;
  user: UserWithProfile;
  operationName?: string;
}

/**
 * Output from workout message agent
 * Returns an SMS-formatted workout message string
 */
export type WorkoutMessageOutput = string;
