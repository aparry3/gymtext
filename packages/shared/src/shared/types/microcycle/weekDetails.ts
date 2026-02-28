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
