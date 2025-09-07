/**
 * Time parsing utilities for natural language time expressions
 * Used to extract preferred send hours from conversational input
 */

/**
 * Parse natural language time expressions into 24-hour format
 * 
 * Handles formats like:
 * - "8am", "8 AM", "8:00 AM"
 * - "6pm", "6 PM", "6:00 PM" 
 * - "morning" (defaults to 8am)
 * - "afternoon" (defaults to 2pm)
 * - "evening" (defaults to 6pm)
 * - "night" (defaults to 8pm)
 * 
 * @param timeStr - Natural language time string
 * @returns Hour in 24-hour format (0-23) or null if invalid
 */
export function parseTimeExpression(timeStr: string | null | undefined): number | null {
  if (!timeStr || typeof timeStr !== 'string') {
    return null;
  }
  
  const cleaned = timeStr.toLowerCase().trim();
  
  // Handle general time periods
  switch (cleaned) {
    case 'morning':
    case 'early morning':
      return 8;
    case 'late morning':
      return 10;
    case 'noon':
    case 'midday':
      return 12;
    case 'afternoon':
    case 'early afternoon':
      return 14;
    case 'late afternoon':
      return 16;
    case 'evening':
    case 'early evening':
      return 18;
    case 'late evening':
      return 20;
    case 'night':
      return 20;
  }
  
  // Handle specific time formats
  // Match patterns like "8am", "8:00 AM", "6 pm", etc.
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i;
  const match = cleaned.match(timeRegex);
  
  if (!match) {
    return null;
  }
  
  let hour = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = match[3] ? match[3].toLowerCase().replace('.', '') : null;
  
  // Validate hour and minutes
  if (hour < 1 || hour > 12 && !meridian) {
    if (hour < 0 || hour > 23) {
      return null;
    }
    // 24-hour format
    return minutes > 0 ? null : hour; // Only accept exact hours for simplicity
  }
  
  if (minutes < 0 || minutes > 59) {
    return null;
  }
  
  // Convert to 24-hour format
  if (meridian) {
    if (meridian.startsWith('pm') || meridian.startsWith('p.m')) {
      if (hour !== 12) {
        hour += 12;
      }
    } else if (meridian.startsWith('am') || meridian.startsWith('a.m')) {
      if (hour === 12) {
        hour = 0;
      }
    }
  } else {
    // No meridian specified - assume reasonable defaults
    if (hour >= 6 && hour <= 11) {
      // 6-11 without AM/PM likely morning
      // Keep as-is
    } else if (hour >= 1 && hour <= 5) {
      // 1-5 without AM/PM likely afternoon/evening
      hour += 12;
    }
    // 12 without meridian is ambiguous - default to noon
    if (hour === 12) {
      hour = 12;
    }
  }
  
  // Only return exact hours (ignore minutes for simplicity)
  return minutes === 0 ? hour : null;
}

/**
 * Format hour (0-23) for display in 12-hour format
 * 
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Formatted time string like "8:00 AM" or null if invalid
 */
export function formatHourForDisplay(hour: number | null | undefined): string | null {
  if (typeof hour !== 'number' || hour < 0 || hour > 23) {
    return null;
  }
  
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const meridian = hour < 12 ? 'AM' : 'PM';
  
  return `${displayHour}:00 ${meridian}`;
}

/**
 * Validate that hour is in valid range (0-23)
 * 
 * @param hour - Hour to validate
 * @returns true if valid hour, false otherwise
 */
export function isValidHour(hour: number | null | undefined): hour is number {
  return typeof hour === 'number' && hour >= 0 && hour <= 23 && Number.isInteger(hour);
}

/**
 * Common workout times with their typical hours
 */
export const COMMON_WORKOUT_TIMES = {
  'early morning': 6,
  'morning': 8,
  'late morning': 10,
  'lunch time': 12,
  'afternoon': 14,
  'evening': 18,
  'night': 20,
} as const;

/**
 * Get suggestions for ambiguous time inputs
 * 
 * @param input - User's time input
 * @returns Array of suggested times with descriptions
 */
export function getTimeSuggestions(input: string): Array<{ hour: number; description: string }> {
  const cleaned = input.toLowerCase().trim();
  const suggestions: Array<{ hour: number; description: string }> = [];
  
  // If input contains workout-related context, suggest common workout times
  if (cleaned.includes('workout') || cleaned.includes('exercise') || cleaned.includes('gym')) {
    suggestions.push(
      { hour: 6, description: 'Early morning (6:00 AM)' },
      { hour: 8, description: 'Morning (8:00 AM)' },
      { hour: 12, description: 'Lunch time (12:00 PM)' },
      { hour: 18, description: 'Evening (6:00 PM)' }
    );
  } else {
    // General suggestions
    suggestions.push(
      { hour: 8, description: 'Morning (8:00 AM)' },
      { hour: 12, description: 'Midday (12:00 PM)' },
      { hour: 18, description: 'Evening (6:00 PM)' }
    );
  }
  
  return suggestions;
}