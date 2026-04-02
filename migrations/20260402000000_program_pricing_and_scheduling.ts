import { Migration, sql } from 'kysely';

/**
 * PROGRAM PRICING & SCHEDULING
 *
 * Adds Stripe pricing columns to programs table so each program can have
 * its own Stripe Product and Price. Also drops the scheduling_type column
 * (simplified to just URL + notes).
 *
 * Pricing columns:
 * - stripe_product_id: The Stripe Product ID for this program
 * - stripe_price_id: The Stripe Price ID (used in checkout sessions)
 * - price_amount_cents: Display cache of the price amount (avoids Stripe API calls for UI)
 * - price_currency: Currency code (defaults to 'usd')
 */

export const up: Migration = async (db) => {
  console.log('Adding pricing columns to programs table...');

  await sql`ALTER TABLE programs ADD COLUMN IF NOT EXISTS stripe_product_id TEXT`.execute(db);
  console.log('  ✓ programs.stripe_product_id added');

  await sql`ALTER TABLE programs ADD COLUMN IF NOT EXISTS stripe_price_id TEXT`.execute(db);
  console.log('  ✓ programs.stripe_price_id added');

  await sql`ALTER TABLE programs ADD COLUMN IF NOT EXISTS price_amount_cents INTEGER`.execute(db);
  console.log('  ✓ programs.price_amount_cents added');

  await sql`ALTER TABLE programs ADD COLUMN IF NOT EXISTS price_currency TEXT DEFAULT 'usd'`.execute(db);
  console.log('  ✓ programs.price_currency added');

  // Drop scheduling_type — simplified to just URL + notes
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS scheduling_type`.execute(db);
  console.log('  ✓ programs.scheduling_type dropped');

  console.log('Done — pricing columns added, scheduling_type dropped.');
};

export const down: Migration = async (db) => {
  console.log('Reverting program pricing & scheduling changes...');

  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS stripe_product_id`.execute(db);
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS stripe_price_id`.execute(db);
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS price_amount_cents`.execute(db);
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS price_currency`.execute(db);
  await sql`ALTER TABLE programs ADD COLUMN scheduling_type TEXT`.execute(db);

  console.log('Done — pricing columns removed, scheduling_type restored.');
};
