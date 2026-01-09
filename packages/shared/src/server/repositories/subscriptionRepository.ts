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
export class SubscriptionRepository extends BaseRepository {
  /**
   * Create a new subscription
   */
  async create(data: CreateSubscriptionData): Promise<Subscription> {
    const subscription: NewSubscription = {
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
  async updateByStripeId(
    stripeSubscriptionId: string,
    data: SubscriptionUpdate
  ): Promise<Subscription> {
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
  async findByClientId(clientId: string): Promise<Subscription[]> {
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
  async findByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('stripeSubscriptionId', '=', stripeSubscriptionId)
      .executeTakeFirst() ?? null;
  }

  /**
   * Get active subscription for client
   */
  async getActiveSubscription(clientId: string): Promise<Subscription | null> {
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
  async hasActiveSubscription(clientId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(clientId);
    return subscription !== null;
  }

  /**
   * Cancel subscription
   */
  async cancel(stripeSubscriptionId: string, canceledAt: Date): Promise<Subscription> {
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
  async scheduleCancellation(stripeSubscriptionId: string): Promise<Subscription> {
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
  async reactivate(stripeSubscriptionId: string): Promise<Subscription> {
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
  async findActiveForMessaging(clientId: string): Promise<Subscription | null> {
    return await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('clientId', '=', clientId)
      .where('status', '=', 'active')
      .orderBy('createdAt', 'desc')
      .executeTakeFirst() ?? null;
  }

  /**
   * Count all active subscriptions (for dashboard)
   */
  async countActive(): Promise<number> {
    const result = await this.db
      .selectFrom('subscriptions')
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .where('status', '=', 'active')
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }

  /**
   * Count active subscriptions as of a specific date
   */
  async countActiveAsOf(date: Date): Promise<number> {
    const result = await this.db
      .selectFrom('subscriptions')
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .where('status', '=', 'active')
      .where('createdAt', '<=', date)
      .where((eb) => eb.or([
        eb('canceledAt', 'is', null),
        eb('canceledAt', '>', date),
      ]))
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }
}
