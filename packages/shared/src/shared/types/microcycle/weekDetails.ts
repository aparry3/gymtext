/**
 * WeekDetails types
 *
 * Matches the output_schema of the `week:details` agent.
 * These types represent the structured week overview stored in
 * `microcycles.details` JSON column.
 *
 * Design principle: These schemas define PLAN STRUCTURE ONLY.
 * User progress (streaks, adherence, completion status per day, etc.)
 * comes from a separate metrics system.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * ActivityType is a free-form string to support any training modality.
 * Common values: "strength", "cardio", "yoga", "swimming", "hiit", "rest", etc.
 */
export type ActivityType = string;

/**
 * A single day within the week — what the session IS, not how the user did.
 */
export interface WeekDay {
  /** Day of week abbreviation: "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" */
  dayOfWeek: string;
  /** Session focus, e.g. "Upper Pull", "Rest", "Conditioning" */
  focus: string;
  /** Free-form activity type, e.g. "strength", "cardio", "rest" */
  activityType: ActivityType;
}

/**
 * Top-level week details structure.
 * Stored in `microcycles.details` JSON column.
 *
 * Always contains exactly 7 days (Mon–Sun).
 */
export interface WeekDetails {
  weekNumber: number;
  /** e.g. "Hypertrophy I", "Week 4" */
  label: string;
  /** ISO date (YYYY-MM-DD) */
  startDate: string;
  /** ISO date (YYYY-MM-DD) */
  endDate: string;
  /** Always 7 items, Mon–Sun */
  days: WeekDay[];
}

// ============================================================================
// Legacy type aliases (for migration compatibility)
// ============================================================================

/**
 * @deprecated Use WeekDay instead.
 * Extended with optional legacy fields for backward compatibility during migration.
 */
export interface WeekDetailsDay extends WeekDay {
  /** @deprecated No longer part of the schema */
  dayNumber?: number;
  /** @deprecated No longer part of the schema — use focus instead */
  title?: string;
  /** @deprecated No longer part of the schema — use activityType (free string) instead */
  sessionType?: string;
  /** @deprecated No longer part of the schema */
  exerciseCount?: number;
  /** @deprecated No longer part of the schema */
  estimatedDuration?: number;
  /** @deprecated No longer part of the schema */
  mainMovements?: string[];
}
