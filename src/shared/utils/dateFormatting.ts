/**
 * Utility functions for handling SQL date fields
 *
 * PostgreSQL stores dates as 'date' type (e.g., '2025-11-06') without timezone info.
 * When JavaScript parses these as `new Date('2025-11-06')`, it interprets them as
 * UTC midnight and then converts to local timezone, causing off-by-one-day bugs.
 *
 * These utilities ensure SQL dates are always interpreted as UTC to avoid timezone shifts.
 */

/**
 * Parse a SQL date string ('YYYY-MM-DD') as a UTC Date object
 *
 * Use this when loading date data from APIs to convert SQL date strings
 * to proper Date objects that won't shift due to timezone conversion.
 *
 * @param dateString - SQL date string like '2025-11-06' or Date object
 * @returns Date object representing midnight UTC on that date
 *
 * @example
 * // Parse dates when loading from API:
 * const workout = {
 *   ...apiData,
 *   date: parseDate(apiData.date) // '2025-11-06' → Date object
 * }
 *
 * // Then use normal Date operations:
 * workout.date.getUTCDate() // 6
 * workout.date.getUTCDay()  // Day of week
 */
export function parseDate(dateString: string | Date): Date {
  if (dateString instanceof Date) {
    return dateString
  }

  // dateString is now narrowed to string type
  return new Date(dateString + 'T00:00:00Z')
}

/**
 * Format a date for display in UTC
 *
 * Use this to display dates that were parsed with parseDate().
 * Forces UTC timezone to prevent display shifts.
 *
 * @param date - Date object or SQL date string
 * @param options - Intl.DateTimeFormat options (timeZone is forced to UTC)
 * @returns Formatted date string
 *
 * @example
 * formatDate(workout.date)  // "11/6/2025"
 * formatDate(workout.date, { weekday: 'long', month: 'long', day: 'numeric' })  // "Wednesday, November 6"
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const parsed = parseDate(date)
  return parsed.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    ...options
  })
}
