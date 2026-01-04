import { BaseRepository } from './baseRepository';
import { ShortLink, NewShortLink } from '../models/shortLink';
/**
 * Repository for managing short links
 * Handles storage, retrieval, and cleanup of short link mappings
 */
export declare class ShortLinkRepository extends BaseRepository {
    /**
     * Generate a random 5-character alphanumeric code
     * Uses uppercase, lowercase, and numbers (62 possible characters)
     */
    generateUniqueCode(): string;
    /**
     * Create a new short link
     * Uses upsert strategy: if code already exists, overwrites with new link
     */
    createShortLink(link: NewShortLink): Promise<ShortLink>;
    /**
     * Find a short link by code
     * Returns the link if found, null otherwise
     */
    findByCode(code: string): Promise<ShortLink | null>;
    /**
     * Increment access count and update last accessed time
     * Called when a short link is resolved
     */
    incrementAccessCount(id: string): Promise<void>;
    /**
     * Delete expired short links
     * Should be run periodically to clean up the database
     */
    deleteExpiredLinks(): Promise<number>;
    /**
     * Delete all short links for a client
     * Useful for cleanup when a client is deleted
     */
    deleteByClientId(clientId: string): Promise<number>;
    /**
     * Find all short links for a client
     * Useful for admin views or user dashboards
     */
    findByClientId(clientId: string): Promise<ShortLink[]>;
}
//# sourceMappingURL=shortLinkRepository.d.ts.map