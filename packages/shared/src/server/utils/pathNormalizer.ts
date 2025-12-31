/**
 * Path Normalization Utility
 *
 * Normalizes URLs for analytics by replacing dynamic params with placeholders.
 * This makes it easy to query aggregate page visit data.
 *
 * Edge-compatible (no Node.js-specific APIs).
 */

/**
 * Regex patterns for detecting dynamic path segments.
 * UUIDs, numeric IDs, and short link codes.
 */
const DYNAMIC_SEGMENT_PATTERNS = [
  // UUID pattern (with or without hyphens)
  /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i,
  // Numeric ID
  /^\d+$/,
  // Short link code (5 alphanumeric characters)
  /^[A-Za-z0-9]{5}$/,
];

/**
 * Query params that should preserve their actual values (not be normalized).
 */
const PRESERVED_QUERY_PARAMS = ['source', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

/**
 * Check if a path segment is dynamic (should be replaced with placeholder).
 */
function isDynamicSegment(segment: string): boolean {
  return DYNAMIC_SEGMENT_PATTERNS.some((pattern) => pattern.test(segment));
}

/**
 * Get the appropriate placeholder for a path segment.
 * Uses :code for short link codes, :id for everything else.
 */
function getPlaceholder(segment: string, pathContext: string): string {
  // If we're in /l/ path and segment is 5 chars, use :code
  if (pathContext === '/l' && /^[A-Za-z0-9]{5}$/.test(segment)) {
    return ':code';
  }
  return ':id';
}

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
export function normalizePath(url: string): string {
  // Parse the URL - handle both full URLs and paths
  let pathname: string;
  let searchParams: URLSearchParams;

  try {
    // Try parsing as full URL first
    const parsed = new URL(url, 'http://localhost');
    pathname = parsed.pathname;
    searchParams = parsed.searchParams;
  } catch {
    // Fallback: treat as simple pathname
    const [path, query] = url.split('?');
    pathname = path;
    searchParams = new URLSearchParams(query || '');
  }

  // Normalize path segments
  const segments = pathname.split('/').filter(Boolean);
  const normalizedSegments: string[] = [];
  let pathContext = '';

  for (const segment of segments) {
    // Build path context for placeholder selection
    pathContext = `/${normalizedSegments.join('/')}`;

    if (isDynamicSegment(segment)) {
      normalizedSegments.push(getPlaceholder(segment, pathContext));
    } else {
      normalizedSegments.push(segment);
    }
  }

  const normalizedPath = '/' + normalizedSegments.join('/');

  // Normalize query params
  const normalizedParams: string[] = [];

  // Sort params for consistent ordering
  const sortedKeys = Array.from(searchParams.keys()).sort();

  for (const key of sortedKeys) {
    const value = searchParams.get(key);
    if (value === null) continue;

    if (PRESERVED_QUERY_PARAMS.includes(key)) {
      // Preserve the actual value for marketing params
      normalizedParams.push(`${key}=${value}`);
    } else if (isDynamicSegment(value)) {
      // Replace dynamic values with placeholder
      normalizedParams.push(`${key}=:id`);
    } else {
      // Keep static values as-is
      normalizedParams.push(`${key}=${value}`);
    }
  }

  // Build final normalized path
  if (normalizedParams.length > 0) {
    return `${normalizedPath}?${normalizedParams.join('&')}`;
  }

  return normalizedPath;
}

/**
 * Extract the source query parameter from a URL.
 * Returns null if not present.
 */
export function extractSource(url: string): string | null {
  try {
    const parsed = new URL(url, 'http://localhost');
    return parsed.searchParams.get('source');
  } catch {
    const match = url.match(/[?&]source=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
