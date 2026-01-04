export interface CancelResult {
    success: boolean;
    periodEndDate?: Date;
    error?: string;
}
export interface ReactivateResult {
    success: boolean;
    reactivated: boolean;
    requiresNewSubscription: boolean;
    checkoutUrl?: string;
    error?: string;
}
/**
 * SubscriptionService
 *
 * Manages subscription cancellation and reactivation via SMS commands (STOP/START)
 *
 * Status flow:
 * - 'active' -> user sends STOP -> 'cancel_pending' (messages stop, sub cancels at period end)
 * - 'cancel_pending' -> user sends START -> 'active' (reactivated)
 * - 'cancel_pending' -> period ends -> 'canceled' (handled by Stripe webhook)
 * - 'canceled' -> user sends START -> new checkout session required
 */
export declare class SubscriptionService {
    private static instance;
    private subscriptionRepo;
    private userRepo;
    private constructor();
    static getInstance(): SubscriptionService;
    /**
     * Cancel user's subscription via STOP command
     * Sets cancel_at_period_end in Stripe and status to 'cancel_pending' locally
     * User keeps access but messages stop immediately
     */
    cancelSubscription(userId: string): Promise<CancelResult>;
    /**
     * Reactivate user's subscription via START command
     * If cancel_at_period_end was set, clears it and sets status back to 'active'
     * If fully canceled, returns checkout URL for new subscription
     */
    reactivateSubscription(userId: string): Promise<ReactivateResult>;
    /**
     * Check if user should receive messages
     * Only users with status='active' (not 'cancel_pending') receive messages
     */
    shouldReceiveMessages(userId: string): Promise<boolean>;
    /**
     * Create a new checkout session for resubscription
     */
    private createResubscriptionSession;
}
export declare const subscriptionService: SubscriptionService;
//# sourceMappingURL=subscriptionService.d.ts.map