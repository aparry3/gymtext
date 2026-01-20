import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

/**
 * Production to Dev Data Anonymization Script
 *
 * This script:
 * 1. Reads from production (DATABASE_URL)
 * 2. Writes to dev/sandbox (SANDBOX_DATABASE_URL)
 * 3. Anonymizes user PII (names, phone numbers, emails)
 * 4. Generates new UUIDs for all records
 * 5. Updates all FK references to use the new IDs
 *
 * Usage:
 *   pnpm db:anonymize           # Run with confirmation
 *   pnpm db:anonymize --dry-run # Show table counts only
 */

// System data IDs that should keep their UUIDs (seeded by migrations)
const AI_OWNER_ID = '00000000-0000-0000-0000-000000000001';
const AI_PROGRAM_ID = '00000000-0000-0000-0000-000000000002';
const AI_VERSION_ID = '00000000-0000-0000-0000-000000000003';

// ID mapping tables for FK reference updates
const idMaps = {
  users: new Map<string, string>(),
  profiles: new Map<string, string>(),
  profileUpdates: new Map<string, string>(),
  subscriptions: new Map<string, string>(),
  messages: new Map<string, string>(),
  microcycles: new Map<string, string>(),
  workoutInstances: new Map<string, string>(),
  userOnboarding: new Map<string, string>(),
  shortLinks: new Map<string, string>(),
  adminActivityLogs: new Map<string, string>(),
  referrals: new Map<string, string>(),
  dayConfigs: new Map<string, string>(),
  messageQueues: new Map<string, string>(),
  pageVisits: new Map<string, string>(),
  uploadedImages: new Map<string, string>(),
  programOwners: new Map<string, string>(),
  programs: new Map<string, string>(),
  programVersions: new Map<string, string>(),
  programFamilies: new Map<string, string>(),
  fitnessPlans: new Map<string, string>(),
  programEnrollments: new Map<string, string>(),
};

// Tables in FK-safe processing order
const TABLE_ORDER = [
  // Tier 1: No FKs
  'users',
  'page_visits',
  'uploaded_images',
  // Tier 2: Depends on users (simple references)
  'profiles',
  'profile_updates',
  'subscriptions',
  'messages',
  'microcycles',
  'user_onboarding',
  'short_links',
  'referrals',
  'day_configs',
  // Tier 2.5: Depends on users and messages
  'workout_instances',
  'message_queues',
  'admin_activity_logs',
  // Tier 3: Program-related tables
  'program_owners',
  'programs',
  'program_versions',
  'program_families',
  'program_family_programs',
  'fitness_plans',
  'program_enrollments',
];

// Chunk size for processing large tables
const CHUNK_SIZE = 500;

// Check for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Validate environment variables
const prodDbUrl = process.env.DATABASE_URL;
const devDbUrl = process.env.SANDBOX_DATABASE_URL;

