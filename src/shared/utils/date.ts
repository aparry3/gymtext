/**
 * Date & Time Utilities
 *
 * Single source of truth for all date/time operations across the application.
 * Handles timezone conversions, formatting for UI/AI/API, and date comparisons.
 *
 * Uses Luxon for timezone-aware operations.
 *
 * @example
 * ```typescript
 * import { formatForUI, formatForAI, parseDate } from '@/shared/utils/date';
 *
 * // Format for UI display
 * const displayDate = formatForUI(new Date(), 'short');
 *
 * // Format for AI prompts
 * const aiDate = formatForAI(new Date(), 'America/New_York');
 *
 * // Parse safely
 * const parsed = parseDate('2025-01-20');
 * ```
 */

import { DateTime, IANAZone } from 'luxon';

/**
 * Date format types for different use cases
 */
export type DateFormatType =
  | 'short'      // "Jan 20, 2025"
  | 'long'       // "January 20, 2025"
  | 'time'       // "2:30 PM"
  | 'datetime'   // "Jan 20, 2025, 2:30 PM"
  | 'relative';  // "2 days ago"

// ==========================================
// Construction & Parsing
// ==========================================

/**
 * Safely parse a date value into a Date object
 * Handles Date objects, ISO strings, timestamps, and invalid values
 */
export function parseDate(value: Date | string | number | null | undefined): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * Get current date/time in a specific timezone
 * @param timezone - IANA timezone (e.g., "America/New_York")
 * @returns Luxon DateTime in the specified timezone
 */
export function now(timezone?: string): DateTime {
  if (timezone && isValidTimezone(timezone)) {
    return DateTime.now().setZone(timezone);
  }
  return DateTime.now();
}

/**
 * Get start of day for a date in a specific timezone
 */
export function startOfDay(date: Date | string, timezone?: string): Date {
  const parsed = parseDate(date);
  if (!parsed) {
    throw new Error('Invalid date provided to startOfDay');
  }

  let dt = DateTime.fromJSDate(parsed);
  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  return dt.startOf('day').toJSDate();
}

/**
 * Get end of day for a date in a specific timezone
 */
export function endOfDay(date: Date | string, timezone?: string): Date {
  const parsed = parseDate(date);
  if (!parsed) {
    throw new Error('Invalid date provided to endOfDay');
  }

  let dt = DateTime.fromJSDate(parsed);
  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  return dt.endOf('day').toJSDate();
}

// ==========================================
// Timezone Operations
// ==========================================

/**
 * Validate if a string is a valid IANA timezone
 */
export function isValidTimezone(timezone: string): boolean {
  return IANAZone.isValidZone(timezone);
}

/**
 * Convert a Date to a specific timezone
 * @returns Luxon DateTime in the target timezone
 */
export function convertToTimezone(date: Date | string, timezone: string): DateTime {
  const parsed = parseDate(date);
  if (!parsed) {
    throw new Error('Invalid date provided to convertToTimezone');
  }

  if (!isValidTimezone(timezone)) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }

  return DateTime.fromJSDate(parsed, { zone: 'utc' }).setZone(timezone);
}

/**
 * Convert a local date/time in a timezone to UTC
 */
export function convertToUTC(localDate: Date | string, timezone: string): Date {
  const parsed = parseDate(localDate);
  if (!parsed) {
    throw new Error('Invalid date provided to convertToUTC');
  }

  if (!isValidTimezone(timezone)) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }

  return DateTime.fromJSDate(parsed, { zone: timezone }).toUTC().toJSDate();
}

/**
 * Get the local hour for a given UTC date in a specific timezone
 */
export function getLocalHour(utcDate: Date | string, timezone: string): number {
  const dt = convertToTimezone(utcDate, timezone);
  return dt.hour;
}

// ==========================================
// Formatting for UI
// ==========================================

/**
 * Format date for UI display with consistent formatting
 * @param date - Date to format
 * @param format - Format type (short, long, time, datetime, relative)
 * @param timezone - Optional timezone for localization
 * @returns Formatted date string
 */
