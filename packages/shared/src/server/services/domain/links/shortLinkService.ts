import { ShortLink, CreateShortLinkOptions, ResolvedShortLink } from '@/server/models/shortLink';
import { getShortLinksConfig } from '@/shared/config';
import type { RepositoryContainer } from '../../../repositories/factory';

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * ShortLinkServiceInstance interface
 *
 * Defines all public methods available on the short link service.
 */
export interface ShortLinkServiceInstance {
  createShortLink(clientId: string, targetPath: string, options?: CreateShortLinkOptions): Promise<ShortLink>;
  resolveShortLink(code: string): Promise<ResolvedShortLink | null>;
  createWorkoutLink(userId: string, workoutId: string, options?: CreateShortLinkOptions): Promise<ShortLink>;
  createProfileLink(userId: string, options?: CreateShortLinkOptions): Promise<ShortLink>;
  getFullUrl(code: string): string;
  cleanupExpiredLinks(): Promise<number>;
}

/**
 * Create a ShortLinkService instance with injected repositories
 *
 * @param repos - Repository container with all repositories
 * @returns ShortLinkServiceInstance
 */
export function createShortLinkService(repos: RepositoryContainer): ShortLinkServiceInstance {
  const DEFAULT_EXPIRY_DAYS = getShortLinksConfig().defaultExpiryDays;

  return {
    async createShortLink(
      clientId: string,
      targetPath: string,
      options?: CreateShortLinkOptions
    ): Promise<ShortLink> {
      const code = options?.code || repos.shortLink.generateUniqueCode();
      const expiresAt =
        options?.expiresAt ||
        new Date(Date.now() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      const link = await repos.shortLink.createShortLink({
        code,
        targetPath,
        clientId,
        expiresAt,
      });

      console.log(`[ShortLinkService] Created short link: ${code} -> ${targetPath}`);
      return link;
    },

    async resolveShortLink(code: string): Promise<ResolvedShortLink | null> {
      const link = await repos.shortLink.findByCode(code);

      if (!link) {
        console.log(`[ShortLinkService] Short link not found: ${code}`);
        return null;
      }

      const isExpired =
        link.expiresAt !== null && new Date(link.expiresAt) < new Date();

      if (isExpired) {
        console.log(`[ShortLinkService] Short link expired: ${code}`);
        return { link, isExpired: true };
      }

      repos.shortLink.incrementAccessCount(link.id).catch((err) => {
        console.error(`[ShortLinkService] Failed to increment access count for ${code}:`, err);
      });

      console.log(`[ShortLinkService] Resolved short link: ${code} -> ${link.targetPath}`);
      return { link, isExpired: false };
    },

    async createWorkoutLink(
      userId: string,
      workoutId: string,
      options?: CreateShortLinkOptions
    ): Promise<ShortLink> {
      const targetPath = `/me?workout=${workoutId}`;
      return this.createShortLink(userId, targetPath, options);
    },

    async createProfileLink(
      userId: string,
      options?: CreateShortLinkOptions
    ): Promise<ShortLink> {
      const targetPath = '/me';
      return this.createShortLink(userId, targetPath, options);
    },

    getFullUrl(code: string): string {
      const domain = getShortLinksConfig().domain || 'https://gtxt.ai';
      return `${domain}/l/${code}`;
    },

    async cleanupExpiredLinks(): Promise<number> {
      try {
        const deletedCount = await repos.shortLink.deleteExpiredLinks();
        console.log(`[ShortLinkService] Cleaned up ${deletedCount} expired short links`);
        return deletedCount;
      } catch (error) {
        console.error('[ShortLinkService] Error cleaning up expired links:', error);
        return 0;
      }
    },
  };
}

