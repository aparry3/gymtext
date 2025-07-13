import { db } from './db';

// Interface for subscription creation data
export interface CreateSubscriptionData {
  userId: string;
  stripeSubscriptionId: string;
  status: string;
  planType: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

// Function to create a new subscription
export async function createSubscription(subscriptionData: CreateSubscriptionData) {
  return await db
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
}

// Function to get a subscription by Stripe subscription ID
export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  return await db
    .selectFrom('subscriptions')
    .where('stripeSubscriptionId', '=', stripeSubscriptionId)
    .selectAll()
    .executeTakeFirst();
}

// Function to get all subscriptions for a user
export async function getUserSubscriptions(userId: string) {
  return await db
    .selectFrom('subscriptions')
    .where('userId', '=', userId)
    .selectAll()
    .execute();
}

// Function to update a subscription
export async function updateSubscription(id: string, subscriptionData: Partial<CreateSubscriptionData>) {
  return await db
    .updateTable('subscriptions')
    .set({
      ...subscriptionData,
      currentPeriodStart: subscriptionData.currentPeriodStart
      ? new Date(subscriptionData.currentPeriodStart)
      : undefined,
      currentPeriodEnd: subscriptionData.currentPeriodEnd
      ? new Date(subscriptionData.currentPeriodEnd)
      : undefined,
      updatedAt: new Date(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

// Function to cancel a subscription
export async function cancelSubscription(id: string) {
  return await db
    .updateTable('subscriptions')
    .set({
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
} 