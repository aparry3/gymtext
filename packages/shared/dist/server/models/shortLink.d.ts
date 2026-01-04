/**
 * ShortLink Model
 *
 * Represents a short link for SMS messages and other content.
 * Short links provide automatic authentication and direct access to resources.
 */
import { Selectable, Insertable, Updateable } from 'kysely';
import { ShortLinks } from './_types';
/**
 * Type for selecting short links from the database
 */
export type ShortLink = Selectable<ShortLinks>;
/**
 * Type for inserting short links into the database
 */
export type NewShortLink = Insertable<ShortLinks>;
/**
 * Type for updating short links in the database
 */
export type ShortLinkUpdate = Updateable<ShortLinks>;
/**
 * Options for creating a short link
 */
export interface CreateShortLinkOptions {
    /** Optional custom code (must be 5 alphanumeric chars) */
    code?: string;
    /** Optional expiration date */
    expiresAt?: Date;
}
/**
 * Result of resolving a short link
 */
export interface ResolvedShortLink {
    /** The short link object */
    link: ShortLink;
    /** Whether the link has expired */
    isExpired: boolean;
}
//# sourceMappingURL=shortLink.d.ts.map