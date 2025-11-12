import type { z } from 'zod';
import type { Microcycle } from '@/server/models/microcycle';
import type { Mesocycle, FitnessPlan } from '@/server/models/fitnessPlan';
import type { WorkoutInstance } from '@/server/models/workout';
import type { GeminiEnhancedWorkoutInstanceSchema } from '@/server/models/workout/schema';
import type { AgentDeps } from '@/server/agents/base';
import type { BaseWorkoutChainInput, WorkoutChainResult } from '../../../shared';

/**
 * Input for daily workout generator
 * Uses the new comprehensive Mesocycle format with full metadata
 */
export interface DailyWorkoutInput extends BaseWorkoutChainInput {
  dayPlan: {
    day: string;
    theme: string;
    load?: 'light' | 'moderate' | 'heavy' | null;
    notes?: string | null;
  };
  microcycle: Microcycle;
  mesocycle: Mesocycle;
  fitnessPlan: FitnessPlan;
  recentWorkouts?: WorkoutInstance[];
}

/**
 * Output from daily workout generator
 * Uses shared WorkoutChainResult type for consistency
 * Note: Uses z.infer to get base type without date (WorkoutChainResult adds the date)
 */
export type DailyWorkoutOutput = WorkoutChainResult<z.infer<typeof GeminiEnhancedWorkoutInstanceSchema>>;

/**
 * Dependencies for daily workout agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DailyWorkoutAgentDeps extends AgentDeps {
  // Future: Could add exercise database service or workout templates
}
