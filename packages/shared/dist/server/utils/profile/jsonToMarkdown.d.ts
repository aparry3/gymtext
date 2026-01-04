/**
 * Markdown Profile Utilities
 *
 * Provides utilities for creating Markdown "Living Dossier" format profiles.
 */
import type { User } from '@/server/models/user';
/**
 * Create a default/empty Markdown profile
 * Used when creating a new user with no profile data
 */
export declare function createEmptyProfile(user?: Partial<User>): string;
//# sourceMappingURL=jsonToMarkdown.d.ts.map