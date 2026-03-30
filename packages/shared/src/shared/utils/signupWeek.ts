/**
 * Signup Week Utilities
 *
 * Handles the logic for adaptive week generation when a user signs up
 * mid-week. Determines whether to create a partial "intro week" or
 * start a full Week 1 based on the signup day.
 *
 * Strategy:
 * - Mon/Tue signup → "full" strategy: start real Week 1, mark pre-signup days as N/A
 * - Wed signup → "full" strategy (borderline, but still enough days for a meaningful week)
 * - Thu/Fri/Sat/Sun signup → "intro" strategy: create short intro week, real Week 1 starts next Monday
 */

import { DateTime } from 'luxon';
import { parseDate } from './date';

export type SignupWeekStrategy = 'full' | 'intro';

export interface SignupWeekContext {
  /** 'full' = start Week 1 now; 'intro' = create abbreviated intro week */
  strategy: SignupWeekStrategy;
  /** Luxon weekday of signup (1=Mon, 7=Sun) */
  signupWeekday: number;
  /** Number of days remaining in the week (including signup day) */
  remainingDays: number;
  /** Names of remaining days (e.g., ['Thursday', 'Friday', 'Saturday', 'Sunday']) */
  remainingDayNames: string[];
  /** Whether signup day would normally be a rest day (Sun or Sat) */
  isRestDaySignup: boolean;
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Determine the signup week context for a new user.
 *
 * Returns null if this is NOT a new signup scenario (i.e., the user signed up
 * in a previous week, so normal week generation should apply).
 *
 * @param userCreatedAt - User's account creation timestamp
 * @param targetDate - The date we're generating a week for
 * @param timezone - User's timezone
 */
export function buildSignupWeekContext(
  userCreatedAt: Date | string | null | undefined,
  targetDate: Date,
  timezone: string
): SignupWeekContext | null {
  if (!userCreatedAt) return null;

  const createdAt = parseDate(userCreatedAt);
  if (!createdAt) return null;

  const createdDt = DateTime.fromJSDate(createdAt, { zone: timezone });
  const targetDt = DateTime.fromJSDate(targetDate, { zone: timezone });

  // Check if user was created in the same ISO week as the target date
  const createdWeekStart = createdDt.startOf('week');
  const targetWeekStart = targetDt.startOf('week');

  // Only apply signup logic if user was created in the same week
  if (!createdWeekStart.hasSame(targetWeekStart, 'day')) {
    return null;
  }

  const signupWeekday = createdDt.weekday; // 1=Mon, 7=Sun
  const remainingDays = 7 - signupWeekday + 1; // including signup day
  const remainingDayNames = DAY_NAMES.slice(signupWeekday - 1);

  // Thu (4) through Sun (7) → intro week
  // Mon (1) through Wed (3) → full week
  const strategy: SignupWeekStrategy = signupWeekday >= 4 ? 'intro' : 'full';

  const isRestDaySignup = signupWeekday === 6 || signupWeekday === 7; // Sat or Sun

  return {
    strategy,
    signupWeekday,
    remainingDays,
    remainingDayNames,
    isRestDaySignup,
  };
}

/**
 * Check if a user is in their first week (signed up this week).
 * Used by weekly message service to guard against confusing "Week 2" messages.
 */
export function isUserInFirstWeek(
  userCreatedAt: Date | string | null | undefined,
  currentDate: Date,
  timezone: string
): boolean {
  if (!userCreatedAt) return false;

  const createdAt = parseDate(userCreatedAt);
  if (!createdAt) return false;

  const createdDt = DateTime.fromJSDate(createdAt, { zone: timezone });
  const currentDt = DateTime.fromJSDate(currentDate, { zone: timezone });

  const createdWeekStart = createdDt.startOf('week');
  const currentWeekStart = currentDt.startOf('week');

  return createdWeekStart.hasSame(currentWeekStart, 'day');
}

/**
 * Check if a user is in their second week (signed up last week).
 * Also guards against early "Week 2" messages for intro-week users
 * who just started their real Week 1.
 */
export function isUserInSecondWeek(
  userCreatedAt: Date | string | null | undefined,
  currentDate: Date,
  timezone: string
): boolean {
  if (!userCreatedAt) return false;

  const createdAt = parseDate(userCreatedAt);
  if (!createdAt) return false;

  const createdDt = DateTime.fromJSDate(createdAt, { zone: timezone });
  const currentDt = DateTime.fromJSDate(currentDate, { zone: timezone });

  const createdWeekStart = createdDt.startOf('week');
  const currentWeekStart = currentDt.startOf('week');

  // Check if current week is exactly one week after creation week
  const weeksDiff = currentWeekStart.diff(createdWeekStart, 'weeks').weeks;
  return Math.abs(weeksDiff - 1) < 0.01; // floating point safe
}
