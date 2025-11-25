/**
 * Microcycle Formatting Utilities
 *
 * Pure functions for formatting microcycle data into string representations
 * for use in prompts, messages, and other contexts.
 */

import type { MicrocyclePattern } from '@/server/models/microcycle/schema';

/**
 * Simple day input with day name and content
 */
interface DayInput {
  day: string;    // Day name (e.g., "MONDAY")
  content: string; // Day overview content
}

/**
 * Format a microcycle day into a string representation
 *
 * @param day - Day object with name and content
 * @returns Formatted string with day details
 */
export function formatMicrocycleDay(day: DayInput): string {
  return `Day: ${day.day}\n${day.content}`;
}

/**
 * Format all days of a microcycle into a summary
 *
 * @param days - Array of 7 day overview strings
 * @returns Formatted multi-line string with all days
 */
export function formatMicrocycleDays(days: string[]): string {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return days.map((content, index) => {
    const dayName = dayNames[index] || `Day ${index + 1}`;
    return `## ${dayName}\n${content}`;
  }).join('\n\n');
}

/**
 * Format a full microcycle pattern into a readable overview
 *
 * @param pattern - Complete microcycle pattern
 * @returns Formatted overview string
 */
export function formatMicrocyclePattern(pattern: MicrocyclePattern): string {
  const sections: string[] = [];

  // Overview
  sections.push(`# Weekly Overview\n${pattern.overview}`);

  // Deload indicator
  if (pattern.isDeload) {
    sections.push('**Note: This is a DELOAD week**');
  }

  // Days
  sections.push(formatMicrocycleDays(pattern.days));

  return sections.join('\n\n');
}
