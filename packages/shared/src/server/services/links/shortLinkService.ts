import { ShortLinkRepository } from '@/server/repositories/shortLinkRepository';
import { ShortLink, CreateShortLinkOptions, ResolvedShortLink } from '@/server/models/shortLink';
import { getShortLinksConfig } from '@/shared/config';

/**
 * Service for managing short links
 * Provides business logic for creating, resolving, and managing short links
 */
export class ShortLinkService {
  private static instance: ShortLinkService;
  private repository: ShortLinkRepository;

  // Default expiration from config
  private readonly DEFAULT_EXPIRY_DAYS = getShortLinksConfig().defaultExpiryDays;

  private constructor() {
    this.repository = new ShortLinkRepository();
  }

  public static getInstance(): ShortLinkService {
    if (!ShortLinkService.instance) {
      ShortLinkService.instance = new ShortLinkService();
    }
    return ShortLinkService.instance;
  }

  /**
   * Create a short link
   * Generates a unique code and stores the mapping
   *
   * @param clientId - Client ID to associate with the link
   * @param targetPath - Path to redirect to (e.g., /me/program/workouts/123)
   * @param options - Optional configuration (custom code, expiration)
   * @returns The created short link
   */
  async createShortLink(
    clientId: string,
    targetPath: string,
    options?: CreateShortLinkOptions
  ): Promise<ShortLink> {
    // Generate or use provided code
    const code = options?.code || this.repository.generateUniqueCode();

    // Calculate expiration date
    const expiresAt =
      options?.expiresAt ||
      new Date(Date.now() + this.DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    // Create the link (will upsert if code already exists)
    const link = await this.repository.createShortLink({
      code,
      targetPath,
      clientId,
      expiresAt,
    });

    console.log(`[ShortLinkService] Created short link: ${code} -> ${targetPath}`);
    return link;
  }

  /**
   * Resolve a short link by code
   * Returns the link and whether it's expired
   * Increments access count if link is valid
   *
   * @param code - The short link code to resolve
   * @returns ResolvedShortLink with link and expiration status, or null if not found
   */
  async resolveShortLink(code: string): Promise<ResolvedShortLink | null> {
    const link = await this.repository.findByCode(code);

    if (!link) {
      console.log(`[ShortLinkService] Short link not found: ${code}`);
      return null;
    }

    // Check if expired
    const isExpired =
      link.expiresAt !== null && new Date(link.expiresAt) < new Date();

    if (isExpired) {
      console.log(`[ShortLinkService] Short link expired: ${code}`);
      return { link, isExpired: true };
    }

    // Increment access count asynchronously (don't wait)
    this.repository.incrementAccessCount(link.id).catch((err) => {
      console.error(`[ShortLinkService] Failed to increment access count for ${code}:`, err);
    });

    console.log(`[ShortLinkService] Resolved short link: ${code} -> ${link.targetPath}`);
    return { link, isExpired: false };
  }

  /**
   * Create a short link for a workout
   * Convenience method for workout links
   *
   * @param userId - User ID
   * @param workoutId - Workout ID
   * @param options - Optional configuration
   * @returns The created short link
   */
  async createWorkoutLink(
    userId: string,
    workoutId: string,
    options?: CreateShortLinkOptions
  ): Promise<ShortLink> {
    const targetPath = `/me?workout=${workoutId}`;
    return this.createShortLink(userId, targetPath, options);
  }

  /**
   * Create a short link for a user's profile
   * Convenience method for profile links
   *
   * @param userId - User ID
   * @param options - Optional configuration
   * @returns The created short link
   */
  async createProfileLink(
    userId: string,
    options?: CreateShortLinkOptions
  ): Promise<ShortLink> {
    const targetPath = '/me';
    return this.createShortLink(userId, targetPath, options);
  }

  /**
   * Get the full URL for a short link code
   * Uses SHORT_LINK_DOMAIN environment variable
   *
   * @param code - The short link code
   * @returns Full URL (e.g., https://gtxt.ai/l/aSxc2)
   */
  getFullUrl(code: string): string {
    const domain = getShortLinksConfig().domain || 'https://gtxt.ai';
    return `${domain}/l/${code}`;
  }

  /**
   * Clean up expired short links
   * Should be run periodically via cron job
   *
   * @returns Number of deleted links
   */
  async cleanupExpiredLinks(): Promise<number> {
    try {
      const deletedCount = await this.repository.deleteExpiredLinks();
      console.log(`[ShortLinkService] Cleaned up ${deletedCount} expired short links`);
      return deletedCount;
    } catch (error) {
      console.error('[ShortLinkService] Error cleaning up expired links:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const shortLinkService = ShortLinkService.getInstance();
