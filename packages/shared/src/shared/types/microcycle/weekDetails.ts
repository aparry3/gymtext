/**
 * WeekDetails types
 *
 * Matches the output_schema of the `week:details` agent.
 * These types represent the structured week overview stored in
 * `microcycles.details` JSON column.
 */

// ============================================================================
// Enums
// ============================================================================

export type WeekDayActivityType = 'training' | 'rest' | 'activeRecovery';

export type WeekDaySessionType =
  | 'strength'
  | 'hypertrophy'
  | 'cardio'
  | 'endurance'
  | 'hiit'
  | 'hybrid'
  | 'sport'
  | 'mobility';

// ============================================================================
// Core Types
// ============================================================================

/**
 * A single day within the week overview.
 */
export interface WeekDetailsDay {
  dayNumber: number;
  dayOfWeek: string;
  focus?: string;
  title?: string;
  activityType?: WeekDayActivityType;
  sessionType?: WeekDaySessionType;
  exerciseCount?: number;
  estimatedDuration?: number;
  mainMovements?: string[];
}

/**
 * Top-level week details structure.
 * Stored in `microcycles.details` JSON column.
 */
export interface WeekDetails {
  weekNumber?: number;
  phase?: string;
  focus?: string;
  startDate?: string;
  days: WeekDetailsDay[];
  totalSessions?: number;
  notes?: string;
}
