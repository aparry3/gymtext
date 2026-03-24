/**
 * Seed Sport-Specific Program Owners & Programs
 *
 * Creates:
 * 1. Program owner: Rhynia Henry (basketball coach) → slug: nextlevelbasketball
 * 2. Program owner: Mikey Swiercz (soccer coach) → slug: mikeyswiercz
 * 3. Basketball Fundamentals program (4-week, from template)
 * 4. Soccer Fundamentals program (4-week, from template)
 *
 * Each program gets a published version with the markdown content.
 *
 * Idempotent: uses ON CONFLICT / upsert patterns. Safe to re-run.
 */

import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Constants ───────────────────────────────────────────────────────────────

const BASKETBALL_SPORT_SLUG = 'basketball';
const SOCCER_SPORT_SLUG = 'soccer';

const RHYNIA_OWNER = {
  displayName: 'Rhynia Henry',
  slug: 'nextlevelbasketball',
  ownerType: 'coach',
  bio: 'AFAA-certified trainer and founder of Next Level Basketball. Specializes in fundamentals-first basketball skills development, conditioning, and the signature FIRE Workout.',
  avatarUrl: '/coaches/next-level/rhynia-henry.jpg',
};

const MIKEY_OWNER = {
  displayName: 'Mikey Swiercz',
  slug: 'mikeyswiercz',
  ownerType: 'coach',
  bio: 'Former All-American and National Champion. Johns Hopkins All-Decade team member and U.S. Open Cup champion. Specializes in technical soccer development and match preparation.',
  avatarUrl: '/coaches/mikey-swiercz/Hopkins-Cp.JPG',
};

// ─── Upsert Helpers ──────────────────────────────────────────────────────────

async function upsertProgramOwner(db: Kysely<any>, owner: typeof RHYNIA_OWNER | typeof MIKEY_OWNER): Promise<string> {
  // Check if owner exists by slug
  const existing = await sql<{ id: string }>`
    SELECT id FROM program_owners WHERE slug = ${owner.slug}
  `.execute(db).then(r => r.rows[0]);

  if (existing) {
    // Update
    await sql`
      UPDATE program_owners SET
        display_name = ${owner.displayName},
        owner_type = ${owner.ownerType},
        bio = ${owner.bio},
        avatar_url = ${owner.avatarUrl},
        is_active = true,
        updated_at = now()
      WHERE id = ${existing.id}
    `.execute(db);
    return existing.id;
  }

  // Insert
  const result = await sql<{ id: string }>`
    INSERT INTO program_owners (display_name, slug, owner_type, bio, avatar_url, is_active)
    VALUES (${owner.displayName}, ${owner.slug}, ${owner.ownerType}, ${owner.bio}, ${owner.avatarUrl}, true)
    RETURNING id
  `.execute(db).then(r => r.rows[0]);

  return result!.id;
}

async function upsertProgram(db: Kysely<any>, params: {
  ownerId: string;
  name: string;
  description: string;
  sportId: string;
  schedulingMode: string;
  cadence: string;
  billingModel: string;
  isPublic: boolean;
  isActive: boolean;
}): Promise<string> {
  const { ownerId, name, description, sportId, schedulingMode, cadence, billingModel, isPublic, isActive } = params;

  // Check if program exists by owner + sport (one program per owner per sport)
  const existing = await sql<{ id: string }>`
    SELECT id FROM programs WHERE owner_id = ${ownerId} AND sport_id = ${sportId}
  `.execute(db).then(r => r.rows[0]);

  if (existing) {
    await sql`
      UPDATE programs SET
        name = ${name},
        description = ${description},
        scheduling_mode = ${schedulingMode},
        cadence = ${cadence},
        billing_model = ${billingModel},
        is_public = ${isPublic},
        is_active = ${isActive},
        updated_at = now()
      WHERE id = ${existing.id}
    `.execute(db);
    return existing.id;
  }

  const result = await sql<{ id: string }>`
    INSERT INTO programs (owner_id, name, description, sport_id, scheduling_mode, cadence, billing_model, is_public, is_active)
    VALUES (${ownerId}, ${name}, ${description}, ${sportId}, ${schedulingMode}, ${cadence}, ${billingModel}, ${isPublic}, ${isActive})
    RETURNING id
  `.execute(db).then(r => r.rows[0]);

  return result!.id;
}

