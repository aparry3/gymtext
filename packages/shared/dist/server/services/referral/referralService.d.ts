import { ReferralStats } from '@/server/models/referral';
export interface ValidateReferralResult {
    valid: boolean;
    referrerId?: string;
    referrerName?: string;
    error?: string;
}
export interface CreditReferrerResult {
    success: boolean;
    creditId?: string;
    error?: string;
}
/**
 * ReferralService
 *
 * Manages the referral program where users can share their referral code.
 * When someone signs up with a referral code:
 * - The referee (new user) gets their first month free via Stripe coupon
 * - The referrer gets a credit applied when the referee's payment succeeds
 *
 * Users can earn up to 12 free months via referrals.
 */
export declare class ReferralService {
    private static instance;
    private referralRepo;
    private userRepo;
    private constructor();
    static getInstance(): ReferralService;
    /**
     * Get or create a user's referral code
     */
    getOrCreateReferralCode(userId: string): Promise<string | null>;
    /**
     * Get referral stats for displaying on the /me page
     */
    getReferralStats(userId: string): Promise<ReferralStats | null>;
    /**
     * Validate a referral code before signup
     * Checks that the code exists and prevents self-referral
     */
    validateReferralCode(code: string, signupPhone?: string): Promise<ValidateReferralResult>;
    /**
     * Complete a referral when a referee signs up
     * Creates the referral record in the database
     */
    completeReferral(referralCode: string, refereeUserId: string): Promise<void>;
    /**
     * Apply credit to the referrer's Stripe account
     * Called by webhook when referee's payment succeeds
     */
    creditReferrer(refereeUserId: string): Promise<CreditReferrerResult>;
    /**
     * Get or create the Stripe coupon for referee's first month free
     */
    getRefereeCouponId(): Promise<string>;
    /**
     * Check if a user can still earn referral credits
     */
    canEarnCredits(userId: string): Promise<boolean>;
}
export declare const referralService: ReferralService;
//# sourceMappingURL=referralService.d.ts.map