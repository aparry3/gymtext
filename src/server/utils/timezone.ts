/**
 * Timezone utilities for handling IANA timezone validation and conversions
 */

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

// We'll implement the actual validation after installing Luxon
export function isValidIANATimezone(timezone: string): boolean {
  // Temporary implementation - will be replaced with Luxon
  // Basic format check: Region/City
  const timezoneRegex = /^[A-Za-z]+\/[A-Za-z_]+$/;
  return timezoneRegex.test(timezone);
}

export function getLocalHourForTimezone(utcDate: Date, timezone: string): number {
  // Temporary implementation - will be replaced with Luxon
  // This is a placeholder that assumes UTC for now
  if (!isValidIANATimezone(timezone)) {
    throw new Error(`Invalid IANA timezone: ${timezone}`);
  }
  return utcDate.getHours();
}

export function convertPreferredHourToUTC(localHour: number, timezone: string): number {
  // Temporary implementation - will be replaced with Luxon
  if (!isValidIANATimezone(timezone)) {
    throw new Error(`Invalid IANA timezone: ${timezone}`);
  }
  if (localHour < 0 || localHour > 23) {
    throw new Error(`Invalid hour: ${localHour}. Must be between 0 and 23`);
  }
  return localHour;
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