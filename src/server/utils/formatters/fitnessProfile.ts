/**
 * Fitness Profile Formatting Utilities
 *
 * Pure functions for formatting user fitness profile data into string representations
 * for use in prompts, messages, and other contexts.
 */

import type { UserWithProfile } from "@/server/models/userModel";

/**
 * Format a user's fitness profile into a structured string representation
 *
 * Converts user demographics and fitness profile data into a human-readable format
 * using the summary fields from each profile section.
 *
 * @param user - User object with profile data
 * @returns Formatted multi-line string with all available profile details
 *
 * @example
 * ```typescript
 * const formatted = formatFitnessProfile(user);
 * // Returns:
 * // CLIENT: John Doe
 * // AGE: 32
 * // GOALS: Build strength and muscle mass
 * // SCHEDULE: 4 days per week, 60 min sessions
 * // ...
 * ```
 */
export function formatFitnessProfile(user: UserWithProfile): string {
  const profileSections: string[] = [];

  // Basic demographics - always include
  profileSections.push(`CLIENT: ${user.name}`);
  if (user.age) profileSections.push(`AGE: ${user.age}`);
  if (user.gender) profileSections.push(`GENDER: ${user.gender}`);

  // Return minimal info if no profile
  if (!user.profile) {
    return profileSections.join(' | ') + ' | STATUS: No fitness profile available';
  }

  // Goals summary - core motivation and objectives
  if (user.profile.goals?.summary) {
    profileSections.push(`GOALS: ${user.profile.goals.summary}`);
  }

  // Availability summary - training schedule and time constraints
  if (user.profile.availability?.summary) {
    profileSections.push(`SCHEDULE: ${user.profile.availability.summary}`);
  }

  // Equipment access summary - training environment and resources
  if (user.profile.equipmentAccess?.summary) {
    profileSections.push(`EQUIPMENT: ${user.profile.equipmentAccess.summary}`);
  }

  // Physical metrics summary - current fitness level and measurements
  if (user.profile.metrics?.summary) {
    profileSections.push(`METRICS: ${user.profile.metrics.summary}`);
  }

  // Activity experience summaries - background in different training types
  if (user.profile.activities?.length) {
    user.profile.activities.forEach(activity => {
      if (activity.summary) {
        const activityType = activity.type.toUpperCase();
        profileSections.push(`${activityType}: ${activity.summary}`);
      }
    });
  }

  // Active constraints - injuries, limitations, or preferences to consider
  if (user.profile.constraints?.length) {
    const activeConstraints = user.profile.constraints
      .filter(c => c.status === 'active')
      .map(c => c.description);

    if (activeConstraints.length > 0) {
      profileSections.push(`CONSTRAINTS: ${activeConstraints.join('; ')}`);
    }
  }

  return profileSections.join('\n\n');
}
