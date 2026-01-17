import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  console.log('Starting backfill for existing users...');

  // =====================================================
  // BACKFILL USER_ONBOARDING TABLE
  // =====================================================
  console.log('Backfilling user_onboarding records...');

  // Insert user_onboarding records for users who don't have one yet
  // Mark them as completed since they're already in the system
  await sql`
    INSERT INTO user_onboarding (
      user_id,
      signup_data,
      status,
      started_at,
      completed_at,
      program_messages_sent,
      created_at,
      updated_at
    )
    SELECT
      u.id as user_id,
      NULL as signup_data,
      'completed' as status,
      u.created_at as started_at,
      u.created_at as completed_at,
      true as program_messages_sent,
      u.created_at as created_at,
      u.created_at as updated_at
    FROM users u
    WHERE NOT EXISTS (
      SELECT 1 FROM user_onboarding uo WHERE uo.user_id = u.id
    )
  `.execute(db);

  const onboardingResult = await sql<{ count: string }>`
    SELECT COUNT(*) as count
    FROM user_onboarding
    WHERE signup_data IS NULL
  `.execute(db);

  console.log(`Backfilled ${onboardingResult.rows[0]?.count || 0} user_onboarding records`);

  // =====================================================
  // BACKFILL SUBSCRIPTIONS TABLE
  // =====================================================
  console.log('Backfilling subscriptions records...');

  // Insert subscription records for users who don't have one yet
  // Give them free "monthly" plans that never expire
  await sql`
    INSERT INTO subscriptions (
      user_id,
      stripe_subscription_id,
      status,
      plan_type,
      current_period_start,
      current_period_end,
      canceled_at,
      created_at,
      updated_at
    )
    SELECT
      u.id as user_id,
      CONCAT('free_legacy_', u.id) as stripe_subscription_id,
      'active' as status,
      'monthly' as plan_type,
      u.created_at as current_period_start,
      '2125-01-01 00:00:00+00'::timestamptz as current_period_end,
      NULL as canceled_at,
      u.created_at as created_at,
      u.created_at as updated_at
    FROM users u
    WHERE NOT EXISTS (
      SELECT 1 FROM subscriptions s WHERE s.user_id = u.id
    )
  `.execute(db);

  const subscriptionResult = await sql<{ count: string }>`
    SELECT COUNT(*) as count
    FROM subscriptions
    WHERE stripe_subscription_id LIKE 'free_legacy_%'
  `.execute(db);

  console.log(`Backfilled ${subscriptionResult.rows[0]?.count || 0} subscription records`);
  console.log('Backfill complete!');
}

export async function down(db: Kysely<any>): Promise<void> {
  console.log('Rolling back backfill...');

  // Remove backfilled subscriptions (identified by free_legacy_ prefix)
  await sql`
    DELETE FROM subscriptions
    WHERE stripe_subscription_id LIKE 'free_legacy_%'
  `.execute(db);

  console.log('Removed backfilled subscriptions');

  // Remove backfilled user_onboarding records (identified by NULL signup_data and completed status)
  await sql`
    DELETE FROM user_onboarding
    WHERE signup_data IS NULL
    AND status = 'completed'
    AND program_messages_sent = true
  `.execute(db);

  console.log('Removed backfilled user_onboarding records');
  console.log('Rollback complete!');
}