export function formatForUI(
  date: Date | string | null | undefined,
  format: DateFormatType = 'short',
  timezone?: string
): string {
  const parsed = parseDate(date);
  if (!parsed) return 'Invalid date';

  let dt = DateTime.fromJSDate(parsed);
  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  switch (format) {
    case 'short':
      return dt.toLocaleString({ month: 'short', day: 'numeric', year: 'numeric' });

    case 'long':
      return dt.toLocaleString({ month: 'long', day: 'numeric', year: 'numeric' });

    case 'time':
      return dt.toLocaleString(DateTime.TIME_SIMPLE);

    case 'datetime':
      return dt.toLocaleString(DateTime.DATETIME_MED);

    case 'relative':
      return formatRelative(parsed);

    default:
      return dt.toLocaleString({ month: 'short', day: 'numeric', year: 'numeric' });
  }
}

/**
 * Format date as relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelative(date: Date | string): string {
  const parsed = parseDate(date);
  if (!parsed) return 'Invalid date';

  const dt = DateTime.fromJSDate(parsed);
  const nowDt = DateTime.now();
  const diff = dt.diff(nowDt, ['years', 'months', 'days', 'hours', 'minutes']).toObject();

  // Future dates
  if (dt > nowDt) {
    if (Math.abs(diff.years || 0) >= 1) {
      return `in ${Math.round(Math.abs(diff.years || 0))} year${Math.abs(diff.years || 0) !== 1 ? 's' : ''}`;
    }
    if (Math.abs(diff.months || 0) >= 1) {
      return `in ${Math.round(Math.abs(diff.months || 0))} month${Math.abs(diff.months || 0) !== 1 ? 's' : ''}`;
    }
    if (Math.abs(diff.days || 0) >= 1) {
      return `in ${Math.round(Math.abs(diff.days || 0))} day${Math.abs(diff.days || 0) !== 1 ? 's' : ''}`;
    }
    if (Math.abs(diff.hours || 0) >= 1) {
      return `in ${Math.round(Math.abs(diff.hours || 0))} hour${Math.abs(diff.hours || 0) !== 1 ? 's' : ''}`;
    }
    return `in ${Math.round(Math.abs(diff.minutes || 0))} minute${Math.abs(diff.minutes || 0) !== 1 ? 's' : ''}`;
  }

  // Past dates
  if (Math.abs(diff.years || 0) >= 1) {
    return `${Math.round(Math.abs(diff.years || 0))} year${Math.abs(diff.years || 0) !== 1 ? 's' : ''} ago`;
  }
  if (Math.abs(diff.months || 0) >= 1) {
    return `${Math.round(Math.abs(diff.months || 0))} month${Math.abs(diff.months || 0) !== 1 ? 's' : ''} ago`;
  }
  if (Math.abs(diff.days || 0) >= 1) {
    return `${Math.round(Math.abs(diff.days || 0))} day${Math.abs(diff.days || 0) !== 1 ? 's' : ''} ago`;
  }
  if (Math.abs(diff.hours || 0) >= 1) {
    return `${Math.round(Math.abs(diff.hours || 0))} hour${Math.abs(diff.hours || 0) !== 1 ? 's' : ''} ago`;
  }
  if (Math.abs(diff.minutes || 0) >= 1) {
    return `${Math.round(Math.abs(diff.minutes || 0))} minute${Math.abs(diff.minutes || 0) !== 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

// ==========================================
// Formatting for AI/LLM
// ==========================================

/**
 * Format date for AI prompts with consistent, human-readable format
 * @param date - Date to format
 * @param timezone - User's timezone for context
 * @returns Human-readable date string (e.g., "Monday, January 20, 2025")
 */
