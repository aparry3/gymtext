import { Kysely, sql } from 'kysely';

/**
 * Migration: Transform activityType values in microcycles.structured JSONB
 *
 * Maps old granular activity types to new high-level types:
 * - Lifting, Cardio, Hybrid, Sport -> TRAINING
 * - Mobility -> ACTIVE_RECOVERY
 * - Rest -> REST
 *
 * Also removes the deprecated isRest boolean field from day objects.
 */

// Mapping from old activity types to new
const ACTIVITY_TYPE_MAP: Record<string, string> = {
  'Lifting': 'TRAINING',
  'Cardio': 'TRAINING',
  'Hybrid': 'TRAINING',
  'Sport': 'TRAINING',
  'Mobility': 'ACTIVE_RECOVERY',
  'Rest': 'REST',
};

interface MicrocycleRow {
  id: string;
  structured: {
    days?: Array<{
      activityType?: string;
      isRest?: boolean;
    }>;
  } | null;
}

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Migrating activity types in microcycles.structured...');

  // Fetch all microcycles with structured data
  const result = await sql<MicrocycleRow>`
    SELECT id, structured FROM microcycles WHERE structured IS NOT NULL
  `.execute(db);

  let updatedCount = 0;

  for (const row of result.rows) {
    if (!row.structured || typeof row.structured !== 'object') continue;

    const structured = row.structured as MicrocycleRow['structured'];
    if (!structured?.days || !Array.isArray(structured.days)) continue;

    let modified = false;

    for (const day of structured.days) {
      // Map old activityType to new
      if (day.activityType && ACTIVITY_TYPE_MAP[day.activityType]) {
        day.activityType = ACTIVITY_TYPE_MAP[day.activityType];
        modified = true;
      }
      // Remove isRest field
      if ('isRest' in day) {
        delete day.isRest;
        modified = true;
      }
    }

    if (modified) {
      await sql`
        UPDATE microcycles
        SET structured = ${JSON.stringify(structured)}::jsonb
        WHERE id = ${row.id}
      `.execute(db);
      updatedCount++;
    }
  }

  console.log(`Activity type migration completed. Updated ${updatedCount} microcycles.`);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Note: This migration cannot be fully reversed because we lose the original
  // granular activity types. The best we can do is map back to reasonable defaults.
  console.log('Reverting activity type migration...');

  const REVERSE_MAP: Record<string, string> = {
    'TRAINING': 'Lifting',
    'ACTIVE_RECOVERY': 'Mobility',
    'REST': 'Rest',
  };

  const result = await sql<MicrocycleRow>`
    SELECT id, structured FROM microcycles WHERE structured IS NOT NULL
  `.execute(db);

  let updatedCount = 0;

  for (const row of result.rows) {
    if (!row.structured || typeof row.structured !== 'object') continue;

    const structured = row.structured as MicrocycleRow['structured'];
    if (!structured?.days || !Array.isArray(structured.days)) continue;

    let modified = false;

    for (const day of structured.days) {
      // Map new activityType back to old (best effort)
      if (day.activityType && REVERSE_MAP[day.activityType]) {
        const newType = day.activityType;
        day.activityType = REVERSE_MAP[day.activityType];
        // Restore isRest based on type
        (day as { isRest?: boolean }).isRest = newType === 'REST';
        modified = true;
      }
    }

    if (modified) {
      await sql`
        UPDATE microcycles
        SET structured = ${JSON.stringify(structured)}::jsonb
        WHERE id = ${row.id}
      `.execute(db);
      updatedCount++;
    }
  }

  console.log(`Activity type rollback completed. Updated ${updatedCount} microcycles.`);
}
