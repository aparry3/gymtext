import { ShortLink, CreateShortLinkOptions, ResolvedShortLink } from '@/server/models/shortLink';
/**
 * Service for managing short links
 * Provides business logic for creating, resolving, and managing short links
 */
export declare class ShortLinkService {
    private static instance;
    private repository;
    private readonly DEFAULT_EXPIRY_DAYS;
    private constructor();
    static getInstance(): ShortLinkService;
    /**
     * Create a short link
     * Generates a unique code and stores the mapping
     *
     * @param clientId - Client ID to associate with the link
     * @param targetPath - Path to redirect to (e.g., /me/program/workouts/123)
     * @param options - Optional configuration (custom code, expiration)
     * @returns The created short link
     */
    createShortLink(clientId: string, targetPath: string, options?: CreateShortLinkOptions): Promise<ShortLink>;
    /**
     * Resolve a short link by code
     * Returns the link and whether it's expired
     * Increments access count if link is valid
     *
     * @param code - The short link code to resolve
     * @returns ResolvedShortLink with link and expiration status, or null if not found
     */
    resolveShortLink(code: string): Promise<ResolvedShortLink | null>;
    /**
     * Create a short link for a workout
     * Convenience method for workout links
     *
     * @param userId - User ID
     * @param workoutId - Workout ID
     * @param options - Optional configuration
     * @returns The created short link
     */
    createWorkoutLink(userId: string, workoutId: string, options?: CreateShortLinkOptions): Promise<ShortLink>;
    /**
     * Create a short link for a user's profile
     * Convenience method for profile links
     *
     * @param userId - User ID
     * @param options - Optional configuration
     * @returns The created short link
     */
    createProfileLink(userId: string, options?: CreateShortLinkOptions): Promise<ShortLink>;
    /**
     * Get the full URL for a short link code
     * Uses SHORT_LINK_DOMAIN environment variable
     *
     * @param code - The short link code
     * @returns Full URL (e.g., https://gtxt.ai/l/aSxc2)
     */
    getFullUrl(code: string): string;
    /**
     * Clean up expired short links
     * Should be run periodically via cron job
     *
     * @returns Number of deleted links
     */
    cleanupExpiredLinks(): Promise<number>;
}
export declare const shortLinkService: ShortLinkService;
//# sourceMappingURL=shortLinkService.d.ts.map