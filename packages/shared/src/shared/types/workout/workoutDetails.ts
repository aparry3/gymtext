/**
 * WorkoutDetails types
 *
 * Matches the output_schema of the `workout:details` agent.
 * These types represent the structured workout data stored in
 * `workout_instances.details` JSON column.
 */

// ============================================================================
// Enums
// ============================================================================

export type WorkoutSectionType = 'warmup' | 'main' | 'conditioning' | 'cooldown';

export type WorkoutSectionStructure =
  | 'straight-sets'
  | 'circuit'
  | 'emom'
  | 'amrap'
  | 'for-time'
  | 'intervals';

export type WorkoutSetType = 'warmup' | 'working' | 'backoff' | 'drop';

// ============================================================================
// Core Types
// ============================================================================

/**
 * Per-set detail for movements with varying weight/reps across sets
 * (warmup progressions, ladders, wave loading, pyramids, drop sets)
 */
export interface WorkoutSetDetail {
  reps: string;
  weight?: string;
  rpe?: string;
  type?: WorkoutSetType;
  notes?: string;
}

/**
 * A single movement within a workout section.
 * Unified schema — fill in relevant fields for the movement type.
 */
export interface WorkoutDetailsMovement {
  name: string;
  sets?: string;
  reps?: string;
  weight?: string;
  distance?: string;
  pace?: string;
  duration?: string;
  intensity?: string;
  tempo?: string;
  rpe?: string;
  rest?: string;
  notes?: string;
  setDetails?: WorkoutSetDetail[];
}

/**
 * A section of a workout (warmup, main, conditioning, cooldown).
 * Each section is one discrete unit of work.
 */
export interface WorkoutDetailsSection {
  type: WorkoutSectionType;
  title?: string;
  structure: WorkoutSectionStructure;
  notes?: string;
  rounds?: number;
  duration?: number;
  rest?: string;
  movements: WorkoutDetailsMovement[];
}

/**
 * Top-level workout details structure.
 * Stored in `workout_instances.details` JSON column.
 */
export interface WorkoutDetails {
  date: string;
  dayOfWeek: string;
  focus: string;
  title: string;
  description?: string;
  estimatedDuration?: number;
  location?: string;
  sections: WorkoutDetailsSection[];
}
