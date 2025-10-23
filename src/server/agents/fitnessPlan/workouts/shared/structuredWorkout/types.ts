import { z } from 'zod';
import type { UserWithProfile } from '@/server/models/userModel';
import type { LongFormWorkout } from '@/server/models/workout/schema';
import type { AgentConfig } from '@/server/agents/base';

/**
 * Configuration for structured workout agent
 * Static configuration passed at agent creation time
 */
export interface StructuredWorkoutConfig<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  schema: TSchema;
  includeModifications: boolean;
  operationName: string;
  agentConfig?: AgentConfig;
}

/**
 * Input for structured workout agent
 * Runtime context passed through the chain
 */
export interface StructuredWorkoutInput {
  longFormWorkout: LongFormWorkout;
  user: UserWithProfile;
  fitnessProfile: string;
  workoutDate: Date;
}

/**
 * Output from structured workout agent
 * Returns the validated workout with date attached
 */
export type StructuredWorkoutOutput<TWorkout = unknown> = TWorkout & { date: Date };
