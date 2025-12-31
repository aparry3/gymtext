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

/**
 * Validate if a timezone string is a valid IANA timezone identifier
 * 
 * @param timezone - Timezone string to validate
 * @returns true if valid IANA timezone, false otherwise
 */
export function isValidTimezone(timezone: string | null | undefined): boolean {
  if (!timezone || typeof timezone !== 'string') {
    return false;
  }
  
  // First check if it's in our common timezones list
  if (COMMON_TIMEZONES.includes(timezone as CommonTimezone)) {
    return true;
  }
  
  // Then try to validate using Intl.DateTimeFormat
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get timezone suggestions based on partial input
 * 
 * @param input - Partial timezone or location input
 * @returns Array of suggested timezones with display names
 */
export function getTimezoneSuggestions(input: string): Array<{ timezone: string; display: string }> {
  if (!input || input.length < 2) {
    // Return most common US timezones
    return [
      { timezone: 'America/New_York', display: 'New York (Eastern Time)' },
      { timezone: 'America/Chicago', display: 'Chicago (Central Time)' },
      { timezone: 'America/Denver', display: 'Denver (Mountain Time)' },
      { timezone: 'America/Los_Angeles', display: 'Los Angeles (Pacific Time)' },
    ];
  }
  
  const cleaned = input.toLowerCase().trim();
  const suggestions: Array<{ timezone: string; display: string }> = [];
  
  // Filter common timezones that match the input
  for (const timezone of COMMON_TIMEZONES) {
    const display = formatTimezoneForDisplay(timezone);
    const city = timezone.split('/')[1]?.replace(/_/g, ' ').toLowerCase() || '';
    const region = timezone.split('/')[0]?.toLowerCase() || '';
    
    if (
      timezone.toLowerCase().includes(cleaned) ||
      display.toLowerCase().includes(cleaned) ||
      city.includes(cleaned) ||
      region.includes(cleaned)
    ) {
      suggestions.push({ timezone, display });
    }
  }
  
  return suggestions.slice(0, 5); // Limit to top 5 suggestions
}