/**
 * Assign Movements Script
 *
 * Assigns movement_id to exercises using:
 * 1. Rule-based name/field matching
 * 2. GPT classification for ambiguous cases
 * 3. Updates exercises.json with movement_slug for reproducibility
 *
 * Run: npx tsx scripts/assign-movements.ts
 */

import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';

// Types
interface ExerciseRow {
  id: string;
  name: string;
  slug: string;
  type: string;
  movement_patterns: string[];
}

interface MovementRow {
  id: string;
  slug: string;
  name: string;
}

interface ExerciseJson {
  name: string;
  slug: string;
  status: string;
  type: string;
  mechanics: string;
  training_groups: string[];
  movement_patterns: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  modality: string;
  intensity: string;
  short_description: string;
  instructions: string;
  cues: string[];
  parent_exercise_slug: string;
  variation_label: string;
  aliases: string[];
  popularity: number;
  movement_slug?: string;
}

// Connect to database
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Run: source .env.local');
}

const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<unknown>({
  dialect: new PostgresDialect({ pool }),
});

// Rule-based matching definitions
const MOVEMENT_RULES: Record<string, {
  namePatterns?: RegExp[];
  movementPatternMatch?: string;
  typeConstraint?: string;
  nameExclusions?: RegExp[];
}> = {
  run: {
    namePatterns: [
      /\brun\b/i, /\bsprint\b/i, /\bjog\b/i, /\bstrides\b/i,
      /\bfartlek\b/i, /\bhill repeats?\b/i, /\btempo run\b/i,
      /\btreadmill\b/i,
    ],
  },
  bike: {
    namePatterns: [
      /\bbike\b/i, /\bcycling\b/i, /\bbikeerg\b/i,
      /\bspin\b/i, /\bairdyne\b/i, /\bassault bike\b/i,
    ],
  },
  swim: {
    namePatterns: [/\bswim\b/i],
  },
  row_erg: {
    namePatterns: [/\browing\b/i, /\brower\b/i],
  },
  elliptical: {
    namePatterns: [/\belliptical\b/i, /\barc trainer\b/i],
  },
  stair_climber: {
    namePatterns: [/\bstair climber\b/i, /\bstairmaster\b/i, /\bstair.?mill\b/i],
  },
  bench_press: {
    namePatterns: [/\bbench press\b/i, /\bchest press\b/i, /\bfloor press\b/i],
  },
  push_up: {
    namePatterns: [/\bpush[\s-]?up\b/i, /\bpushup\b/i],
  },
  squat: {
    namePatterns: [/\bsquat\b/i],
    nameExclusions: [/\bsplit squat\b/i],
  },
  deadlift: {
    namePatterns: [/\bdeadlift\b/i],
  },
  overhead_press: {
    namePatterns: [
      /\boverhead press\b/i, /\bshoulder press\b/i,
      /\bmilitary press\b/i, /\bpush press\b/i, /\barnold press\b/i,
    ],
  },
  row: {
    movementPatternMatch: 'row',
    typeConstraint: 'strength',
  },
  pull_up: {
    namePatterns: [/\bpull[\s-]?up\b/i, /\bchin[\s-]?up\b/i, /\bmuscle[\s-]?up\b/i],
  },
  lunge: {
    namePatterns: [/\blunge\b/i, /\bsplit squat\b/i, /\bstep[\s-]?up\b/i],
  },
  hip_thrust: {
    namePatterns: [/\bhip thrust\b/i, /\bglute bridge\b/i],
  },
  carry: {
    namePatterns: [/\bcarry\b/i, /\bfarmer\b/i],
  },
  core: {
    namePatterns: [
      /\bplank\b/i, /\bcrunch\b/i, /\bsit[\s-]?up\b/i,
      /\bdead bug\b/i, /\bpallof\b/i, /\bhollow\b/i, /\bab wheel\b/i,
    ],
    movementPatternMatch: 'anti_extension|anti_rotation|anti_lateral_flexion|rotation',
  },
  jump: {
    namePatterns: [/\bjump\b/i, /\bbound\b/i, /\bplyometric\b/i, /\bbox jump\b/i],
    movementPatternMatch: 'jump',
  },
};