if (!prodDbUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

if (!devDbUrl) {
  console.error('❌ SANDBOX_DATABASE_URL environment variable is not set');
  process.exit(1);
}

if (prodDbUrl === devDbUrl) {
  console.error('❌ DATABASE_URL and SANDBOX_DATABASE_URL are the same! This would overwrite production data.');
  process.exit(1);
}

// Create database connections
const prodPool = new Pool({ connectionString: prodDbUrl, max: 10 });
const devPool = new Pool({ connectionString: devDbUrl, max: 10 });

const prodDb = new Kysely<any>({ dialect: new PostgresDialect({ pool: prodPool }) });
const devDb = new Kysely<any>({ dialect: new PostgresDialect({ pool: devPool }) });

/**
 * Convert camelCase to snake_case
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Get the ID map key (camelCase) for a snake_case table name
 */
function getMapKey(tableName: string): keyof typeof idMaps | null {
  const mapping: Record<string, keyof typeof idMaps> = {
    users: 'users',
    profiles: 'profiles',
    profile_updates: 'profileUpdates',
    subscriptions: 'subscriptions',
    messages: 'messages',
    microcycles: 'microcycles',
    workout_instances: 'workoutInstances',
    user_onboarding: 'userOnboarding',
    short_links: 'shortLinks',
    admin_activity_logs: 'adminActivityLogs',
    referrals: 'referrals',
    day_configs: 'dayConfigs',
    message_queues: 'messageQueues',
    page_visits: 'pageVisits',
    uploaded_images: 'uploadedImages',
    program_owners: 'programOwners',
    programs: 'programs',
    program_versions: 'programVersions',
    program_families: 'programFamilies',
    fitness_plans: 'fitnessPlans',
    program_enrollments: 'programEnrollments',
  };
  return mapping[tableName] || null;
}

/**
 * Get a new ID for a record, generating one if it doesn't exist
 */
function getNewId(mapKey: keyof typeof idMaps, oldId: string): string {
  // Preserve system IDs
  if (oldId === AI_OWNER_ID || oldId === AI_PROGRAM_ID || oldId === AI_VERSION_ID) {
    return oldId;
  }

  const map = idMaps[mapKey];
  if (!map.has(oldId)) {
    map.set(oldId, uuidv4());
  }
  return map.get(oldId)!;
}

/**
 * Lookup an ID in a map, returning null if the old ID is null
 */
function lookupId(mapKey: keyof typeof idMaps, oldId: string | null): string | null {
  if (oldId === null) return null;
  // Preserve system IDs
  if (oldId === AI_OWNER_ID || oldId === AI_PROGRAM_ID || oldId === AI_VERSION_ID) {
    return oldId;
  }
  return idMaps[mapKey].get(oldId) || null;
}

/**
 * Generate a fake US phone number in E.164 format
 */
function generateFakePhone(): string {
  // Generate a random US phone number: +1 + 10 digits
  // Area code starts with 2-9, next digit is 0-9, rest is random
  const areaCode = faker.number.int({ min: 200, max: 999 });
  const exchange = faker.number.int({ min: 200, max: 999 });
  const subscriber = faker.number.int({ min: 1000, max: 9999 });
  return `+1${areaCode}${exchange}${subscriber}`;
}

/**
 * Generate a unique referral code
 */
function generateReferralCode(): string {
  return faker.string.alphanumeric(8).toUpperCase();
}

/**
 * Anonymize a user record
 */
function anonymizeUser(user: Record<string, any>, newId: string): Record<string, any> {
  return {
    ...user,
    id: newId,
    name: faker.person.fullName(),
    phone_number: generateFakePhone(),
    email: user.email ? faker.internet.email() : null,
    stripe_customer_id: null, // Clear Stripe IDs
    referral_code: user.referral_code ? generateReferralCode() : null,
  };
}

/**
 * Process and transform a row based on its table
 */
function processRow(tableName: string, row: Record<string, any>): Record<string, any> | null {
  const result = { ...row };
  const mapKey = getMapKey(tableName);

  // Generate new ID for the record
  if (mapKey && result.id) {
    result.id = getNewId(mapKey, row.id);
  }

  // Table-specific transformations
  switch (tableName) {
    case 'users':
      return anonymizeUser(row, result.id);

    case 'profiles':
    case 'profile_updates':
    case 'subscriptions':
    case 'messages':
    case 'microcycles':
    case 'user_onboarding':
    case 'message_queues':
      // These have client_id FK to users
      if (result.client_id) {
        result.client_id = lookupId('users', row.client_id);
        if (!result.client_id) return null; // User doesn't exist, skip
      }
      break;

    case 'workout_instances':
      // FK to users and microcycles
      if (result.client_id) {
        result.client_id = lookupId('users', row.client_id);
        if (!result.client_id) return null;
      }
      if (result.microcycle_id) {
        result.microcycle_id = lookupId('microcycles', row.microcycle_id);
      }
      break;

    case 'short_links':
      // Optional FK to users
      if (result.client_id) {
        result.client_id = lookupId('users', row.client_id);
      }
      // Generate new unique code
      result.code = faker.string.alphanumeric(8).toLowerCase();
      break;

    case 'admin_activity_logs':
      // FK to users for both actor and target
      if (result.target_client_id) {
        result.target_client_id = lookupId('users', row.target_client_id);
        if (!result.target_client_id) return null;
      }
      if (result.actor_client_id) {
        result.actor_client_id = lookupId('users', row.actor_client_id);
      }
      break;

    case 'referrals':
      // FK to users for both referrer and referee
      if (result.referrer_id) {
        result.referrer_id = lookupId('users', row.referrer_id);
        if (!result.referrer_id) return null;
      }
      if (result.referee_id) {
        result.referee_id = lookupId('users', row.referee_id);
        if (!result.referee_id) return null;
      }
      break;

    case 'day_configs':
      // Optional scope_id that could reference users
      if (result.scope_id && result.scope_type === 'user') {
        result.scope_id = lookupId('users', row.scope_id);
      }
      break;

    case 'program_owners':
      // Optional FK to users
      if (result.user_id) {
        result.user_id = lookupId('users', row.user_id);
      }
      break;

    case 'programs':
      // FK to program_owners, optional FK to program_versions
      if (result.owner_id) {
        result.owner_id = lookupId('programOwners', row.owner_id);
        if (!result.owner_id) return null;
      }
      if (result.published_version_id) {
        result.published_version_id = lookupId('programVersions', row.published_version_id);
      }
      break;

    case 'program_versions':
      // FK to programs
      if (result.program_id) {
        result.program_id = lookupId('programs', row.program_id);
        if (!result.program_id) return null;
      }
      break;

    case 'program_families':
      // Optional FK to program_owners
      if (result.owner_id) {
        result.owner_id = lookupId('programOwners', row.owner_id);
      }
      // Generate new unique slug
      result.slug = faker.helpers.slugify(result.name).toLowerCase() + '-' + faker.string.alphanumeric(4).toLowerCase();
      break;

    case 'program_family_programs':
      // Composite table - no UUID id, uses family_id + program_id
      if (result.family_id) {
        result.family_id = lookupId('programFamilies', row.family_id);
        if (!result.family_id) return null;
      }
      if (result.program_id) {
        result.program_id = lookupId('programs', row.program_id);
        if (!result.program_id) return null;
      }
      break;

    case 'fitness_plans':
      // FKs to users, programs, program_versions
      if (result.client_id) {
        result.client_id = lookupId('users', row.client_id);
      }
      if (result.legacy_client_id) {
        result.legacy_client_id = lookupId('users', row.legacy_client_id);
        if (!result.legacy_client_id) return null;
      }
      if (result.program_id) {
        result.program_id = lookupId('programs', row.program_id);
      }
      if (result.program_version_id) {
        result.program_version_id = lookupId('programVersions', row.program_version_id);
      }
      break;

    case 'program_enrollments':
      // FKs to users, programs, program_versions
      if (result.client_id) {
        result.client_id = lookupId('users', row.client_id);
        if (!result.client_id) return null;
      }
      if (result.program_id) {
        result.program_id = lookupId('programs', row.program_id);
        if (!result.program_id) return null;
      }
      if (result.program_version_id) {
        result.program_version_id = lookupId('programVersions', row.program_version_id);
      }
      // Anonymize cohort_id if present (it's a free-form identifier)
      if (result.cohort_id) {
        result.cohort_id = faker.string.alphanumeric(8).toUpperCase();
      }
      break;

    case 'page_visits':
      // Anonymize IP addresses
      if (result.ip_address) {
        result.ip_address = faker.internet.ipv4();
      }
      break;

    case 'uploaded_images':
      // Optional uploaded_by field
      if (result.uploaded_by) {
        result.uploaded_by = lookupId('users', row.uploaded_by);
      }
      break;
  }

  // Handle message_queues special case for message_id FK
  if (tableName === 'message_queues' && result.message_id) {
    result.message_id = lookupId('messages', row.message_id);
  }

  return result;
}

/**
 * Get the count of rows in a table (production)
 */
async function getTableCount(tableName: string): Promise<number> {
  const result = await prodDb
    .selectFrom(tableName)
    .select(sql<number>`count(*)`.as('count'))
    .executeTakeFirst();
  return Number(result?.count || 0);
}

/**
 * Clear a table in the dev database
 */
async function clearDevTable(tableName: string): Promise<void> {
  await devDb.deleteFrom(tableName).execute();
}

/**
 * Process a single table
 */
async function processTable(tableName: string): Promise<{ processed: number; skipped: number }> {
  const count = await getTableCount(tableName);
  console.log(`  📋 ${tableName}: ${count} rows`);

  if (isDryRun || count === 0) {
    return { processed: 0, skipped: 0 };
  }

  let processed = 0;
  let skipped = 0;
  let offset = 0;

  // Clear the target table first
  await clearDevTable(tableName);

  // Process in chunks
  while (offset < count) {
    const rows = await prodDb
      .selectFrom(tableName)
      .selectAll()
      .limit(CHUNK_SIZE)
      .offset(offset)
      .execute();

    const transformedRows: Record<string, any>[] = [];

    for (const row of rows) {
      const transformed = processRow(tableName, row);
      if (transformed) {
        transformedRows.push(transformed);
        processed++;
      } else {
        skipped++;
      }
    }

    // Insert transformed rows into dev database
    if (transformedRows.length > 0) {
      // Convert camelCase keys to snake_case for insertion
      const snakeCaseRows = transformedRows.map((row) => {
        const snakeRow: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
          snakeRow[toSnakeCase(key)] = value;
        }
        return snakeRow;
      });

      await devDb.insertInto(tableName).values(snakeCaseRows).execute();
    }

    offset += CHUNK_SIZE;
    if (offset < count && offset % 1000 === 0) {
      process.stdout.write(`    Progress: ${Math.min(offset, count)}/${count}...\r`);
    }
  }

  if (count > CHUNK_SIZE) {
    console.log(`    ✓ Processed ${processed}, skipped ${skipped}`);
  }

  return { processed, skipped };
}

