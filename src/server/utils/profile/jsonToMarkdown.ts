/**
 * Markdown Profile Utilities
 *
 * Provides utilities for creating Markdown "Living Dossier" format profiles.
 */

import type { User } from '@/server/models/user/schemas';

/**
 * Create a default/empty Markdown profile
 * Used when creating a new user with no profile data
 */
export function createEmptyProfile(user?: Partial<User>): string {
  const sections: string[] = [];

  // Minimal IDENTITY section
  const identityLines: string[] = ['# IDENTITY'];
  if (user?.name) {
    identityLines.push(`**Name:** ${user.name}`);
  }
  if (user?.age) {
    identityLines.push(`**Age:** ${user.age}`);
  }
  sections.push(identityLines.join('\n'));

  return sections.join('\n\n');
}
