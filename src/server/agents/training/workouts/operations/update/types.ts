import type { AgentDeps } from '@/server/agents/base';
import type { BaseWorkoutChainInput, WorkoutChainResult } from '../../shared';
import type { WorkoutInstance } from '@/server/models/workout';

/**
 * Input for workout update
 * Updates an existing workout based on user constraints
 */
export interface WorkoutUpdateInput extends BaseWorkoutChainInput {
  workout: WorkoutInstance;
  changeRequest: string;
}

/**
 * Output from workout update
 * Uses shared WorkoutChainResult type for consistency
 */
export type WorkoutUpdateOutput = WorkoutChainResult & {
  wasModified?: boolean;
  modifications?: string;
};

/**
 * Dependencies for workout update agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WorkoutUpdateAgentDeps extends AgentDeps {
  // Future: Could add context or history services
}
