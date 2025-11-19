import type { AgentDeps } from '@/server/agents/base';
import type { BaseWorkoutChainInput, WorkoutChainResult } from '../../shared';
import type { WorkoutInstance } from '@/server/models/workout';

/**
 * Input for workout modification
 * Modifies an existing workout based on user constraints
 */
export interface ModifyWorkoutInput extends BaseWorkoutChainInput {
  workout: WorkoutInstance;
  changeRequest: string;
}

/**
 * Output from workout modification
 * Uses shared WorkoutChainResult type for consistency
 */
export type ModifyWorkoutOutput = WorkoutChainResult & {
  wasModified?: boolean;
  modifications?: string;
};

/**
 * Dependencies for workout modification agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModifyWorkoutAgentDeps extends AgentDeps {
  // Future: Could add context or history services
}
