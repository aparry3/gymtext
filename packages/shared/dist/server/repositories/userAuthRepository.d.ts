import { BaseRepository } from './baseRepository';
/**
 * Repository for managing user authentication codes
 * Handles storage and retrieval of SMS verification codes
 */
export declare class UserAuthRepository extends BaseRepository {
    /**
     * Create a new authentication code for a phone number
     */
    createAuthCode(phoneNumber: string, code: string, expiresAt: Date): Promise<void>;
    /**
     * Find a valid (non-expired) auth code for a phone number
     * Returns the code if found and not expired, null otherwise
     */
    findValidCode(phoneNumber: string, code: string): Promise<{
        id: string;
        phoneNumber: string;
    } | null>;
    /**
     * Delete all auth codes for a phone number
     * Used after successful verification or to clear old codes
     */
    deleteCodesForPhone(phoneNumber: string): Promise<void>;
    /**
     * Delete all expired auth codes
     * Should be run periodically to clean up the database
     */
    deleteExpiredCodes(): Promise<number>;
    /**
     * Count recent auth code requests for a phone number
     * Used for rate limiting
     */
    countRecentRequests(phoneNumber: string, since: Date): Promise<number>;
}
//# sourceMappingURL=userAuthRepository.d.ts.map