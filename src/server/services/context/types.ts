import type { WorkoutInstance, Microcycle } from '@/server/models';

/**
 * Context types that can be requested from the ContextService
 */
export enum ContextType {
  USER_PROFILE = 'userProfile',
  FITNESS_PLAN = 'fitnessPlan',
  DAY_OVERVIEW = 'dayOverview',
  CURRENT_WORKOUT = 'currentWorkout',
  DATE_CONTEXT = 'dateContext',
  TRAINING_META = 'trainingMeta',
  CHANGE_REQUEST = 'changeRequest',
  CURRENT_MICROCYCLE = 'currentMicrocycle',
}

/**
 * Optional extras that callers can provide to supplement/override auto-fetched data
 */
export interface ContextExtras {
  // Caller-provided data (cannot be auto-fetched)
  dayOverview?: string;
  changeRequest?: string;

  // Training metadata (from orchestration context)
  isDeload?: boolean;
  absoluteWeek?: number;
  currentWeek?: number;

  // Override auto-fetched data
  workout?: WorkoutInstance | null;
  microcycle?: Microcycle | null;
  planText?: string;

  // Date override
  date?: Date;
}

/**
 * Internal data structure built from user + extras + fetched data
 * Passed to individual builders
 */
export interface ResolvedContextData {
  profile?: string | null;
  planText?: string | null;
  dayOverview?: string;
  workout?: WorkoutInstance | null;
  microcycle?: Microcycle | null;
  timezone?: string;
  date?: Date;
  isDeload?: boolean;
  absoluteWeek?: number;
  currentWeek?: number;
  changeRequest?: string;
}
