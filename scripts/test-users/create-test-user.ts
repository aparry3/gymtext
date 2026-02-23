/**
 * Create test users using the actual signup API flow
 *
 * Usage:
 *   pnpm signup --persona sarah-chen       # Create single user
 *   pnpm signup --persona marcus-johnson    # Example
 *   pnpm signup --all                       # Create all test users
 *   pnpm signup --list                      # List available personas
 *
 * Flow:
 *   1. Load persona JSON
 *   2. Clean up existing user (DB cleanup for idempotency)
 *   3. POST to /api/users/signup (same endpoint the UI hits)
 *   4. POST to /api/stripe/webhook (mocks Stripe checkout completion in test mode)
 *   5. Output: user ID, subscription status, ready to watch messages
 *
 * Environment:
 *   Requires DATABASE_URL in .env.local (for cleanup only)
 *   Requires local dev server running (pnpm dev)
 *   Set BASE_URL to override (default: http://localhost:3000)
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

const PERSONAS_DIR = resolve(__dirname, '../test-data/personas');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface Persona {
  id: string;
  detailLevel: string;
  userData: {
    name: string;
    phone: string;
    age?: number;
    gender?: string;
    timezone: string;
  };
  signupData: {
    experienceLevel?: string;
    desiredDaysPerWeek?: string;
    primaryGoals?: string[];
    goalsElaboration?: string;
    trainingLocation?: string;
    locationElaboration?: string;
    equipment?: string[];
    injuries?: string | null;
    experienceElaboration?: string;
    availabilityElaboration?: string;
  };
  onboardingMessages: string[];
}

function loadPersona(personaId: string): Persona {
  const files = readdirSync(PERSONAS_DIR).filter((f) => f.endsWith('.json'));
  const file = files.find((f) => {
    const content = JSON.parse(readFileSync(resolve(PERSONAS_DIR, f), 'utf-8'));
    return content.id === personaId;
  });
  if (!file) {
    throw new Error(`Persona not found: ${personaId}. Use --list to see available personas.`);
  }
  return JSON.parse(readFileSync(resolve(PERSONAS_DIR, file), 'utf-8'));
}

function loadAllPersonas(): Persona[] {
  const files = readdirSync(PERSONAS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();
  return files.map((f) => JSON.parse(readFileSync(resolve(PERSONAS_DIR, f), 'utf-8')));
}

function listPersonas(): void {
  const personas = loadAllPersonas();
  console.log('\n📋 Available test personas:\n');
  for (const p of personas) {
    console.log(`  ${p.id.padEnd(20)} ${p.userData.name.padEnd(22)} ${p.detailLevel.padEnd(10)} ${p.userData.phone}`);
  }
  console.log(`\n  Total: ${personas.length} personas\n`);
}

async function checkServerRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function deleteExistingUser(pool: Pool, phone: string): Promise<string | null> {
  const result = await pool.query('SELECT id FROM users WHERE phone_number = $1', [phone]);
  if (result.rows.length === 0) return null;

  const userId = result.rows[0].id;
  console.log(`  🗑️  Deleting existing user ${userId}...`);

  // Delete in order respecting foreign keys
  const tables = [
    'exercise_metrics',
    'workout_exercises',
    'workouts',
    'microcycles',
    'fitness_plans',
    'user_profiles',
    'onboarding_data',
    'messages',
    'subscriptions',
    'users',
  ];

  for (const table of tables) {
    const col = table === 'users' ? 'id' : 'user_id';
    try {
      await pool.query(`DELETE FROM ${table} WHERE ${col} = $1`, [userId]);
    } catch {
      // Table might not exist or column name differs - skip silently
    }
  }

  return userId;
}

/**
 * Create a test subscription by calling the Stripe webhook endpoint in test mode.
 * This exercises the real webhook handler without needing a real Stripe checkout.
 */
async function createTestSubscriptionViaWebhook(userId: string, personaId: string): Promise<void> {
  const webhookPayload = {
    id: `evt_test_${Date.now()}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: `cs_test_${Date.now()}`,
        customer: `cus_test_${personaId}`,
        subscription: `sub_test_${personaId}_${Date.now()}`,
        mode: 'subscription',
        metadata: {
          userId,
        },
        client_reference_id: userId,
      },
    },
  };

  console.log(`  📡 POST ${BASE_URL}/api/stripe/webhook (test mode)`);

  const response = await fetch(`${BASE_URL}/api/stripe/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-test-mode': 'true',
    },
    body: JSON.stringify(webhookPayload),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      `Webhook call failed (${response.status}): ${body.error || JSON.stringify(body)}`
    );
  }

  console.log(`  ✅ Webhook processed — subscription created via API`);
}

/**
 * Build the signup request body matching what the UI sends
 */
