import type { AgentDeps } from '@/server/agents/base';
import type { WorkoutChainResult } from '../../shared';

/**
/**
 * Output from workout generation
 * Uses shared WorkoutChainResult type for consistency
 */
export type WorkoutGenerateOutput = WorkoutChainResult;

/**
 * Dependencies for workout generate agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WorkoutGenerateAgentDeps extends AgentDeps {
  // Future: Could add exercise database service or workout templates
}