/**
 * Run a two-pass process for tables with circular references
 */
async function handleCircularReferences(): Promise<void> {
  // programs.published_version_id references program_versions
  // But we process programs before program_versions
  // So we need to update programs after program_versions are processed

  console.log('\n  🔄 Updating circular references (programs.published_version_id)...');

  // Get all programs that have published_version_id
  const programs = await prodDb
    .selectFrom('programs')
    .select(['id', 'published_version_id'])
    .where('published_version_id', 'is not', null)
    .execute();

  let updated = 0;
  for (const program of programs) {
    const newProgramId = lookupId('programs', program.id);
    const newVersionId = lookupId('programVersions', program.published_version_id);

    if (newProgramId && newVersionId) {
      await devDb
        .updateTable('programs')
        .set({ published_version_id: newVersionId })
        .where('id', '=', newProgramId)
        .execute();
      updated++;
    }
  }

  console.log(`    ✓ Updated ${updated} programs with published_version_id`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Production → Dev Data Anonymization Script             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No data will be modified\n');
  }

  // Show database info (masked)
  const prodHost = new URL(prodDbUrl!).hostname;
  const devHost = new URL(devDbUrl!).hostname;
  console.log(`📤 Source (prod): ${prodHost}`);
  console.log(`📥 Target (dev):  ${devHost}\n`);

  if (!isDryRun) {
    // Confirmation prompt
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question(
        '⚠️  This will OVERWRITE all data in the dev database. Continue? (yes/no): ',
        resolve
      );
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Aborted.');
      process.exit(0);
    }
    console.log('');
  }

  console.log('📊 Processing tables...\n');

  const startTime = Date.now();
  let totalProcessed = 0;
  let totalSkipped = 0;

  // Disable FK constraints in dev database during migration
  if (!isDryRun) {
    await devDb.executeQuery(sql`SET session_replication_role = replica`.compile(devDb));
  }

  try {
    // Process tables in FK-safe order
    for (const tableName of TABLE_ORDER) {
      const { processed, skipped } = await processTable(tableName);
      totalProcessed += processed;
      totalSkipped += skipped;
    }

    // Handle circular references after all tables are processed
    if (!isDryRun) {
      await handleCircularReferences();
    }
  } finally {
    // Re-enable FK constraints
    if (!isDryRun) {
      await devDb.executeQuery(sql`SET session_replication_role = DEFAULT`.compile(devDb));
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  if (isDryRun) {
    console.log('║     DRY RUN COMPLETE                                       ║');
  } else {
    console.log('║     ANONYMIZATION COMPLETE                                 ║');
  }
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📈 Summary:`);
  console.log(`   • Records processed: ${totalProcessed.toLocaleString()}`);
  console.log(`   • Records skipped:   ${totalSkipped.toLocaleString()}`);
  console.log(`   • Time elapsed:      ${elapsed}s`);

  if (!isDryRun) {
    console.log(`\n✅ Dev database has been populated with anonymized production data.`);
    console.log(`\n🔍 Verification queries to run on dev database:`);
    console.log(`   SELECT name, phone_number, email FROM users LIMIT 5;`);
    console.log(`   SELECT id FROM users LIMIT 5;  -- IDs should differ from prod`);
  }

  // Clean up
  await prodDb.destroy();
  await devDb.destroy();
}

// Run the script
main().catch((err) => {
  console.error('\n❌ Anonymization failed:', err);
  process.exit(1);
});
