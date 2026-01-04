import { BaseRepository } from './baseRepository';
import type { Subscriptions } from '../models/_types';
import type { Insertable, Selectable, Updateable } from 'kysely';
export type Subscription = Selectable<Subscriptions>;
export type NewSubscription = Insertable<Subscriptions>;
export type SubscriptionUpdate = Updateable<Subscriptions>;
export interface CreateSubscriptionData {
    clientId: string;
    stripeSubscriptionId: string;
    status: string;
    planType: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
}
/**
 * SubscriptionRepository
 *
 * Manages Stripe subscription records
 */
export declare class SubscriptionRepository extends BaseRepository {
    /**
     * Create a new subscription
     */
    create(data: CreateSubscriptionData): Promise<Subscription>;
    /**
     * Update subscription by Stripe subscription ID
     */
    updateByStripeId(stripeSubscriptionId: string, data: SubscriptionUpdate): Promise<Subscription>;
    /**
     * Find subscription by client ID
     */
    findByClientId(clientId: string): Promise<Subscription[]>;
    /**
     * Find subscription by Stripe subscription ID
     */
    findByStripeId(stripeSubscriptionId: string): Promise<Subscription | null>;
    /**
     * Get active subscription for client
     */
    getActiveSubscription(clientId: string): Promise<Subscription | null>;
    /**
     * Check if client has active subscription
     */
    hasActiveSubscription(clientId: string): Promise<boolean>;
    /**
     * Cancel subscription
     */
    cancel(stripeSubscriptionId: string, canceledAt: Date): Promise<Subscription>;
    /**
     * Schedule subscription for cancellation at period end
     * Sets status to 'cancel_pending' - messages will stop immediately
     */
    scheduleCancellation(stripeSubscriptionId: string): Promise<Subscription>;
    /**
     * Reactivate subscription (clear pending cancellation)
     * Sets status back to 'active'
     */
    reactivate(stripeSubscriptionId: string): Promise<Subscription>;
    /**
     * Find active subscription eligible for messaging
     * Only returns subscriptions with status 'active' (excludes 'cancel_pending')
     */
    findActiveForMessaging(clientId: string): Promise<Subscription | null>;
}
//# sourceMappingURL=subscriptionRepository.d.ts.map