async function upsertProgramVersion(db: Kysely<any>, params: {
  programId: string;
  versionNumber: number;
  content: string;
  defaultDurationWeeks: number;
  status: string;
}): Promise<string> {
  const { programId, versionNumber, content, defaultDurationWeeks, status } = params;

  // Check for existing version
  const existing = await sql<{ id: string }>`
    SELECT id FROM program_versions WHERE program_id = ${programId} AND version_number = ${versionNumber}
  `.execute(db).then(r => r.rows[0]);

  if (existing) {
    await sql`
      UPDATE program_versions SET
        content = ${content},
        default_duration_weeks = ${defaultDurationWeeks},
        status = ${status},
        published_at = CASE WHEN ${status} = 'published' THEN now() ELSE published_at END
      WHERE id = ${existing.id}
    `.execute(db);
    return existing.id;
  }

  const publishedAt = status === 'published' ? sql`now()` : sql`NULL`;
  const result = await sql<{ id: string }>`
    INSERT INTO program_versions (program_id, version_number, content, default_duration_weeks, status, published_at)
    VALUES (${programId}, ${versionNumber}, ${content}, ${defaultDurationWeeks}, ${status}, ${publishedAt})
    RETURNING id
  `.execute(db).then(r => r.rows[0]);

  return result!.id;
}

// ─── Drill Reference Verification ────────────────────────────────────────────

