import type { UserWithProfile } from '@/server/models/userModel';
import type { Microcycle } from '@/server/models/microcycle';
import type { MesocycleOverview, FitnessPlan } from '@/server/models/fitnessPlan';
import type { WorkoutInstance, EnhancedWorkoutInstance } from '@/server/models/workout';
import type { AgentDeps } from '@/server/agents/base';

/**
 * Input for daily workout generator
 */
export interface DailyWorkoutInput {
  user: UserWithProfile;
  date: Date;
  dayPlan: {
    day: string;
    theme: string;
    load?: 'light' | 'moderate' | 'heavy';
    notes?: string;
  };
  microcycle: Microcycle;
  mesocycle: MesocycleOverview;
  fitnessPlan: FitnessPlan;
  recentWorkouts?: WorkoutInstance[];
}

/**
 * Output from daily workout generator
 */
export interface DailyWorkoutOutput {
  workout: EnhancedWorkoutInstance & { date: Date };
  message: string;
  description: string;
  reasoning: string;
}

/**
 * Dependencies for daily workout agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DailyWorkoutAgentDeps extends AgentDeps {
  // Future: Could add exercise database service or workout templates
}