function buildSignupPayload(persona: Persona): Record<string, unknown> {
  return {
    // User data
    name: persona.userData.name,
    phoneNumber: persona.userData.phone,
    age: persona.userData.age?.toString(),
    gender: persona.userData.gender,
    timezone: persona.userData.timezone,
    preferredSendHour: 8,

    // Signup/fitness data
    ...persona.signupData,

    // Consent flags
    smsConsent: true,
    smsConsentedAt: new Date().toISOString(),
    acceptedRisks: true,
  };
}

async function createUserViaAPI(pool: Pool, persona: Persona): Promise<string> {
  console.log(`\n🔧 Creating user: ${persona.userData.name} (${persona.id})`);

  // Step 1: Clean up existing user
  const existingId = await deleteExistingUser(pool, persona.userData.phone);
  if (existingId) {
    console.log(`  ✅ Cleaned up existing user`);
  }

  // Step 2: Hit the actual signup endpoint
  console.log(`  📡 POST ${BASE_URL}/api/users/signup`);
  const payload = buildSignupPayload(persona);

  const response = await fetch(`${BASE_URL}/api/users/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(
      `Signup API failed (${response.status}): ${body.message || JSON.stringify(body)}`
    );
  }

  console.log(`  ✅ Signup API responded successfully`);

  if (body.checkoutUrl) {
    console.log(`  📎 Checkout URL: ${body.checkoutUrl} (skipping — creating test subscription)`);
  }
  if (body.redirectUrl) {
    console.log(`  📎 Redirect URL: ${body.redirectUrl} (existing subscribed user)`);
  }

  // Step 3: Look up the created user ID
  const userResult = await pool.query(
    'SELECT id FROM users WHERE phone_number = $1',
    [persona.userData.phone]
  );

  if (userResult.rows.length === 0) {
    throw new Error(`User not found in DB after signup API call for ${persona.userData.phone}`);
  }

  const userId = userResult.rows[0].id;
  console.log(`  ✅ User created: ${userId}`);

  // Step 4: Create test subscription via webhook endpoint
  // Only if the user doesn't already have one (re-onboard case)
  const subResult = await pool.query(
    "SELECT id FROM subscriptions WHERE user_id = $1 AND status = 'active'",
    [userId]
  );

  if (subResult.rows.length === 0) {
    await createTestSubscriptionViaWebhook(userId, persona.id);
    console.log(`  ⏳ Onboarding job triggered — messages will send once plan is generated`);
  } else {
    console.log(`  ✅ Active subscription already exists`);
  }

  return userId;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
🧪 GymText Test User Creator (API Flow)

Usage:
  pnpm signup --persona <persona-id>    Create a single test user via signup API
  pnpm signup --all                     Create all test users
  pnpm signup --list                    List available personas

Examples:
  pnpm signup --persona sarah-chen
  pnpm signup --persona marcus-johnson
  pnpm signup --all

Requires:
  - Local dev server running (pnpm dev)
  - DATABASE_URL in .env.local
`);
    process.exit(0);
  }

  if (args.includes('--list')) {
    listPersonas();
    process.exit(0);
  }

  // Parse --persona flag
  const personaIdx = args.indexOf('--persona');
  const personaId = personaIdx >= 0 ? args[personaIdx + 1] : (!args.includes('--all') ? args[0] : null);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  // Check if dev server is running
  console.log(`\n🔍 Checking dev server at ${BASE_URL}...`);
  const serverUp = await checkServerRunning();
  if (!serverUp) {
    console.error(`❌ Dev server not reachable at ${BASE_URL}`);
    console.error(`   Start it with: pnpm dev`);
    console.error(`   Or set BASE_URL to point to your running server`);
    process.exit(1);
  }
  console.log(`✅ Dev server is running\n`);

  const pool = new Pool({ connectionString: dbUrl });

  try {
    if (args.includes('--all')) {
      const personas = loadAllPersonas();
      console.log(`🚀 Creating ${personas.length} test users via signup API...\n`);
      const results: Array<{ id: string; name: string; userId: string }> = [];

      for (const persona of personas) {
        try {
          const userId = await createUserViaAPI(pool, persona);
          results.push({ id: persona.id, name: persona.userData.name, userId });
        } catch (err: any) {
          console.error(`  ❌ Failed for ${persona.id}: ${err.message}`);
        }
      }

      console.log('\n' + '='.repeat(60));
      console.log('📊 Summary:\n');
      for (const r of results) {
        console.log(`  ✅ ${r.name.padEnd(22)} ${r.id.padEnd(20)} ${r.userId}`);
      }
      console.log(`\n  Total: ${results.length} users created`);
      console.log(`\n  Watch messages: pnpm local:sms`);
    } else {
      if (!personaId) {
        console.error('❌ Specify a persona: pnpm signup --persona <id>');
        process.exit(1);
      }
      const persona = loadPersona(personaId);
      const userId = await createUserViaAPI(pool, persona);
      console.log(`\n✅ Done! User ID: ${userId}`);
      console.log(`\n  Watch messages: pnpm local:sms`);
    }
  } catch (err) {
    console.error('\n❌ Error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
