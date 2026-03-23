/**
 * Import Sport-Specific Drills from Excel
 *
 * Imports drills, tags, and program templates from Kyle's Excel format.
 * Both basketball and soccer use identical structure.
 *
 * Usage:
 *   pnpm import:drills --sport basketball --file ~/Downloads/GymText_Basketball_Drill_Database.xlsx
 *   pnpm import:drills --sport soccer --file ~/Downloads/GymText_Soccer_Drill_Database.xlsx
 *   pnpm import:drills --sport basketball --file drills.xlsx --dry-run
 */

import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import XLSX from 'xlsx';
import { parseArgs } from 'node:util';

// ─── CLI Args ────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    sport: { type: 'string' },
    file: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
});

if (!args.sport || !args.file) {
  console.error('Usage: pnpm import:drills --sport <slug> --file <path> [--dry-run]');
  process.exit(1);
}

const sportSlug = args.sport;
const filePath = args.file;
const dryRun = args['dry-run'] ?? false;

// ─── DB Connection ───────────────────────────────────────────────────────────

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL not set. Run: source .env.local');
}

const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<any>({
  dialect: new PostgresDialect({ pool }),
});

// ─── Column Mapping (identical for both sports) ─────────────────────────────

const COL = {
  id: 0,            // A: Source ID
  name: 1,          // B: Drill Name
  category: 2,      // C: Category
  positionFocus: 3,  // D: Position Focus
  skillLevel: 4,    // E: Skill Level
  description: 5,   // F: Drill Description
  setup: 6,         // G: Setup
  prescription: 7,  // H: Time or Reps
  trackingMetric: 8, // I: Tracking Metric
  progression: 9,   // J: Progression
  coachingTip: 10,  // K: Coaching Tip
  smsPrompt: 11,    // L: GymText Prompt
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseSheet(workbook: XLSX.WorkBook, sheetName: string): any[][] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  return data.slice(1).filter(row => row.length > 0 && row[0] !== undefined && row[0] !== '');
}

