/**
 * Timezone utilities for handling IANA timezone validation and conversions
 */
import { DateTime, IANAZone } from 'luxon';

// Common IANA timezones for UI selection
export const COMMON_TIMEZONES = [
  // Americas
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Sao_Paulo',
  
  // Europe
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Moscow',
  
  // Asia Pacific
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Mumbai',
  'Asia/Dubai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
] as const;

export type CommonTimezone = typeof COMMON_TIMEZONES[number];

/**
 * Validates if a string is a valid IANA timezone identifier
 */
export function isValidIANATimezone(timezone: string): boolean {
  return IANAZone.isValidZone(timezone);
}

/**
 * Gets the local hour for a given UTC date in a specific timezone
 */
export function getLocalHourForTimezone(utcDate: Date, timezone: string): number {
  if (!isValidIANATimezone(timezone)) {
    throw new Error(`Invalid IANA timezone: ${timezone}`);
  }
  
  const dt = DateTime.fromJSDate(utcDate, { zone: 'utc' }).setZone(timezone);
  return dt.hour;
}

/**
 * Converts a preferred local hour to UTC hour for a given timezone
 * Returns the UTC hour when it's the specified local hour in the given timezone
 */
export function convertPreferredHourToUTC(localHour: number, timezone: string): number {
  if (!isValidIANATimezone(timezone)) {
    throw new Error(`Invalid IANA timezone: ${timezone}`);
  }
  if (localHour < 0 || localHour > 23) {
    throw new Error(`Invalid hour: ${localHour}. Must be between 0 and 23`);
  }
  
  // Get current date in the target timezone
  const now = DateTime.now().setZone(timezone);
  // Set to the desired local hour
  const targetTime = now.set({ hour: localHour, minute: 0, second: 0, millisecond: 0 });
  // Convert to UTC and get the hour
  const utcTime = targetTime.setZone('utc');
  return utcTime.hour;
}

/**
 * Gets all UTC hours when it's the specified local hour in the given timezone
 * This accounts for DST transitions where a local hour might occur at different UTC hours
 */
export function getAllUTCHoursForLocalHour(localHour: number, timezone: string): number[] {
  if (!isValidIANATimezone(timezone)) {
    throw new Error(`Invalid IANA timezone: ${timezone}`);
  }
  
  const hours = new Set<number>();
  const now = DateTime.now();
  
  // Check for the next 365 days to cover all DST transitions
  for (let i = 0; i < 365; i++) {
    const date = now.plus({ days: i }).setZone(timezone);
    const targetTime = date.set({ hour: localHour, minute: 0, second: 0, millisecond: 0 });
    const utcTime = targetTime.setZone('utc');
    hours.add(utcTime.hour);
  }
  
  return Array.from(hours).sort((a, b) => a - b);
}

export function getCommonTimezones(): readonly string[] {
  return COMMON_TIMEZONES;
}

// Helper to format timezone for display
export function formatTimezoneForDisplay(timezone: string): string {
  // Convert America/New_York to "New York (America)"
  const parts = timezone.split('/');
  if (parts.length === 2) {
    const city = parts[1].replace(/_/g, ' ');
    return `${city} (${parts[0]})`;
  }
  return timezone;
}