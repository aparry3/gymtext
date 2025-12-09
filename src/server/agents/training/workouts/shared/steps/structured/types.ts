import type { AgentConfig } from '@/server/agents/base';
import type { WorkoutStructure } from '@/server/agents/training/schemas';

/**
 * Configuration for structured workout agent
 * Static configuration passed at agent creation time
 */
export interface StructuredWorkoutConfig {
  operationName?: string;
  agentConfig?: AgentConfig;
}

/**
 * Input for structured workout agent
 * Runtime context passed through the chain
 */
export interface StructuredWorkoutInput {
  description: string;
}

/**
 * Output from structured workout agent
 * Returns a structured WorkoutStructure object
 */
export type StructuredWorkoutOutput = WorkoutStructure;

// Re-export for convenience
export type { WorkoutStructure };
