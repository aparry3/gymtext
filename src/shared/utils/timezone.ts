/**
 * Client-side timezone utilities
 * These are safe to use in React components
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