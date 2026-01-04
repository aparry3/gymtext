import { BaseRepository } from './baseRepository';
/**
 * Repository for managing user authentication codes
 * Handles storage and retrieval of SMS verification codes
 */
export class UserAuthRepository extends BaseRepository {
    /**
     * Create a new authentication code for a phone number
     */
    async createAuthCode(phoneNumber, code, expiresAt) {
        await this.db
            .insertInto('userAuthCodes')
            .values({
            phoneNumber,
            code,
            expiresAt,
            createdAt: new Date(),
        })
            .execute();
    }
    /**
     * Find a valid (non-expired) auth code for a phone number
     * Returns the code if found and not expired, null otherwise
     */
    async findValidCode(phoneNumber, code) {
        const result = await this.db
            .selectFrom('userAuthCodes')
            .select(['id', 'phoneNumber'])
            .where('phoneNumber', '=', phoneNumber)
            .where('code', '=', code)
            .where('expiresAt', '>', new Date())
            .executeTakeFirst();
        return result || null;
    }
    /**
     * Delete all auth codes for a phone number
     * Used after successful verification or to clear old codes
     */
    async deleteCodesForPhone(phoneNumber) {
        await this.db
            .deleteFrom('userAuthCodes')
            .where('phoneNumber', '=', phoneNumber)
            .execute();
    }
    /**
     * Delete all expired auth codes
     * Should be run periodically to clean up the database
     */
    async deleteExpiredCodes() {
        const result = await this.db
            .deleteFrom('userAuthCodes')
            .where('expiresAt', '<', new Date())
            .executeTakeFirst();
        return Number(result.numDeletedRows || 0);
    }
    /**
     * Count recent auth code requests for a phone number
     * Used for rate limiting
     */
    async countRecentRequests(phoneNumber, since) {
        const result = await this.db
            .selectFrom('userAuthCodes')
            .select((eb) => eb.fn.countAll().as('count'))
            .where('phoneNumber', '=', phoneNumber)
            .where('createdAt', '>=', since)
            .executeTakeFirst();
        return Number(result?.count || 0);
    }
}
