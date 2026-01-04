import { createRepositories } from '../repositories/factory';
// Cache service containers by environment mode
const containerCache = new Map();
/**
 * Get a service container for the given environment context
 *
 * @param ctx - Environment context with db, twilio, stripe connections
 * @returns Service container with context-aware services
 */
export function getServices(ctx) {
    const cacheKey = ctx.mode;
    // Return cached container if available
    const cached = containerCache.get(cacheKey);
    if (cached) {
        return cached;
    }
    // Create new service container
    const container = {
        repos: createRepositories(ctx.db),
        ctx,
    };
    // Cache for reuse
    containerCache.set(cacheKey, container);
    return container;
}
/**
 * Clear the service container cache (for testing)
 */
export function clearServiceCache() {
    containerCache.clear();
}
