/**
 * Centralized Date Service
 *
 * Single source of truth for all date/time operations across the application.
 * Handles timezone conversions, formatting for UI/AI/API, and date comparisons.
 *
 * Uses Luxon for timezone-aware operations.
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

/**
 * DateService - Centralized date/time operations
 */
export class DateService {
  private static instance: DateService;

  private constructor() {}

  public static getInstance(): DateService {
    if (!DateService.instance) {
      DateService.instance = new DateService();
    }
    return DateService.instance;
  }

  // ==========================================
  // Construction & Parsing
  // ==========================================

  /**
   * Safely parse a date value into a Date object
   * Handles Date objects, ISO strings, timestamps, and invalid values
   */
  parseDate(value: Date | string | number | null | undefined): Date | null {
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
  now(timezone?: string): DateTime {
    if (timezone && this.isValidTimezone(timezone)) {
      return DateTime.now().setZone(timezone);
    }
    return DateTime.now();
  }

  /**
   * Get start of day for a date in a specific timezone
   */
  startOfDay(date: Date | string, timezone?: string): Date {
    const parsed = this.parseDate(date);
    if (!parsed) {
      throw new Error('Invalid date provided to startOfDay');
    }

    let dt = DateTime.fromJSDate(parsed);
    if (timezone && this.isValidTimezone(timezone)) {
      dt = dt.setZone(timezone);
    }

    return dt.startOf('day').toJSDate();
  }

  /**
   * Get end of day for a date in a specific timezone
   */
  endOfDay(date: Date | string, timezone?: string): Date {
    const parsed = this.parseDate(date);
    if (!parsed) {
      throw new Error('Invalid date provided to endOfDay');
    }

    let dt = DateTime.fromJSDate(parsed);
    if (timezone && this.isValidTimezone(timezone)) {
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
  isValidTimezone(timezone: string): boolean {
    return IANAZone.isValidZone(timezone);
  }

  /**
   * Convert a Date to a specific timezone
   * @returns Luxon DateTime in the target timezone
   */
  convertToTimezone(date: Date | string, timezone: string): DateTime {
    const parsed = this.parseDate(date);
    if (!parsed) {
      throw new Error('Invalid date provided to convertToTimezone');
    }

    if (!this.isValidTimezone(timezone)) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }

    return DateTime.fromJSDate(parsed, { zone: 'utc' }).setZone(timezone);
  }

  /**
   * Convert a local date/time in a timezone to UTC
   */
  convertToUTC(localDate: Date | string, timezone: string): Date {
    const parsed = this.parseDate(localDate);
    if (!parsed) {
      throw new Error('Invalid date provided to convertToUTC');
    }

    if (!this.isValidTimezone(timezone)) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }

    return DateTime.fromJSDate(parsed, { zone: timezone }).toUTC().toJSDate();
  }

  /**
   * Get the local hour for a given UTC date in a specific timezone
   */
  getLocalHour(utcDate: Date | string, timezone: string): number {
    const dt = this.convertToTimezone(utcDate, timezone);
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
  formatForUI(
    date: Date | string | null | undefined,
    format: DateFormatType = 'short',
    timezone?: string
  ): string {
    const parsed = this.parseDate(date);
    if (!parsed) return 'Invalid date';

    let dt = DateTime.fromJSDate(parsed);
    if (timezone && this.isValidTimezone(timezone)) {
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
        return this.formatRelative(parsed);

      default:
        return dt.toLocaleString({ month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  /**
   * Format date as relative time (e.g., "2 days ago", "in 3 hours")
   */
  formatRelative(date: Date | string): string {
    const parsed = this.parseDate(date);
    if (!parsed) return 'Invalid date';

    const dt = DateTime.fromJSDate(parsed);
    const now = DateTime.now();
    const diff = dt.diff(now, ['years', 'months', 'days', 'hours', 'minutes']).toObject();

    // Future dates
    if (dt > now) {
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
  formatForAI(date: Date | string, timezone: string): string {
    const parsed = this.parseDate(date);
    if (!parsed) return 'Invalid date';

    let dt = DateTime.fromJSDate(parsed);
    if (timezone && this.isValidTimezone(timezone)) {
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
  formatForAICustom(
    date: Date | string,
    timezone: string,
    options: { includeDay?: boolean; includeYear?: boolean } = {}
  ): string {
    const parsed = this.parseDate(date);
    if (!parsed) return 'Invalid date';

    const { includeDay = true, includeYear = true } = options;

    let dt = DateTime.fromJSDate(parsed);
    if (timezone && this.isValidTimezone(timezone)) {
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
  formatForAPI(date: Date | string | null | undefined): string | null {
    const parsed = this.parseDate(date);
    if (!parsed) return null;
    return parsed.toISOString();
  }

  /**
   * Format date for database storage
   * Ensures consistent Date object format
   */
  formatForDatabase(date: Date | string | null | undefined): Date | null {
    return this.parseDate(date);
  }

  // ==========================================
  // Comparison & Validation
  // ==========================================

  /**
   * Check if a value is a valid date
   */
  isValidDate(value: unknown): boolean {
    const parsed = this.parseDate(value as Date | string);
    return parsed !== null;
  }

  /**
   * Check if two dates are on the same day
   * @param timezone - Optional timezone for comparison (uses date's timezone if not provided)
   */
  isSameDay(date1: Date | string, date2: Date | string, timezone?: string): boolean {
    const parsed1 = this.parseDate(date1);
    const parsed2 = this.parseDate(date2);

    if (!parsed1 || !parsed2) return false;

    let dt1 = DateTime.fromJSDate(parsed1);
    let dt2 = DateTime.fromJSDate(parsed2);

    if (timezone && this.isValidTimezone(timezone)) {
      dt1 = dt1.setZone(timezone);
      dt2 = dt2.setZone(timezone);
    }

    return dt1.hasSame(dt2, 'day');
  }

  /**
   * Check if a date is today
   * @param timezone - Timezone to check against (defaults to system timezone)
   */
  isToday(date: Date | string, timezone?: string): boolean {
    const parsed = this.parseDate(date);
    if (!parsed) return false;

    const now = this.now(timezone);
    let dt = DateTime.fromJSDate(parsed);

    if (timezone && this.isValidTimezone(timezone)) {
      dt = dt.setZone(timezone);
    }

    return dt.hasSame(now, 'day');
  }

  /**
   * Check if a date is in the past
   */
  isPast(date: Date | string, timezone?: string): boolean {
    const parsed = this.parseDate(date);
    if (!parsed) return false;

    const now = this.now(timezone);
    let dt = DateTime.fromJSDate(parsed);

    if (timezone && this.isValidTimezone(timezone)) {
      dt = dt.setZone(timezone);
    }

    return dt < now;
  }

  /**
   * Check if a date is in the future
   */
  isFuture(date: Date | string, timezone?: string): boolean {
    const parsed = this.parseDate(date);
    if (!parsed) return false;

    const now = this.now(timezone);
    let dt = DateTime.fromJSDate(parsed);

    if (timezone && this.isValidTimezone(timezone)) {
      dt = dt.setZone(timezone);
    }

    return dt > now;
  }

  /**
   * Get difference between two dates in days
   */
  diffInDays(date1: Date | string, date2: Date | string): number {
    const parsed1 = this.parseDate(date1);
    const parsed2 = this.parseDate(date2);

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
  addDays(date: Date | string, days: number, timezone?: string): Date {
    const parsed = this.parseDate(date);
    if (!parsed) {
      throw new Error('Invalid date provided to addDays');
    }

    let dt = DateTime.fromJSDate(parsed);
    if (timezone && this.isValidTimezone(timezone)) {
      dt = dt.setZone(timezone);
    }

    return dt.plus({ days }).toJSDate();
  }

  /**
   * Subtract days from a date
   */
  subtractDays(date: Date | string, days: number, timezone?: string): Date {
    return this.addDays(date, -days, timezone);
  }

  /**
   * Get day of week (0 = Sunday, 6 = Saturday)
   */
  getDayOfWeek(date: Date | string, timezone?: string): number {
    const parsed = this.parseDate(date);
    if (!parsed) {
      throw new Error('Invalid date provided to getDayOfWeek');
    }

    let dt = DateTime.fromJSDate(parsed);
    if (timezone && this.isValidTimezone(timezone)) {
      dt = dt.setZone(timezone);
    }

    // Luxon uses 1-7 (Mon-Sun), convert to JS 0-6 (Sun-Sat)
    return dt.weekday === 7 ? 0 : dt.weekday;
  }
}

// Export singleton instance
export const dateService = DateService.getInstance();