export function formatForAI(date: Date | string, timezone: string): string {
  const parsed = parseDate(date);
  if (!parsed) return 'Invalid date';

  let dt = DateTime.fromJSDate(parsed);
  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  return dt.toLocaleString({
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date for AI with custom pattern
 * @param date - Date to format
 * @param timezone - User's timezone
 * @param includeDay - Whether to include day of week
 * @returns Formatted string
 */
export function formatForAICustom(
  date: Date | string,
  timezone: string,
  options: { includeDay?: boolean; includeYear?: boolean } = {}
): string {
  const parsed = parseDate(date);
  if (!parsed) return 'Invalid date';

  const { includeDay = true, includeYear = true } = options;

  let dt = DateTime.fromJSDate(parsed);
  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
  };

  if (includeDay) {
    formatOptions.weekday = 'long';
  }

  if (includeYear) {
    formatOptions.year = 'numeric';
  }

  return dt.toLocaleString(formatOptions);
}

// ==========================================
// Formatting for API
// ==========================================

/**
 * Format date for API responses (ISO 8601 string)
 * @param date - Date to format
 * @returns ISO 8601 string
 */
export function formatForAPI(date: Date | string | null | undefined): string | null {
  const parsed = parseDate(date);
  if (!parsed) return null;
  return parsed.toISOString();
}

/**
 * Format date for database storage
 * Ensures consistent Date object format
 */
export function formatForDatabase(date: Date | string | null | undefined): Date | null {
  return parseDate(date);
}

// ==========================================
// Comparison & Validation
// ==========================================

/**
 * Check if a value is a valid date
 */
export function isValidDate(value: unknown): boolean {
  const parsed = parseDate(value as Date | string);
  return parsed !== null;
}

/**
 * Check if two dates are on the same day
 * @param timezone - Optional timezone for comparison (uses date's timezone if not provided)
 */
export function isSameDay(date1: Date | string, date2: Date | string, timezone?: string): boolean {
  const parsed1 = parseDate(date1);
  const parsed2 = parseDate(date2);

  if (!parsed1 || !parsed2) return false;

  let dt1 = DateTime.fromJSDate(parsed1);
  let dt2 = DateTime.fromJSDate(parsed2);

  if (timezone && isValidTimezone(timezone)) {
    dt1 = dt1.setZone(timezone);
    dt2 = dt2.setZone(timezone);
  }

  return dt1.hasSame(dt2, 'day');
}

/**
 * Check if a date is today
 * @param timezone - Timezone to check against (defaults to system timezone)
 */
export function isToday(date: Date | string, timezone?: string): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;

  const nowDt = now(timezone);
  let dt = DateTime.fromJSDate(parsed);

  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  return dt.hasSame(nowDt, 'day');
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string, timezone?: string): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;

  const nowDt = now(timezone);
  let dt = DateTime.fromJSDate(parsed);

  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  return dt < nowDt;
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string, timezone?: string): boolean {
  const parsed = parseDate(date);
  if (!parsed) return false;

  const nowDt = now(timezone);
  let dt = DateTime.fromJSDate(parsed);

  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  return dt > nowDt;
}

/**
 * Get difference between two dates in days
 */
export function diffInDays(date1: Date | string, date2: Date | string): number {
  const parsed1 = parseDate(date1);
  const parsed2 = parseDate(date2);

  if (!parsed1 || !parsed2) return 0;

  const dt1 = DateTime.fromJSDate(parsed1);
  const dt2 = DateTime.fromJSDate(parsed2);

  return Math.round(dt1.diff(dt2, 'days').days);
}

// ==========================================
// Utility Methods
// ==========================================

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number, timezone?: string): Date {
  const parsed = parseDate(date);
  if (!parsed) {
    throw new Error('Invalid date provided to addDays');
  }

  let dt = DateTime.fromJSDate(parsed);
  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  return dt.plus({ days }).toJSDate();
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date | string, days: number, timezone?: string): Date {
  return addDays(date, -days, timezone);
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(date: Date | string, timezone?: string): number {
  const parsed = parseDate(date);
  if (!parsed) {
    throw new Error('Invalid date provided to getDayOfWeek');
  }

  let dt = DateTime.fromJSDate(parsed);
  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  // Luxon uses 1-7 (Mon-Sun), convert to JS 0-6 (Sun-Sat)
  return dt.weekday === 7 ? 0 : dt.weekday;
}

/**
 * Get day of week in Luxon format (1 = Monday, 7 = Sunday)
 * @param date - Date to check
 * @param timezone - Timezone to convert to
 * @returns Weekday number (1-7)
 */
export function getWeekday(date: Date | string, timezone?: string): number {
  const parsed = parseDate(date);
  if (!parsed) {
    throw new Error('Invalid date provided to getWeekday');
  }

  let dt = DateTime.fromJSDate(parsed);
  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  return dt.weekday; // 1=Monday, 7=Sunday
}

/**
 * Check if a UTC date is a specific weekday in a user's timezone
 * @param utcDate - UTC date to check
 * @param timezone - User's timezone
 * @param weekday - Weekday to check (1=Monday, 7=Sunday)
 * @returns true if the date is the specified weekday in the user's timezone
 */
export function isWeekdayInTimezone(
  utcDate: Date | string,
  timezone: string,
  weekday: number
): boolean {
  if (!isValidTimezone(timezone)) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }

  if (weekday < 1 || weekday > 7) {
    throw new Error(`Invalid weekday: ${weekday}. Must be 1-7 (1=Monday, 7=Sunday)`);
  }

  const parsed = parseDate(utcDate);
  if (!parsed) {
    throw new Error('Invalid date provided to isWeekdayInTimezone');
  }

  const dt = DateTime.fromJSDate(parsed, { zone: 'utc' }).setZone(timezone);
  return dt.weekday === weekday;
}

