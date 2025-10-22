import { z } from 'zod';
import type { UserWithProfile } from '@/server/models/userModel';
import type { LongFormWorkout } from '@/server/models/workout/schema';

/**
 * Input for structured workout agent
 */
export interface StructuredWorkoutInput<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  longFormWorkout: LongFormWorkout;
  user: UserWithProfile;
  fitnessProfile: string;
  structuredSchema: TSchema;
  workoutDate: Date;
  operationName: string;
}

/**
 * Output from structured workout agent
 * Returns the validated workout with date attached
 */
export type StructuredWorkoutOutput<TWorkout = unknown> = TWorkout & { date: Date };