function cellStr(row: any[], idx: number): string {
  const val = row[idx];
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

function parseSetupToEquipment(setup: string): string[] {
  if (!setup) return [];
  // Split on commas, normalize each
  return setup
    .split(/,/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .map(s => slugify(s))
    .filter(Boolean);
}

function parsePositions(positionFocus: string): string[] {
  if (!positionFocus || positionFocus.toLowerCase() === 'all') return [];
  return positionFocus
    .split(/[,&\/]/)
    .map(s => s.trim())
    .filter(Boolean);
}

// ─── Main Import ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🏋️ Import Drills: ${sportSlug}`);
  console.log(`📁 File: ${filePath}`);
  if (dryRun) console.log('🔍 DRY RUN — no data will be written\n');
  else console.log();

  // 1. Read Excel
  const workbook = XLSX.readFile(filePath);
  const expectedSheets = ['Skill Drills', 'Conditioning Drills', 'GymText Tags', '4-Week Program', 'Top 10 Must-Use Drills'];
  for (const name of expectedSheets) {
    if (!workbook.SheetNames.includes(name)) {
      console.error(`❌ Missing sheet: "${name}". Found: ${workbook.SheetNames.join(', ')}`);
      process.exit(1);
    }
  }

  // 2. Parse sheets
  const skillDrills = parseSheet(workbook, 'Skill Drills');
  const conditioningDrills = parseSheet(workbook, 'Conditioning Drills');
  const tagRows = parseSheet(workbook, 'GymText Tags');
  const programRows = parseSheet(workbook, '4-Week Program');
  const top10Rows = parseSheet(workbook, 'Top 10 Must-Use Drills');

  console.log(`📊 Parsed: ${skillDrills.length} skill drills, ${conditioningDrills.length} conditioning drills`);
  console.log(`   ${tagRows.length} tags, ${programRows.length} program entries, ${top10Rows.length} top picks`);

  // 3. Get sport record
  const sport = await db
    .selectFrom('sports')
    .selectAll()
    .where('slug', '=', sportSlug)
    .executeTakeFirst();

  if (!sport) {
    console.error(`❌ Sport "${sportSlug}" not found in sports table. Run migrations first.`);
    process.exit(1);
  }
  console.log(`🏅 Sport: ${sport.name} (${sport.id})`);

  if (dryRun) {
    console.log('\n✅ Dry run validation passed. Use without --dry-run to import.');
    await cleanup();
    return;
  }

  // 4. Import tags
  console.log('\n📌 Importing tags...');
  const tagMap = new Map<string, string>(); // slug → tag ID

  // Skill/category tags from GymText Tags sheet
  for (const row of tagRows) {
    const rawTag = cellStr(row, 0); // e.g., "#ballhandling"
    const description = cellStr(row, 1);
    const slug = slugify(rawTag.replace(/^#/, ''));
    if (!slug) continue;

    const tag = await upsertTag({
      sportId: sport.id,
      slug,
      name: rawTag,
      description,
      category: 'skill',
    });
    tagMap.set(slug, tag.id);
  }

  // Level tags (universal — no sport_id)
  for (const level of ['beginner', 'intermediate', 'advanced']) {
    const tag = await upsertTag({
      sportId: null,
      slug: level,
      name: level.charAt(0).toUpperCase() + level.slice(1),
      description: `${level.charAt(0).toUpperCase() + level.slice(1)} difficulty level`,
      category: 'level',
    });
    tagMap.set(`level:${level}`, tag.id);
  }

  // Featured curation tag (universal)
  const featuredTag = await upsertTag({
    sportId: null,
    slug: 'featured',
    name: 'Featured',
    description: 'Top-tier curated exercises',
    category: 'curation',
  });
  tagMap.set('featured', featuredTag.id);

  console.log(`   ✅ ${tagMap.size} tags upserted`);

  // 5. Import drills
  console.log('\n🏀 Importing drills...');

  // Build set of top 10 drill names for featured tagging
  const top10Names = new Set(
    top10Rows.map(row => cellStr(row, 1).toLowerCase())
  );

  const allDrills = [
    ...skillDrills.map(row => ({ row, drillType: 'skill' as const })),
    ...conditioningDrills.map(row => ({ row, drillType: 'conditioning' as const })),
  ];

  let imported = 0;
  let skipped = 0;
  const equipmentTagCache = new Map<string, string>();
  const positionTagCache = new Map<string, string>();
  const conditioningTagCache = new Map<string, string>();

  for (const { row, drillType } of allDrills) {
    const name = cellStr(row, COL.name);
    if (!name) { skipped++; continue; }

    const slug = `${sportSlug}-${slugify(name)}`;
    const description = cellStr(row, COL.description);
    const coachingTip = cellStr(row, COL.coachingTip);
    const category = cellStr(row, COL.category);
    const positionFocus = cellStr(row, COL.positionFocus);
    const skillLevel = cellStr(row, COL.skillLevel).toLowerCase();
    const setup = cellStr(row, COL.setup);

    // Build full description with coaching tip
    const fullDescription = coachingTip
      ? `${description}\n\n**Coaching tip:** ${coachingTip}`
      : description;

    // Short description — first sentence or first 120 chars
    const firstSentence = description.split(/[.!?]/)[0];
    const shortDescription = firstSentence.length <= 120
      ? firstSentence + '.'
      : description.substring(0, 117) + '...';

    // Upsert exercise — use raw SQL for snake_case columns
    // Name might conflict across sports (e.g., "5-10-5 Pro Agility" in both basketball and soccer)
    // Use ON CONFLICT on slug (which is sport-prefixed and unique)
    const existingEx = await sql<{ id: string }>`
      SELECT id FROM exercises WHERE slug = ${slug}
    `.execute(db).then(r => r.rows[0]);

    // Check if name conflicts with another exercise (different slug)
    const nameConflict = await sql<{ id: string; slug: string }>`
      SELECT id, slug FROM exercises WHERE name = ${name} AND slug != ${slug}
    `.execute(db).then(r => r.rows[0]);

    // If name conflicts, prefix with sport name to disambiguate
    const displayName = nameConflict ? `${name} (${sport.name})` : name;

    let exerciseId: string;
    if (existingEx) {
      await sql`
        UPDATE exercises SET
          name = ${displayName},
          instructions = ${fullDescription},
          short_description = ${shortDescription},
          sport_id = ${sport.id},
          type = 'drill',
          updated_at = now()
        WHERE id = ${existingEx.id}
      `.execute(db);
      exerciseId = existingEx.id;
    } else {
      const result = await sql<{ id: string }>`
        INSERT INTO exercises (name, slug, instructions, short_description, sport_id, type, status, is_active)
        VALUES (${displayName}, ${slug}, ${fullDescription}, ${shortDescription}, ${sport.id}, 'drill', 'active', true)
        RETURNING id
      `.execute(db).then(r => r.rows[0]);
      exerciseId = result!.id;
    }

    // Collect tag IDs for this drill
    const drillTagIds: string[] = [];

    // Category tag (skill tag from GymText Tags sheet)
    const categorySlug = slugify(category);
    if (categorySlug && tagMap.has(categorySlug)) {
      drillTagIds.push(tagMap.get(categorySlug)!);
    } else if (categorySlug) {
      // Category not in GymText Tags sheet — might be a conditioning category
      if (!conditioningTagCache.has(categorySlug)) {
        const tag = await upsertTag({
          sportId: sport.id,
          slug: categorySlug,
          name: category,
          description: `${category} drills`,
          category: drillType === 'conditioning' ? 'conditioning' : 'skill',
        });
        conditioningTagCache.set(categorySlug, tag.id);
      }
      drillTagIds.push(conditioningTagCache.get(categorySlug)!);
    }

    // Level tag
    if (skillLevel && tagMap.has(`level:${skillLevel}`)) {
      drillTagIds.push(tagMap.get(`level:${skillLevel}`)!);
    }

    // Position tags
    const positions = parsePositions(positionFocus);
    for (const pos of positions) {
      const posSlug = slugify(pos);
      if (!posSlug) continue;
      if (!positionTagCache.has(posSlug)) {
        const tag = await upsertTag({
          sportId: sport.id,
          slug: posSlug,
          name: pos,
          description: `${pos} position`,
          category: 'position',
        });
        positionTagCache.set(posSlug, tag.id);
      }
      drillTagIds.push(positionTagCache.get(posSlug)!);
    }

    // Equipment tags from setup field
    const equipmentSlugs = parseSetupToEquipment(setup);
    for (const eqSlug of equipmentSlugs) {
      if (!eqSlug) continue;
      if (!equipmentTagCache.has(eqSlug)) {
        const tag = await upsertTag({
          sportId: null, // equipment tags are universal
          slug: eqSlug,
          name: eqSlug.replace(/-/g, ' '),
          description: null,
          category: 'equipment',
        });
        equipmentTagCache.set(eqSlug, tag.id);
      }
      drillTagIds.push(equipmentTagCache.get(eqSlug)!);
    }

    // Featured tag
    if (top10Names.has(name.toLowerCase())) {
      drillTagIds.push(tagMap.get('featured')!);
    }

    // Link tags to exercise (upsert)
    if (drillTagIds.length > 0) {
      // Delete existing tags for this exercise first (idempotent re-import)
      await sql`DELETE FROM exercise_tags WHERE exercise_id = ${exerciseId}`.execute(db);

      // Insert tag links
      const tagValues = drillTagIds.map(tagId => sql`(${exerciseId}, ${tagId})`);
      await sql`
        INSERT INTO exercise_tags (exercise_id, tag_id) VALUES ${sql.join(tagValues, sql`, `)}
        ON CONFLICT DO NOTHING
      `.execute(db);
    }

    imported++;
  }

  console.log(`   ✅ ${imported} drills imported, ${skipped} skipped`);

  // 6. Generate program template markdown
  console.log('\n📋 Generating program template markdown...');
  const templateMarkdown = generateTemplateMarkdown(
    workbook,
    programRows,
    sportSlug,
    sport.name,
  );

  console.log(`   Template: ${templateMarkdown.length} characters`);

  // For now, just log the first 500 chars to verify
  console.log(`   Preview:\n${templateMarkdown.substring(0, 500)}...`);

  // Save template to a file for review
  const { writeFileSync } = await import('fs');
  const templatePath = `scripts/fixtures/${sportSlug}-program-template.md`;
  writeFileSync(templatePath, templateMarkdown);
  console.log(`   📝 Saved template to ${templatePath}`);

  // 7. Summary
  console.log('\n─── Import Summary ───');
  const totalExercises = await sql`SELECT count(*) as count FROM exercises WHERE sport_id = ${sport.id}`.execute(db).then(r => r.rows[0] as any);
  const totalTags = await sql`SELECT count(*) as count FROM tags WHERE sport_id = ${sport.id}`.execute(db).then(r => r.rows[0] as any);
  const totalGlobalTags = await sql`SELECT count(*) as count FROM tags WHERE sport_id IS NULL`.execute(db).then(r => r.rows[0] as any);
  const totalLinks = await sql`SELECT count(*) as count FROM exercise_tags`.execute(db).then(r => r.rows[0] as any);

  console.log(`   Sport exercises: ${totalExercises?.count}`);
  console.log(`   Sport-scoped tags: ${totalTags?.count}`);
  console.log(`   Universal tags: ${totalGlobalTags?.count}`);
  console.log(`   Tag links: ${totalLinks?.count}`);
  console.log('\n✅ Import complete!\n');

  await cleanup();
}

// ─── Tag Upsert ──────────────────────────────────────────────────────────────

async function upsertTag(params: {
  sportId: string | null;
  slug: string;
  name: string;
  description: string | null;
  category: string;
}): Promise<{ id: string }> {
  const { sportId, slug, name, description, category } = params;

  // Try to find existing — use raw SQL since DB columns are snake_case
  let existing: { id: string } | undefined;
  if (sportId) {
    existing = await sql<{ id: string }>`
      SELECT id FROM tags WHERE slug = ${slug} AND sport_id = ${sportId}
    `.execute(db).then(r => r.rows[0]);
  } else {
    existing = await sql<{ id: string }>`
      SELECT id FROM tags WHERE slug = ${slug} AND sport_id IS NULL
    `.execute(db).then(r => r.rows[0]);
  }

  if (existing) return existing;

  // Insert
  const result = await sql<{ id: string }>`
    INSERT INTO tags (slug, name, description, category, sport_id)
    VALUES (${slug}, ${name}, ${description}, ${category}, ${sportId})
    RETURNING id
  `.execute(db).then(r => r.rows[0]);

  return result!;
}

// ─── Template Markdown Generation ────────────────────────────────────────────

function generateTemplateMarkdown(
  workbook: XLSX.WorkBook,
  programRows: any[][],
  sportSlug: string,
  sportName: string,
): string {
  const sheet = workbook.Sheets['4-Week Program'];
  const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];

  // Detect block names from headers (e.g., "Warm-Up (10min)", "Skill Block (25min)")
  // Headers are: Week | Day | Session Focus | Warm-Up (10min) | Skill Block (25min) | ...
  const blockHeaders = headers.slice(3, 8); // columns D through H

  // Group rows by week
  const weeks = new Map<number, any[][]>();
  for (const row of programRows) {
    const week = Number(row[0]);
    if (!weeks.has(week)) weeks.set(week, []);
    weeks.get(week)!.push(row);
  }

  // Week themes based on typical progression
  const weekThemes: Record<number, { theme: string; focus: string }> = {
    1: { theme: 'Foundation', focus: 'Rhythm, comfort, basic mechanics' },
    2: { theme: 'Development', focus: 'Speed, complexity, defensive pressure' },
    3: { theme: 'Application', focus: 'Game-speed, decision-making, competition' },
    4: { theme: 'Testing & Benchmarks', focus: 'Measure improvement, compete under pressure' },
  };

  const lines: string[] = [];

  // Header
  lines.push(`# ${sportName} Fundamentals (4-Week Progressive Program)`);
  lines.push('');
  lines.push('## Program Overview');
  lines.push('- **Duration:** 4 weeks, 6 days/week + 1 rest day');
  lines.push('- **Session Length:** 70 minutes');

  // Build structure line from block headers
  const blockParts = blockHeaders.map(h => {
    const match = h.match(/^(.+?)\s*\((\d+)\s*min\)$/);
    return match ? `${match[1]} (${match[2]}min)` : h;
  });
  lines.push(`- **Structure:** ${blockParts.join(' → ')}`);
  lines.push('- **Progression:** Foundation → Development → Application → Testing');
  lines.push('');
  lines.push('## Key Principles');
  lines.push('- **Wednesday:** Light/recovery day (reduce intensity, focus on touch and form)');
  lines.push('- **Saturday:** Full assessment/test session');
  lines.push('- **Progression:** Each week builds on the previous — master basics before advancing');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Weeks
  for (const [weekNum, days] of Array.from(weeks.entries()).sort((a, b) => a[0] - b[0])) {
    const wt = weekThemes[weekNum] || { theme: `Week ${weekNum}`, focus: '' };
    lines.push(`## Week ${weekNum}: ${wt.theme}`);
    lines.push(`**Focus:** ${wt.focus}`);
    lines.push('');

    for (const row of days) {
      const day = cellStr(row, 1);         // Day of week
      const focus = cellStr(row, 2);       // Session Focus
      const notes = cellStr(row, 8);       // Notes

      lines.push(`### ${day} — ${focus}`);
      lines.push('');

      // Each block
      for (let i = 0; i < blockHeaders.length; i++) {
        const blockName = blockHeaders[i];
        const blockContent = cellStr(row, 3 + i);

        if (!blockContent) continue;

        lines.push(`#### ${blockName}`);

        // Parse block content — drills separated by + or newline
        const drills = blockContent.split(/\s*\+\s*|\n/).map(s => s.trim()).filter(Boolean);
        for (const drill of drills) {
          // Try to identify drill slug
          const drillSlug = `${sportSlug}-${slugify(drill.replace(/\s*\(.*?\)\s*/g, '').replace(/\s*x\d+.*$/i, ''))}`;
          lines.push(`- \`${drillSlug}\` — ${drill}`);
        }
        lines.push('');
      }

      if (notes) {
        lines.push(`> **Session notes:** ${notes}`);
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

let cleaned = false;
async function cleanup() {
  if (cleaned) return;
  cleaned = true;
  await db.destroy();
}

// ─── Run ─────────────────────────────────────────────────────────────────────

main().catch(async (err) => {
  console.error('❌ Import failed:', err);
  await cleanup();
  process.exit(1);
});
