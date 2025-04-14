import { db } from './db';

// Interface for subscription creation data
export interface CreateSubscriptionData {
  user_id: string;
  stripe_subscription_id: string;
  status: string;
  plan_type: string;
  current_period_start: string;
  current_period_end: string;
}

// Function to create a new subscription
export async function createSubscription(subscriptionData: CreateSubscriptionData) {
  return await db
    .insertInto('subscriptions')
    .values({
      user_id: subscriptionData.user_id,
      stripe_subscription_id: subscriptionData.stripe_subscription_id,
      status: subscriptionData.status,
      plan_type: subscriptionData.plan_type,
      current_period_start: subscriptionData.current_period_start,
      current_period_end: subscriptionData.current_period_end,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      canceled_at: null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

// Function to get a subscription by Stripe subscription ID
export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  return await db
    .selectFrom('subscriptions')
    .where('stripe_subscription_id', '=', stripeSubscriptionId)
    .selectAll()
    .executeTakeFirst();
}

// Function to get all subscriptions for a user
export async function getUserSubscriptions(userId: string) {
  return await db
    .selectFrom('subscriptions')
    .where('user_id', '=', userId)
    .selectAll()
    .execute();
}

// Function to update a subscription
export async function updateSubscription(id: string, subscriptionData: Partial<CreateSubscriptionData>) {
  return await db
    .updateTable('subscriptions')
    .set({
      ...subscriptionData,
      current_period_start: subscriptionData.current_period_start
      ? new Date(subscriptionData.current_period_start)
      : undefined,
      current_period_end: subscriptionData.current_period_end
      ? new Date(subscriptionData.current_period_end)
      : undefined,
      updated_at: new Date(),
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
      canceled_at: new Date(),
      updated_at: new Date(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();
} 