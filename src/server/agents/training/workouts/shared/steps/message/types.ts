import { AgentConfig } from '@/server/agents/base';
import type { WorkoutGenerationOutput } from '@/server/models/workout/schema/openAISchema';

/**
 * Configuration for workout message agent
 * Static configuration passed at agent creation time
 */
export interface WorkoutMessageConfig {
  operationName?: string;
  agentConfig?: AgentConfig;
}

/**
 * Input for workout message agent
 * Runtime context passed through the chain
 */
export interface WorkoutMessageInput {
  workout: WorkoutGenerationOutput;
}

/**
 * Output from workout message agent
 * Returns an SMS-formatted workout message string
 */
export type WorkoutMessageOutput = string;
