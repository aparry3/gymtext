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
 * Returns the markdown profile with basic user demographics prepended.
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
 * //
 * // [markdown profile content]
 * ```
 */
export function formatFitnessProfile(user: UserWithProfile): string {
  const headerParts: string[] = [];

  // Basic demographics - always include
  headerParts.push(`CLIENT: ${user.name}`);
  if (user.age) headerParts.push(`AGE: ${user.age}`);
  if (user.gender) headerParts.push(`GENDER: ${user.gender}`);

  const header = headerParts.join(' | ');

  // Return minimal info if no profile
  if (!user.profile) {
    return header + '\n\nSTATUS: No fitness profile available';
  }

  // Return header + profile
  return header + '\n\n' + user.profile;
}