async function verifyDrillRefs(db: Kysely<any>, template: string, sportSlug: string, sportId: string) {
  // Extract all drill slugs from template
  const slugPattern = new RegExp(`\`(${sportSlug}-[a-z0-9-]+)\``, 'g');
  const allSlugs = new Set<string>();
  let match;
  while ((match = slugPattern.exec(template)) !== null) {
    // Skip empty slugs like `basketball-` or `soccer-`
    if (match[1] === `${sportSlug}-` || match[1].endsWith('-')) continue;
    allSlugs.add(match[1]);
  }

  // Check which exist in DB
  const existing = await sql<{ slug: string }>`
    SELECT slug FROM exercises WHERE sport_id = ${sportId}
  `.execute(db).then(r => new Set(r.rows.map(row => row.slug)));

  const missing: string[] = [];
  for (const slug of allSlugs) {
    if (!existing.has(slug)) {
      missing.push(slug);
    }
  }

  console.log(`   ${sportSlug}: ${allSlugs.size} drill refs, ${allSlugs.size - missing.length} found, ${missing.length} missing`);

  if (missing.length > 0) {
    console.log(`   ⚠️  Missing drills (may be rest-day placeholders or template-only entries):`);
    for (const slug of missing.slice(0, 10)) {
      console.log(`      - ${slug}`);
    }
    if (missing.length > 10) {
      console.log(`      ... and ${missing.length - 10} more`);
    }
  }
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function seedSportPrograms(): Promise<void> {
  console.log('Seeding sport-specific programs...');

  const databaseUrl = process.env.DATABASE_URL || process.env.SANDBOX_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not set');
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 5 });
  const db = new Kysely<any>({
    dialect: new PostgresDialect({ pool }),
  });

  try {
    // 1. Get sport records
    const basketball = await db
      .selectFrom('sports')
      .selectAll()
      .where('slug', '=', BASKETBALL_SPORT_SLUG)
      .executeTakeFirst();

    const soccer = await db
      .selectFrom('sports')
      .selectAll()
      .where('slug', '=', SOCCER_SPORT_SLUG)
      .executeTakeFirst();

    if (!basketball || !soccer) {
      console.log('  ⚠️  Sports not found. Run migrations first.');
      return;
    }

    console.log(`  🏀 Basketball: ${basketball.id}`);
    console.log(`  ⚽ Soccer: ${soccer.id}`);

    // 2. Read templates
    const fixturesDir = resolve(__dirname, '../../fixtures');
    const basketballTemplate = readFileSync(
      resolve(fixturesDir, 'basketball-program-template.md'),
      'utf-8'
    );
    const soccerTemplate = readFileSync(
      resolve(fixturesDir, 'soccer-program-template.md'),
      'utf-8'
    );

    console.log(`  📋 Basketball template: ${basketballTemplate.length} chars`);
    console.log(`  📋 Soccer template: ${soccerTemplate.length} chars`);

    // 3. Upsert program owners
    console.log('  👤 Creating program owners...');

    const rhyniaId = await upsertProgramOwner(db, RHYNIA_OWNER);
    console.log(`     ✓ Rhynia Henry (${RHYNIA_OWNER.slug})`);

    const mikeyId = await upsertProgramOwner(db, MIKEY_OWNER);
    console.log(`     ✓ Mikey Swiercz (${MIKEY_OWNER.slug})`);

    // 4. Create basketball program
    console.log('  🏀 Creating Basketball Fundamentals program...');

    const basketballProgramId = await upsertProgram(db, {
      ownerId: rhyniaId,
      name: 'Basketball Fundamentals',
      description: 'A 4-week progressive basketball skills development program. Master ball handling, shooting, finishing, defense, and conditioning through structured daily sessions. Foundation → Development → Application → Testing.',
      sportId: basketball.id,
      schedulingMode: 'rolling_start',
      cadence: 'calendar_days',
      billingModel: 'free',
      isPublic: true,
      isActive: true,
    });
    console.log(`     ✓ Program created`);

    // Create published version
    const basketballVersionId = await upsertProgramVersion(db, {
      programId: basketballProgramId,
      versionNumber: 1,
      content: basketballTemplate,
      defaultDurationWeeks: 4,
      status: 'published',
    });

    // Link published version to program
    await sql`
      UPDATE programs SET published_version_id = ${basketballVersionId} WHERE id = ${basketballProgramId}
    `.execute(db);
    console.log(`     ✓ Version published`);

    // 5. Create soccer program
    console.log('  ⚽ Creating Soccer Fundamentals program...');

    const soccerProgramId = await upsertProgram(db, {
      ownerId: mikeyId,
      name: 'Soccer Fundamentals',
      description: 'A 4-week progressive soccer skills development program. Master ball mastery, passing, dribbling, shooting, defending, and match fitness through structured daily sessions. Foundation → Development → Application → Testing.',
      sportId: soccer.id,
      schedulingMode: 'rolling_start',
      cadence: 'calendar_days',
      billingModel: 'free',
      isPublic: true,
      isActive: true,
    });
    console.log(`     ✓ Program created`);

    // Create published version
    const soccerVersionId = await upsertProgramVersion(db, {
      programId: soccerProgramId,
      versionNumber: 1,
      content: soccerTemplate,
      defaultDurationWeeks: 4,
      status: 'published',
    });

    // Link published version to program
    await sql`
      UPDATE programs SET published_version_id = ${soccerVersionId} WHERE id = ${soccerProgramId}
    `.execute(db);
    console.log(`     ✓ Version published`);

    // 6. Verify drill references
    console.log('  🔍 Verifying drill references...');
    await verifyDrillRefs(db, basketballTemplate, 'basketball', basketball.id);
    await verifyDrillRefs(db, soccerTemplate, 'soccer', soccer.id);
  } finally {
    await db.destroy();
  }
}

// Allow standalone execution
if (require.main === module) {
  seedSportPrograms()
    .then(() => {
      console.log('✅ Sport programs seed complete!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    });
}