/**
 * Phase 1: Rule-based assignment
 */
function assignByRules(exercise: ExerciseRow): string | null {
  const name = exercise.name;
  const patterns = exercise.movement_patterns || [];
  const type = exercise.type;

  for (const [slug, rule] of Object.entries(MOVEMENT_RULES)) {
    // Check name exclusions first
    if (rule.nameExclusions) {
      const excluded = rule.nameExclusions.some(re => re.test(name));
      if (excluded) continue;
    }

    // Check name patterns
    if (rule.namePatterns) {
      const nameMatch = rule.namePatterns.some(re => re.test(name));
      if (nameMatch) {
        // If there's a type constraint, enforce it
        if (rule.typeConstraint && type !== rule.typeConstraint) continue;
        return slug;
      }
    }

    // Check movement pattern match (without name match required)
    if (rule.movementPatternMatch && !rule.namePatterns) {
      const patternRegex = new RegExp(`^(${rule.movementPatternMatch})$`, 'i');
      const patternMatch = patterns.some(p => patternRegex.test(p));
      if (patternMatch) {
        if (rule.typeConstraint && type !== rule.typeConstraint) continue;
        return slug;
      }
    }

    // Check movement pattern as a fallback (when name patterns didn't match but patterns exist)
    if (rule.movementPatternMatch && rule.namePatterns) {
      const patternRegex = new RegExp(`^(${rule.movementPatternMatch})$`, 'i');
      const patternMatch = patterns.some(p => patternRegex.test(p));
      if (patternMatch) {
        if (rule.typeConstraint && type !== rule.typeConstraint) continue;
        return slug;
      }
    }
  }

  return null;
}

/**
 * Phase 2: GPT classification for unassigned exercises
 */
