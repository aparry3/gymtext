import type { AgentDeps } from '@/server/agents/base';
import type { BaseWorkoutChainInput, WorkoutChainResult } from '../../shared';

/**
 * Input for daily workout generator
 * Uses the new comprehensive Mesocycle format with full metadata
 * dayPlan is now a simple string overview from the microcycle's day overview fields
 */
export interface DailyWorkoutInput extends BaseWorkoutChainInput {
  dayOverview: string;       // The daily training overview from the microcycle
  isDeload: boolean;         // True/false flag
}

/**
 * Output from daily workout generator
 * Uses shared WorkoutChainResult type for consistency
 */
export type DailyWorkoutOutput = WorkoutChainResult;

/**
 * Dependencies for daily workout agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DailyWorkoutAgentDeps extends AgentDeps {
  // Future: Could add exercise database service or workout templates
}
