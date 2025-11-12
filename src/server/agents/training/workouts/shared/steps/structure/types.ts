import { z } from 'zod';
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
 * Output from structured workout agent
 * Returns the validated workout with date attached
 */
export type StructuredWorkoutOutput<TWorkout = unknown> = TWorkout & { date: Date };