async function classifyWithGpt(
  exercises: ExerciseRow[],
  validSlugs: string[]
): Promise<Map<string, string | null>> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const results = new Map<string, string | null>();

  // Batch exercises in groups of 20
  const BATCH_SIZE = 20;

  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE);

    const exerciseList = batch.map(ex => ({
      id: ex.id,
      name: ex.name,
      type: ex.type,
      movement_patterns: ex.movement_patterns,
    }));

    const prompt = `You are classifying exercises into movement categories for progress tracking.

Valid movement slugs: ${validSlugs.join(', ')}

For each exercise below, return the most appropriate movement slug, or "none" if the exercise is an isolation movement that doesn't fit any category (e.g., bicep curls, lateral raises, calf raises, wrist curls).

Rules:
- "squat" = back squat, front squat, goblet squat, etc. (NOT split squat)
- "lunge" = lunges, split squats, step-ups
- "row" = strength rowing movements (bent-over row, cable row, etc.)
- "row_erg" = cardio rowing machine
- "core" = planks, crunches, anti-rotation, anti-extension exercises
- "jump" = plyometric/jumping exercises
- "none" = isolation exercises (curls, raises, extensions, flyes, shrugs, etc.)

Exercises:
${JSON.stringify(exerciseList, null, 2)}

Return a JSON array of objects with "id" and "slug" fields. Use exactly the slugs listed above or "none".`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);

        // Handle various response shapes: array directly, or object with any array value
        let items: { id: string; slug: string }[] = [];
        if (Array.isArray(parsed)) {
          items = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          // Find the first array value in the object
          for (const val of Object.values(parsed)) {
            if (Array.isArray(val)) {
              items = val as { id: string; slug: string }[];
              break;
            }
          }
        }

        for (const item of items) {
          if (item.id && item.slug) {
            if (item.slug === 'none' || !validSlugs.includes(item.slug)) {
              results.set(item.id, null);
            } else {
              results.set(item.id, item.slug);
            }
          }
        }
      }
    } catch (error) {
      console.error(`GPT batch ${i / BATCH_SIZE + 1} failed:`, error);
      // Mark all in batch as null (no assignment)
      for (const ex of batch) {
        results.set(ex.id, null);
      }
    }

    // Respect rate limits
    if (i + BATCH_SIZE < exercises.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

async function main() {
  console.log('=== Assign Movements Script ===\n');

  // Load movements from DB
  const movements = await sql<MovementRow>`SELECT id, slug, name FROM movements`.execute(db);
  const movementMap = new Map(movements.rows.map(m => [m.slug, m.id]));
  const validSlugs = movements.rows.map(m => m.slug);
  console.log(`Loaded ${movements.rows.length} movements`);

  // Load all exercises
  const exercises = await sql<ExerciseRow>`
    SELECT id, name, slug, type, movement_patterns FROM exercises WHERE is_active = true
  `.execute(db);
  console.log(`Loaded ${exercises.rows.length} active exercises\n`);

  // Phase 1: Rule-based assignment
  console.log('--- Phase 1: Rule-based matching ---');
  const assignments = new Map<string, string>(); // exercise_id -> movement_slug
  const unassigned: ExerciseRow[] = [];

  for (const ex of exercises.rows) {
    const slug = assignByRules(ex);
    if (slug) {
      assignments.set(ex.id, slug);
    } else {
      unassigned.push(ex);
    }
  }
  console.log(`Rule-based: ${assignments.size} assigned, ${unassigned.length} remaining\n`);

  // Phase 2: GPT classification for remaining
  if (unassigned.length > 0 && process.env.OPENAI_API_KEY) {
    console.log('--- Phase 2: GPT classification ---');
    const gptResults = await classifyWithGpt(unassigned, validSlugs);

    let gptAssigned = 0;
    for (const [id, slug] of gptResults) {
      if (slug) {
        assignments.set(id, slug);
        gptAssigned++;
      }
    }
    console.log(`GPT: ${gptAssigned} assigned, ${unassigned.length - gptAssigned} left as NULL\n`);
  } else if (!process.env.OPENAI_API_KEY) {
    console.log('Skipping GPT phase (OPENAI_API_KEY not set)\n');
  }

  // Phase 3: Update DB
  console.log('--- Phase 3: Updating database ---');
  let updated = 0;
  for (const [exerciseId, movementSlug] of assignments) {
    const movementId = movementMap.get(movementSlug);
    if (movementId) {
      await sql`
        UPDATE exercises SET movement_id = ${movementId}, updated_at = now()
        WHERE id = ${exerciseId}
      `.execute(db);
      updated++;
    }
  }
  console.log(`Updated ${updated} exercises with movement_id\n`);

  // Phase 4: Update exercises.json
  console.log('--- Phase 4: Updating exercises.json ---');
  const filePath = join(process.cwd(), 'data', 'exercises.json');
  const raw = readFileSync(filePath, 'utf-8');
  const data: { exercises: ExerciseJson[] } = JSON.parse(raw);

  // Build slug-to-movement_slug map from DB
  const exerciseSlugToMovement = new Map<string, string>();
  for (const ex of exercises.rows) {
    const movementSlug = assignments.get(ex.id);
    if (movementSlug) {
      exerciseSlugToMovement.set(ex.slug, movementSlug);
    }
  }

  let jsonUpdated = 0;
  for (const ex of data.exercises) {
    const movementSlug = exerciseSlugToMovement.get(ex.slug);
    if (movementSlug) {
      ex.movement_slug = movementSlug;
      jsonUpdated++;
    } else {
      // Explicitly remove if previously set but now null
      delete ex.movement_slug;
    }
  }

  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`Updated ${jsonUpdated} entries in exercises.json\n`);

  // Summary
  console.log('=== Summary ===');
  const countResult = await sql<{ movement_name: string; count: string }>`
    SELECT m.name as movement_name, count(e.id)::text as count
    FROM movements m
    LEFT JOIN exercises e ON e.movement_id = m.id
    GROUP BY m.name
    ORDER BY count DESC
  `.execute(db);

  for (const row of countResult.rows) {
    console.log(`  ${row.movement_name}: ${row.count} exercises`);
  }

  const nullCount = await sql<{ count: string }>`
    SELECT count(*)::text as count FROM exercises WHERE movement_id IS NULL AND is_active = true
  `.execute(db);
  console.log(`  (unassigned): ${nullCount.rows[0].count} exercises`);

  await db.destroy();
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
