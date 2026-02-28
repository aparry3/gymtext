/**
 * PlanDetails types
 *
 * The user's active training plan — what the program IS, not how they're doing on it.
 *
 * Design principle: These schemas define PLAN STRUCTURE ONLY.
 * User progress (streaks, adherence, completion status, current week, etc.)
 * comes from a separate metrics system.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Top-level plan details structure.
 * Stored in `fitness_plans.details` JSON column (or equivalent).
 */
export interface PlanDetails {
  title: string;
  subtitle: string;
  description: string;
  goal: string;

  // Schedule
  /** e.g. "5x/week", "4x/week" */
  frequency: string;
  /** e.g. ["Mon", "Tue", "Thu", "Fri", "Sat"] */
  schedule: string[];
  /** ISO date, e.g. "2026-02-02" */
  startDate: string;

  // Duration — fixed-length vs open-ended
  /** Present = fixed-length plan, absent/undefined = open-ended */
  totalWeeks?: number;
  /** ISO date, only for fixed-length plans */
  expectedEndDate?: string;
  /** Planned workout count, only for fixed-length plans */
  totalWorkouts?: number;

  // Week labels (for fixed-length plans with phases)
  /** e.g. ["Foundation", "Foundation", "Hypertrophy I", ...] */
  /** length === totalWeeks when present */
  weekLabels?: string[];
}
