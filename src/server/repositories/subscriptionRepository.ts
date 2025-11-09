import { BaseRepository } from './baseRepository';
import type { Subscriptions } from '../models/_types';
import type { Insertable, Selectable, Updateable } from 'kysely';

export type Subscription = Selectable<Subscriptions>;
export type NewSubscription = Insertable<Subscriptions>;
export type SubscriptionUpdate = Updateable<Subscriptions>;

export interface CreateSubscriptionData {
  userId: string;
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
      userId: data.userId,
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
   * Find subscription by user ID
   */
  async findByUserId(userId: string): Promise<Subscription[]> {
    return await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('userId', '=', userId)
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
   * Get active subscription for user
   */
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    return await this.db
      .selectFrom('subscriptions')
      .selectAll()
      .where('userId', '=', userId)
      .where('status', '=', 'active')
      .orderBy('createdAt', 'desc')
      .executeTakeFirst() ?? null;
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
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
}
