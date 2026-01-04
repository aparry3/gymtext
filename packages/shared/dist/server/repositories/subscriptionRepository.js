import { BaseRepository } from './baseRepository';
/**
 * SubscriptionRepository
 *
 * Manages Stripe subscription records
 */
export class SubscriptionRepository extends BaseRepository {
    /**
     * Create a new subscription
     */
    async create(data) {
        const subscription = {
            clientId: data.clientId,
            stripeSubscriptionId: data.stripeSubscriptionId,
            status: data.status,
            planType: data.planType,
            currentPeriodStart: data.currentPeriodStart,
            currentPeriodEnd: data.currentPeriodEnd,
        };
        return await this.db
            .insertInto('subscriptions')
            .values(subscription)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    /**
     * Update subscription by Stripe subscription ID
     */
    async updateByStripeId(stripeSubscriptionId, data) {
        return await this.db
            .updateTable('subscriptions')
            .set(data)
            .where('stripeSubscriptionId', '=', stripeSubscriptionId)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    /**
     * Find subscription by client ID
     */
    async findByClientId(clientId) {
        return await this.db
            .selectFrom('subscriptions')
            .selectAll()
            .where('clientId', '=', clientId)
            .orderBy('createdAt', 'desc')
            .execute();
    }
    /**
     * Find subscription by Stripe subscription ID
     */
    async findByStripeId(stripeSubscriptionId) {
        return await this.db
            .selectFrom('subscriptions')
            .selectAll()
            .where('stripeSubscriptionId', '=', stripeSubscriptionId)
            .executeTakeFirst() ?? null;
    }
    /**
     * Get active subscription for client
     */
    async getActiveSubscription(clientId) {
        return await this.db
            .selectFrom('subscriptions')
            .selectAll()
            .where('clientId', '=', clientId)
            .where('status', '=', 'active')
            .orderBy('createdAt', 'desc')
            .executeTakeFirst() ?? null;
    }
    /**
     * Check if client has active subscription
     */
    async hasActiveSubscription(clientId) {
        const subscription = await this.getActiveSubscription(clientId);
        return subscription !== null;
    }
    /**
     * Cancel subscription
     */
    async cancel(stripeSubscriptionId, canceledAt) {
        return await this.db
            .updateTable('subscriptions')
            .set({
            status: 'canceled',
            canceledAt,
        })
            .where('stripeSubscriptionId', '=', stripeSubscriptionId)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    /**
     * Schedule subscription for cancellation at period end
     * Sets status to 'cancel_pending' - messages will stop immediately
     */
    async scheduleCancellation(stripeSubscriptionId) {
        return await this.db
            .updateTable('subscriptions')
            .set({ status: 'cancel_pending' })
            .where('stripeSubscriptionId', '=', stripeSubscriptionId)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    /**
     * Reactivate subscription (clear pending cancellation)
     * Sets status back to 'active'
     */
    async reactivate(stripeSubscriptionId) {
        return await this.db
            .updateTable('subscriptions')
            .set({ status: 'active' })
            .where('stripeSubscriptionId', '=', stripeSubscriptionId)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    /**
     * Find active subscription eligible for messaging
     * Only returns subscriptions with status 'active' (excludes 'cancel_pending')
     */
    async findActiveForMessaging(clientId) {
        return await this.db
            .selectFrom('subscriptions')
            .selectAll()
            .where('clientId', '=', clientId)
            .where('status', '=', 'active')
            .orderBy('createdAt', 'desc')
            .executeTakeFirst() ?? null;
    }
}
