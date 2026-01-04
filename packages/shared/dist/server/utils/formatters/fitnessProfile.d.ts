/**
 * Fitness Profile Formatting Utilities
 *
 * Pure functions for formatting user fitness profile data into string representations
 * for use in prompts, messages, and other contexts.
 */
import type { UserWithProfile } from "@/server/models/user";
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
export declare function formatFitnessProfile(user: UserWithProfile): string;
//# sourceMappingURL=fitnessProfile.d.ts.map