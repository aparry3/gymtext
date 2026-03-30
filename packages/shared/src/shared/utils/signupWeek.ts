/**
 * Signup Week Utilities
 *
 * Lightweight guard for the weekly message service.
 * All adaptive signup logic (intro week vs full week, partial weeks, rest day signups)
 * is handled by the microcycle agent through prompting — not code.
 */

import { DateTime } from 'luxon';
import { parseDate } from './date';

/**
 * Check if a user is in their first week (signed up this week).
 * Used by weekly message service to guard against sending confusing
 * "next week" messages to brand-new users who are still in their first week.
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