/**
 * Get all IANA timezones that are currently at a specific local time
 *
 * Filters the complete list of IANA timezones (~600) to find which ones
 * are currently at the target local hour and optional weekday.
 *
 * @param utcDate - Current UTC date/time
 * @param targetLocalHour - Target local hour (0-23)
 * @param weekday - Optional weekday filter (1=Monday, 7=Sunday)
 * @returns Array of timezone strings that match the criteria
 *
 * @example
 * // Find timezones where it's 5pm (17:00) on a Sunday
 * const utcNow = new Date();
 * const timezones = getTimezonesAtLocalTime(utcNow, 17, 7);
 * // Returns: ['America/New_York', 'America/Toronto', ...] if it's Sunday 5pm there
 */
export function getTimezonesAtLocalTime(
  utcDate: Date | string,
  targetLocalHour: number,
  weekday?: number
): string[] {
  const parsed = parseDate(utcDate);
  if (!parsed) {
    throw new Error('Invalid date provided to getTimezonesAtLocalTime');
  }

  if (targetLocalHour < 0 || targetLocalHour > 23) {
    throw new Error(`Invalid target hour: ${targetLocalHour}. Must be 0-23`);
  }

  if (weekday !== undefined && (weekday < 1 || weekday > 7)) {
    throw new Error(`Invalid weekday: ${weekday}. Must be 1-7 (1=Monday, 7=Sunday)`);
  }

  const matchingTimezones: string[] = [];

  // Get all IANA timezones (browser/Node.js built-in)
  const allTimezones = Intl.supportedValuesOf('timeZone');

  for (const timezone of allTimezones) {
    try {
      // Check if this timezone is at the target local hour
      const localHour = getLocalHour(parsed, timezone);
      if (localHour !== targetLocalHour) {
        continue;
      }

      // If weekday is specified, check if it matches
      if (weekday !== undefined) {
        const isMatchingWeekday = isWeekdayInTimezone(parsed, timezone, weekday);
        if (!isMatchingWeekday) {
          continue;
        }
      }

      matchingTimezones.push(timezone);
    } catch {
      // Skip invalid timezones
      continue;
    }
  }

  return matchingTimezones;
}

/**
 * Get day of week name (e.g., "Monday", "Tuesday")
 */
export function getDayOfWeekName(date: Date | string, timezone?: string): string {
  const parsed = parseDate(date);
  if (!parsed) {
    throw new Error('Invalid date provided to getDayOfWeekName');
  }

  let dt = DateTime.fromJSDate(parsed);
  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  return dt.toFormat('EEEE');
}

/**
 * Get ISO date string (YYYY-MM-DD) in a specific timezone
 * Useful for API calls and date comparisons
 */
export function toISODate(date: Date | string, timezone?: string): string {
  const parsed = parseDate(date);
  if (!parsed) {
    throw new Error('Invalid date provided to toISODate');
  }

  let dt = DateTime.fromJSDate(parsed);
  if (timezone && isValidTimezone(timezone)) {
    dt = dt.setZone(timezone);
  }

  return dt.toISODate() || '';
}
