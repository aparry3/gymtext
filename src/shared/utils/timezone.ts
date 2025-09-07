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
 * Parse location/timezone information from natural language
 * 
 * @param locationStr - Natural language location string
 * @returns IANA timezone identifier or null if not found
 */
export function parseLocationToTimezone(locationStr: string | null | undefined): string | null {
  if (!locationStr || typeof locationStr !== 'string') {
    return null;
  }
  
  const cleaned = locationStr.toLowerCase().trim();
  
  // US locations
  const usLocationMappings: Record<string, string> = {
    // States
    'california': 'America/Los_Angeles',
    'ca': 'America/Los_Angeles',
    'new york': 'America/New_York',
    'ny': 'America/New_York',
    'texas': 'America/Chicago',
    'tx': 'America/Chicago',
    'florida': 'America/New_York',
    'fl': 'America/New_York',
    'illinois': 'America/Chicago',
    'il': 'America/Chicago',
    'washington': 'America/Los_Angeles',
    'wa': 'America/Los_Angeles',
    'oregon': 'America/Los_Angeles',
    'or': 'America/Los_Angeles',
    'colorado': 'America/Denver',
    'co': 'America/Denver',
    'arizona': 'America/Phoenix',
    'az': 'America/Phoenix',
    'utah': 'America/Denver',
    'ut': 'America/Denver',
    
    // Cities
    'los angeles': 'America/Los_Angeles',
    'san francisco': 'America/Los_Angeles',
    'seattle': 'America/Los_Angeles',
    'portland': 'America/Los_Angeles',
    'denver': 'America/Denver',
    'chicago': 'America/Chicago',
    'dallas': 'America/Chicago',
    'houston': 'America/Chicago',
    'atlanta': 'America/New_York',
    'miami': 'America/New_York',
    'new york city': 'America/New_York',
    'nyc': 'America/New_York',
    'boston': 'America/New_York',
    'philadelphia': 'America/New_York',
    'washington dc': 'America/New_York',
    'dc': 'America/New_York',
    
    // Regions
    'west coast': 'America/Los_Angeles',
    'east coast': 'America/New_York',
    'pacific': 'America/Los_Angeles',
    'mountain': 'America/Denver',
    'central': 'America/Chicago',
    'eastern': 'America/New_York',
    
    // Time zones (colloquial)
    'pacific time': 'America/Los_Angeles',
    'pst': 'America/Los_Angeles',
    'pdt': 'America/Los_Angeles',
    'mountain time': 'America/Denver',
    'mst': 'America/Denver',
    'mdt': 'America/Denver',
    'central time': 'America/Chicago',
    'cst': 'America/Chicago',
    'cdt': 'America/Chicago',
    'eastern time': 'America/New_York',
    'est': 'America/New_York',
    'edt': 'America/New_York',
  };
  
  // Check US mappings first
  for (const [key, timezone] of Object.entries(usLocationMappings)) {
    if (cleaned.includes(key)) {
      return timezone;
    }
  }
  
  // International locations (basic mapping)
  const intlLocationMappings: Record<string, string> = {
    'london': 'Europe/London',
    'uk': 'Europe/London',
    'england': 'Europe/London',
    'britain': 'Europe/London',
    'paris': 'Europe/Paris',
    'france': 'Europe/Paris',
    'berlin': 'Europe/Berlin',
    'germany': 'Europe/Berlin',
    'tokyo': 'Asia/Tokyo',
    'japan': 'Asia/Tokyo',
    'sydney': 'Australia/Sydney',
    'australia': 'Australia/Sydney',
    'toronto': 'America/Toronto',
    'canada': 'America/Toronto',
    'vancouver': 'America/Vancouver',
  };
  
  for (const [key, timezone] of Object.entries(intlLocationMappings)) {
    if (cleaned.includes(key)) {
      return timezone;
    }
  }
  
  return null;
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