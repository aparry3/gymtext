/**
 * Path Normalization Utility
 *
 * Normalizes URLs for analytics by replacing dynamic params with placeholders.
 * This makes it easy to query aggregate page visit data.
 *
 * Edge-compatible (no Node.js-specific APIs).
 */
/**
 * Normalize a URL path for analytics.
 *
 * Examples:
 * - /l/abc12 → /l/:code
 * - /me?workout=uuid-123 → /me?workout=:id
 * - /me?workout=uuid-123&source=sms → /me?workout=:id&source=sms
 * - /me/program/workouts/uuid-456 → /me/program/workouts/:id
 *
 * @param url - The URL or pathname to normalize
 * @returns Normalized path string
 */
export declare function normalizePath(url: string): string;
/**
 * Extract the source query parameter from a URL.
 * Returns null if not present.
 */
export declare function extractSource(url: string): string | null;
//# sourceMappingURL=pathNormalizer.d.ts.map