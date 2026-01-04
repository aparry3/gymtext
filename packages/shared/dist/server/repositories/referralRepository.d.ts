import { BaseRepository } from './baseRepository';
import { Referral } from '../models/referral';
/**
 * Repository for managing referrals
 * Handles storage and retrieval of referral relationships
 */
export declare class ReferralRepository extends BaseRepository {
    /**
     * Create a new referral record
     * Called when a referee signs up using a referral code
     */
    create(referrerId: string, refereeId: string): Promise<Referral>;
    /**
     * Find a referral by referee ID
     * Used by webhook to find the referral when crediting the referrer
     */
    findByRefereeId(refereeId: string): Promise<Referral | null>;
    /**
     * Find all referrals for a referrer
     * Used for displaying referral stats on the /me page
     */
    findByReferrerId(referrerId: string): Promise<Referral[]>;
    /**
     * Mark a referral as credited
     * Called after successfully applying credit to the referrer's Stripe account
     */
    markCreditApplied(id: string, amountCents: number): Promise<Referral>;
    /**
     * Count credits earned by a referrer
     * Only counts referrals where credit was actually applied
     */
    countCreditsEarned(referrerId: string): Promise<number>;
    /**
     * Count total referrals by a referrer (regardless of credit status)
     */
    countByReferrer(referrerId: string): Promise<number>;
    /**
     * Check if a user has already been referred
     * Each user can only be referred once
     */
    hasBeenReferred(refereeId: string): Promise<boolean>;
}
//# sourceMappingURL=referralRepository.d.ts.map