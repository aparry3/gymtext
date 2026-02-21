import type { WorkoutStructure } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/user';
import type { ExperienceLevel } from '@/server/models/profile';
import type { WorkoutData } from '../../orchestration/trainingService';

// Re-export for convenience
export type { WorkoutStructure };

// =============================================================================
// Base Types
// =============================================================================

/**
 * Base input for all workout operations
 */
export interface BaseWorkoutChainInput {
  user: UserWithProfile;
  date: Date;
}

// =============================================================================
// Generate Operation Types
// =============================================================================

/**
 * Input for workout generation operation
 */
export interface WorkoutGenerateInput {
  user: UserWithProfile;
  date: Date;
  dayOverview: string;
  experienceLevel?: ExperienceLevel;
}

/**
 * Output from workout generation (flattened subAgent results)
 */
export interface WorkoutGenerateOutput {
  response: string;
  message: string;
  structure: WorkoutStructure;
}

// Alias for result type
export type WorkoutGenerateResult = WorkoutGenerateOutput;

// =============================================================================
// Modify Operation Types
// =============================================================================

/**
 * Input for workout modification
 */
export interface ModifyWorkoutInput {
  user: UserWithProfile;
  date: Date;
  workout: WorkoutData;
  changeRequest: string;
}

/**
 * Output from workout modification (flattened subAgent results)
 */
export interface ModifyWorkoutOutput {
  response: {
    overview: string;
    wasModified: boolean;
    modifications: string;
  };
  message: string;
  structure?: WorkoutStructure;
}

// Alias for result type
export type WorkoutModifyResult = ModifyWorkoutOutput;
