/**
 * Create test users from persona JSON files
 *
 * Usage:
 *   pnpm test:create-user <persona-id>       # Create single user
 *   pnpm test:create-user sarah-chen          # Example
 *   pnpm test:create-user --all               # Create all test users
 *   pnpm test:create-user --list              # List available personas
 *
 * Features:
 *   - Loads persona from JSON file
 *   - Deletes existing user with same phone (idempotent)
 *   - Creates user in database
 *   - Creates test Stripe subscription directly in DB
 *   - Creates onboarding record with signup data
 *   - Outputs: user ID, subscription status
 *
 * Environment:
 *   Requires DATABASE_URL in .env.local
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { resolve, basename } from 'path';

const PERSONAS_DIR = resolve(__dirname, '../test-data/personas');

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

async function deleteExistingUser(pool: Pool, phone: string): Promise<string | null> {
  // Find existing user
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

async function createUser(pool: Pool, persona: Persona): Promise<string> {
  const userId = randomUUID();
  const now = new Date().toISOString();

  console.log(`\n🔧 Creating user: ${persona.userData.name} (${persona.id})`);

  // Step 1: Delete existing user with same phone
  const existingId = await deleteExistingUser(pool, persona.userData.phone);
  if (existingId) {
    console.log(`  ✅ Cleaned up existing user`);
  }

  // Step 2: Create user
  await pool.query(
    `INSERT INTO users (id, name, phone_number, age, gender, timezone, preferred_send_hour, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
    [
      userId,
      persona.userData.name,
      persona.userData.phone,
      persona.userData.age || null,
      persona.userData.gender || null,
      persona.userData.timezone,
      8, // default preferred send hour
      now,
    ]
  );
  console.log(`  ✅ User created: ${userId}`);

  // Step 3: Create test subscription (bypass Stripe)
  const subId = randomUUID();
  try {
    await pool.query(
      `INSERT INTO subscriptions (id, user_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
      [
        subId,
        userId,
        `sub_test_${persona.id}`,
        `cus_test_${persona.id}`,
        'active',
        now,
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        now,
      ]
    );
    console.log(`  ✅ Test subscription created (active)`);
  } catch (err: any) {
    // If subscriptions table has different columns, try minimal insert
    console.log(`  ⚠️  Subscription insert failed: ${err.message}. Trying alternative...`);
    try {
      await pool.query(
        `INSERT INTO subscriptions (id, user_id, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $4)`,
        [subId, userId, 'active', now]
      );
      console.log(`  ✅ Test subscription created (minimal)`);
    } catch {
      console.log(`  ⚠️  Could not create subscription - may need manual setup`);
    }
  }

  // Step 4: Create onboarding record
  try {
    await pool.query(
      `INSERT INTO onboarding_data (id, user_id, signup_data, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $5)`,
      [
        randomUUID(),
        userId,
        JSON.stringify(persona.signupData),
        'completed',
        now,
      ]
    );
    console.log(`  ✅ Onboarding record created`);
  } catch (err: any) {
    console.log(`  ⚠️  Onboarding insert failed: ${err.message}`);
  }

  // Step 5: Store onboarding messages as message records
  for (let i = 0; i < persona.onboardingMessages.length; i++) {
    try {
      await pool.query(
        `INSERT INTO messages (id, user_id, role, content, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          randomUUID(),
          userId,
          'user',
          persona.onboardingMessages[i],
          new Date(Date.now() - (persona.onboardingMessages.length - i) * 60000).toISOString(),
        ]
      );
    } catch {
      // Messages table might have different schema
    }
  }
  console.log(`  ✅ ${persona.onboardingMessages.length} onboarding messages stored`);

  return userId;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
🧪 GymText Test User Creator

Usage:
  pnpm test:create-user <persona-id>    Create a single test user
  pnpm test:create-user --all           Create all test users
  pnpm test:create-user --list          List available personas

Examples:
  pnpm test:create-user sarah-chen
  pnpm test:create-user marcus-johnson
  pnpm test:create-user --all
`);
    process.exit(0);
  }

  if (args.includes('--list')) {
    listPersonas();
    process.exit(0);
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });

  try {
    if (args.includes('--all')) {
      const personas = loadAllPersonas();
      console.log(`\n🚀 Creating ${personas.length} test users...\n`);
      const results: Array<{ id: string; name: string; userId: string }> = [];

      for (const persona of personas) {
        const userId = await createUser(pool, persona);
        results.push({ id: persona.id, name: persona.userData.name, userId });
      }

      console.log('\n' + '='.repeat(60));
      console.log('📊 Summary:\n');
      for (const r of results) {
        console.log(`  ✅ ${r.name.padEnd(22)} ${r.id.padEnd(20)} ${r.userId}`);
      }
      console.log(`\n  Total: ${results.length} users created`);
    } else {
      const personaId = args[0];
      const persona = loadPersona(personaId);
      const userId = await createUser(pool, persona);
      console.log(`\n✅ Done! User ID: ${userId}`);
    }
  } catch (err) {
    console.error('\n❌ Error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
