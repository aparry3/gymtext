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
import { DateTime } from 'luxon';
export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export declare const DAY_NAMES: DayOfWeek[];
/**
 * Date format types for different use cases
 */
export type DateFormatType = 'short' | 'long' | 'time' | 'datetime' | 'relative';
/**
 * Safely parse a date value into a Date object
 * Handles Date objects, ISO strings, SQL dates, timestamps, and invalid values
 *
 * PostgreSQL stores dates as 'date' type (e.g., '2025-11-06') without timezone info.
 * When JavaScript parses these as `new Date('2025-11-06')`, it interprets them as
 * UTC midnight and then converts to local timezone, causing off-by-one-day bugs.
 * This function ensures SQL dates are always interpreted as UTC to avoid timezone shifts.
 */
export declare function parseDate(value: Date | string | number | null | undefined): Date | null;
/**
 * Get current date/time in a specific timezone
 * @param timezone - IANA timezone (e.g., "America/New_York")
 * @returns Luxon DateTime in the specified timezone
 */
export declare function now(timezone?: string): DateTime;
/**
 * Get today's date (start of day) in a specific timezone
 * @param timezone - IANA timezone (e.g., "America/New_York")
 * @returns Date object representing midnight of today in the specified timezone
 */
export declare function today(timezone?: string): Date;
/**
 * Get start of day for a date in a specific timezone
 */
export declare function startOfDay(date: Date | string, timezone?: string): Date;
/**
 * Get end of day for a date in a specific timezone
 */
export declare function endOfDay(date: Date | string, timezone?: string): Date;
/**
 * Validate if a string is a valid IANA timezone
 */
export declare function isValidTimezone(timezone: string): boolean;
/**
 * Convert a Date to a specific timezone
 * @returns Luxon DateTime in the target timezone
 */
export declare function convertToTimezone(date: Date | string, timezone: string): DateTime;
/**
 * Convert a local date/time in a timezone to UTC
 */
export declare function convertToUTC(localDate: Date | string, timezone: string): Date;
/**
 * Get the local hour for a given UTC date in a specific timezone
 */
export declare function getLocalHour(utcDate: Date | string, timezone: string): number;
/**
 * Format date for UI display with consistent formatting
 * @param date - Date to format
 * @param format - Format type (short, long, time, datetime, relative)
 * @param timezone - Optional timezone for localization
 * @returns Formatted date string
 */
export declare function formatForUI(date: Date | string | null | undefined, format?: DateFormatType, timezone?: string): string;
/**
 * Format date as relative time (e.g., "2 days ago", "in 3 hours")
 */
export declare function formatRelative(date: Date | string): string;
/**
 * Format date for AI prompts with consistent, human-readable format
 * @param date - Date to format
 * @param timezone - User's timezone for context
 * @returns Human-readable date string (e.g., "Monday, January 20, 2025")
 */
export declare function formatForAI(date: Date | string, timezone: string): string;
/**
 * Format date for AI with custom pattern
 * @param date - Date to format
 * @param timezone - User's timezone
 * @param includeDay - Whether to include day of week
 * @returns Formatted string
 */
export declare function formatForAICustom(date: Date | string, timezone: string, options?: {
    includeDay?: boolean;
    includeYear?: boolean;
}): string;
/**
 * Format date for API responses (ISO 8601 string)
 * @param date - Date to format
 * @returns ISO 8601 string
 */
export declare function formatForAPI(date: Date | string | null | undefined): string | null;
/**
 * Format date for database storage
 * Ensures consistent Date object format
 */
export declare function formatForDatabase(date: Date | string | null | undefined): Date | null;
/**
 * Check if a value is a valid date
 */
export declare function isValidDate(value: unknown): boolean;
/**
 * Check if two dates are on the same day
 * @param timezone - Optional timezone for comparison (uses date's timezone if not provided)
 */
export declare function isSameDay(date1: Date | string, date2: Date | string, timezone?: string): boolean;
/**
 * Check if a date is today
 * @param timezone - Timezone to check against (defaults to system timezone)
 */
export declare function isToday(date: Date | string, timezone?: string): boolean;
/**
 * Check if a date is in the past
 */
export declare function isPast(date: Date | string, timezone?: string): boolean;
/**
 * Check if a date is in the future
 */
export declare function isFuture(date: Date | string, timezone?: string): boolean;
/**
 * Get difference between two dates in days
 */
export declare function diffInDays(date1: Date | string, date2: Date | string): number;
/**
 * Add days to a date
 */
export declare function addDays(date: Date | string, days: number, timezone?: string): Date;
/**
 * Subtract days from a date
 */
export declare function subtractDays(date: Date | string, days: number, timezone?: string): Date;
/**
 * Get day of week as DayOfWeek type
 * @param date - Optional date to check (defaults to current date/time)
 * @param timezone - Timezone to use (required)
 * @returns DayOfWeek string (e.g., "MONDAY", "TUESDAY")
 */
export declare function getDayOfWeek(date: Date | string | undefined, timezone: string): DayOfWeek;
/**
 * Get day of week in Luxon format (1 = Monday, 7 = Sunday)
 * @param date - Date to check
 * @param timezone - Timezone to convert to
 * @returns Weekday number (1-7)
 */
export declare function getWeekday(date: Date | string, timezone?: string): number;
/**
 * Check if a UTC date is a specific weekday in a user's timezone
 * @param utcDate - UTC date to check
 * @param timezone - User's timezone
 * @param weekday - Weekday to check (1=Monday, 7=Sunday)
 * @returns true if the date is the specified weekday in the user's timezone
 */
export declare function isWeekdayInTimezone(utcDate: Date | string, timezone: string, weekday: number): boolean;
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
export declare function getTimezonesAtLocalTime(utcDate: Date | string, targetLocalHour: number, weekday?: number): string[];
/**
 * Get start of week for a date in a specific timezone
 * Week starts on Monday (ISO week)
 */
export declare function startOfWeek(date: Date | string, timezone?: string): Date;
/**
 * Get end of week for a date in a specific timezone
 * Week ends on Sunday (ISO week)
 */
export declare function endOfWeek(date: Date | string, timezone?: string): Date;
/**
 * Add weeks to a date
 */
export declare function addWeeks(date: Date | string, weeks: number, timezone?: string): Date;
/**
 * Subtract weeks from a date
 */
export declare function subtractWeeks(date: Date | string, weeks: number, timezone?: string): Date;
/**
 * Get the start of the next week (next Monday)
 */
export declare function getNextWeekStart(date: Date | string, timezone?: string): Date;
/**
 * Get difference between two dates in weeks
 */
export declare function diffInWeeks(date1: Date | string, date2: Date | string, timezone?: string): number;
/**
 * Get day of week name (e.g., "Monday", "Tuesday")
 */
export declare function getDayOfWeekName(date: Date | string, timezone?: string): string;
/**
 * Get ISO date string (YYYY-MM-DD) in a specific timezone
 * Useful for API calls and date comparisons
 */
export declare function toISODate(date: Date | string, timezone?: string): string;
/**
 * Simple date formatter for display purposes
 *
 * Use this to display dates in a consistent format across the UI.
 * Defaults to UTC timezone to prevent display shifts for SQL dates.
 *
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options (timeZone defaults to UTC)
 * @returns Formatted date string
 *
 * @example
 * formatDate(workout.date)  // "11/6/2025"
 * formatDate(workout.date, { weekday: 'long', month: 'long', day: 'numeric' })  // "Wednesday, November 6"
 */
export declare function formatDate(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string;
//# sourceMappingURL=date.d.ts.map