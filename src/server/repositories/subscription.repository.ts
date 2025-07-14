import { BaseRepository } from './base.repository';

export interface CreateSubscriptionData {
  userId: string;
  stripeSubscriptionId: string;
  status: string;
  planType: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface UpdateSubscriptionData {
  status?: string;
  planType?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

export class SubscriptionRepository extends BaseRepository {
  async create(subscriptionData: CreateSubscriptionData) {
    const result = await this.db
      .insertInto('subscriptions')
      .values({
        userId: subscriptionData.userId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        status: subscriptionData.status,
        planType: subscriptionData.planType,
        currentPeriodStart: subscriptionData.currentPeriodStart,
        currentPeriodEnd: subscriptionData.currentPeriodEnd,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        canceledAt: null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.parseSubscription(result);
  }

  async findById(id: string) {
    const result = await this.db
      .selectFrom('subscriptions')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    return result ? this.parseSubscription(result) : null;
  }

  async findByStripeId(stripeSubscriptionId: string) {
    const result = await this.db
      .selectFrom('subscriptions')
      .where('stripeSubscriptionId', '=', stripeSubscriptionId)
      .selectAll()
      .executeTakeFirst();

    return result ? this.parseSubscription(result) : null;
  }

  async findByUserId(userId: string) {
    const results = await this.db
      .selectFrom('subscriptions')
      .where('userId', '=', userId)
      .selectAll()
      .orderBy('createdAt', 'desc')
      .execute();

    return results.map(this.parseSubscription);
  }

  async findActiveByUserId(userId: string) {
    const result = await this.db
      .selectFrom('subscriptions')
      .where('userId', '=', userId)
      .where('status', '=', 'active')
      .selectAll()
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();

    return result ? this.parseSubscription(result) : null;
  }

  async update(id: string, subscriptionData: UpdateSubscriptionData) {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (subscriptionData.status !== undefined) updateData.status = subscriptionData.status;
    if (subscriptionData.planType !== undefined) updateData.planType = subscriptionData.planType;
    if (subscriptionData.currentPeriodStart !== undefined) {
      updateData.currentPeriodStart = new Date(subscriptionData.currentPeriodStart);
    }
    if (subscriptionData.currentPeriodEnd !== undefined) {
      updateData.currentPeriodEnd = new Date(subscriptionData.currentPeriodEnd);
    }

    const result = await this.db
      .updateTable('subscriptions')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.parseSubscription(result);
  }

  async cancel(id: string) {
    const result = await this.db
      .updateTable('subscriptions')
      .set({
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.parseSubscription(result);
  }

  private parseSubscription(row: {
    id: string;
    userId: string;
    stripeSubscriptionId: string;
    status: string;
    planType: string;
    currentPeriodStart: string | Date;
    currentPeriodEnd: string | Date;
    createdAt: string | Date;
    updatedAt: string | Date;
    canceledAt: string | Date | null;
  }) {
    return {
      id: row.id,
      userId: row.userId,
      stripeSubscriptionId: row.stripeSubscriptionId,
      status: row.status,
      planType: row.planType,
      currentPeriodStart: new Date(row.currentPeriodStart),
      currentPeriodEnd: new Date(row.currentPeriodEnd),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      canceledAt: row.canceledAt ? new Date(row.canceledAt) : null,
    };
  }
}