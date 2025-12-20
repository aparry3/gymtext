import type { WorkoutInstance, Microcycle } from '@/server/models';
import type { ExperienceLevel, SnippetType } from './builders/experienceLevel';

/**
 * Context types that can be requested from the ContextService
 */
export enum ContextType {
  USER = 'user',
  USER_PROFILE = 'userProfile',
  FITNESS_PLAN = 'fitnessPlan',
  DAY_OVERVIEW = 'dayOverview',
  CURRENT_WORKOUT = 'currentWorkout',
  DATE_CONTEXT = 'dateContext',
  TRAINING_META = 'trainingMeta',
  CHANGE_REQUEST = 'changeRequest',
  CURRENT_MICROCYCLE = 'currentMicrocycle',
  EXPERIENCE_LEVEL = 'experienceLevel',
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

  // Experience level context
  experienceLevel?: ExperienceLevel;
  snippetType?: SnippetType;
}

/**
 * Internal data structure built from user + extras + fetched data
 * Passed to individual builders
 */
export interface ResolvedContextData {
  userName?: string | null;
  userGender?: string | null;
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
  experienceLevel?: ExperienceLevel | null;
  snippetType?: SnippetType;
}
