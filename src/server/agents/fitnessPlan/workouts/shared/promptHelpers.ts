/**
 * Shared Workout Prompt Helper Functions
 *
 * This module contains utility functions used across all workout generation agents
 * to format context data for prompts.
 */

import { DateTime } from 'luxon';
import { WorkoutInstance } from '@/server/models/workout';

/**
 * Format recent workouts for inclusion in prompts
 * Returns the SMS messages from the most recent workouts
 * @param workouts - Array of recent workout instances
 * @param timezone - User's timezone for date formatting (kept for backward compatibility)
 * @returns Formatted string with recent workout messages
 */
export function formatRecentWorkouts(workouts: WorkoutInstance[], timezone: string): string {
  if (!workouts || workouts.length === 0) {
    return 'No recent workouts';
  }

  return workouts
    .slice(0, 3) // Last 3 workouts
    .map(w => {
      const dateInUserTz = DateTime.fromJSDate(new Date(w.date)).setZone(timezone);
      const date = dateInUserTz.toLocaleString({ month: 'short', day: 'numeric' });
      const message = w.message || 'No message available';
      return `**${date}:**\n${message}`;
    })
    .join('\n\n');
}

