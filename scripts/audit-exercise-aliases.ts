/**
 * Audit Exercise Aliases Script
 *
 * Uses an LLM to identify and remove inappropriate exercise aliases.
 * Audits aliases to ensure they actually refer to the correct exercise.
 *
 * Options:
 *   --dry-run          Preview changes without deleting
 *   --json             Output results as JSON (useful for piping)
 *   --batch-size=N     Exercises per LLM call (default: 10)
 *   --rate-limit=N     Delay between LLM calls in ms (default: 500)
 *   --verbose          Show detailed logging
 *   --exercise-id=X    Audit a specific exercise only
 *   --interactive      Enable interactive review mode
 *
 * Run: pnpm tsx scripts/audit-exercise-aliases.ts --dry-run --json
 * Run: pnpm tsx scripts/audit-exercise-aliases.ts --interactive
 * Run: pnpm tsx scripts/audit-exercise-aliases.ts --interactive --dry-run
 */

import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import OpenAI from 'openai';
import chalk from 'chalk';
import * as readline from 'readline';

// Types
interface ExerciseWithAliases {
  id: string;
  name: string;
  slug: string;
  aliases: AliasRow[];
}

interface AliasRow {
  id: string;
  alias: string;
  aliasNormalized: string;
  isDefault: boolean;
  source: string;
}

interface InappropriateAlias {
  alias: string;
  reason: string;
}

interface AuditResult {
  exercise_name: string;
  inappropriate_aliases: InappropriateAlias[];
}

interface LLMResponse {
  results: AuditResult[];
}

interface Candidate {
  exerciseId: string;
  name: string;
  confidence: number;
}

interface InappropriateItem {
  exercise: ExerciseWithAliases;
  alias: AliasRow;
  reason: string;
  candidates?: Candidate[];
}

interface SessionStats {
  reassigned: number;
  created: number;
  deleted: number;
  skipped: number;
}

interface PendingExercise {
  name: string;
  aliasId: string;
  originalAlias: string;
}

interface GeneratedExercise {
  name: string;
  slug: string;
  type: string;
  mechanics: string;
  training_groups: string[];
  movement_patterns: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  short_description: string;
  instructions: string;
  cues: string[];
  aliases: string[];
}

// CLI argument parsing
function parseArgs(): {
  dryRun: boolean;
  batchSize: number;
  rateLimit: number;
  verbose: boolean;
  json: boolean;
  exerciseId: string | null;
  interactive: boolean;
} {
  const args = process.argv.slice(2);
  const config = {
    dryRun: false,
    batchSize: 10,
    rateLimit: 500,
    verbose: false,
    json: false,
    exerciseId: null as string | null,
    interactive: false,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      config.dryRun = true;
    } else if (arg === '--verbose') {
      config.verbose = true;
    } else if (arg === '--json') {
      config.json = true;
    } else if (arg === '--interactive') {
      config.interactive = true;
    } else if (arg.startsWith('--batch-size=')) {
      config.batchSize = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--rate-limit=')) {
      config.rateLimit = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--exercise-id=')) {
      config.exerciseId = arg.split('=')[1];
    }
  }

  return config;
}

// Helper for conditional logging (suppressed in JSON mode)
function log(config: { json: boolean }, ...args: unknown[]) {
  if (!config.json) {
    console.log(...args);
  }
}

function logError(config: { json: boolean }, ...args: unknown[]) {
  if (!config.json) {
    console.error(...args);
  }
}

// Prompt helper for interactive mode
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Run: source .env.local');
}

const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<unknown>({
  dialect: new PostgresDialect({ pool }),
});

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Search for candidate exercises that might be a better match for an alias
 */
async function searchCandidates(aliasName: string, limit = 5): Promise<Candidate[]> {
  const results = await sql<{ id: string; name: string; similarity: number }>`
    SELECT e.id, e.name, similarity(e.name, ${aliasName}) as similarity
    FROM exercises e
    WHERE e.is_active = true
    AND similarity(e.name, ${aliasName}) > 0.2
    ORDER BY similarity DESC
    LIMIT ${limit}
  `.execute(db);

  return results.rows.map((r) => ({
    exerciseId: r.id,
    name: r.name,
    confidence: Number(r.similarity),
  }));
}

/**
 * Reassign an alias to a different exercise
 */
async function handleReassign(aliasId: string, newExerciseId: string): Promise<void> {
  await sql`
    UPDATE exercise_aliases
    SET exercise_id = ${newExerciseId}
    WHERE id = ${aliasId}
  `.execute(db);
}

/**
 * Delete an alias
 */
async function handleDelete(aliasId: string): Promise<void> {
  await sql`DELETE FROM exercise_aliases WHERE id = ${aliasId}`.execute(db);
}

// JSON Schema for LLM exercise generation
const EXERCISE_GEN_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Canonical exercise name' },
    slug: { type: 'string', description: 'URL-safe identifier (lowercase, hyphens)' },
    type: {
      type: 'string',
      enum: ['strength', 'conditioning', 'mobility', 'skill', 'sport'],
    },
    mechanics: {
      type: 'string',
      enum: ['compound', 'isolation', ''],
      description: 'Leave empty if not applicable',
    },
    training_groups: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['push', 'pull', 'legs', 'core', 'conditioning', 'full'],
      },
    },
    movement_patterns: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'press',
          'row',
          'pullup',
          'pulldown',
          'squat',
          'hinge',
          'lunge',
          'step_up',
          'carry',
          'rotation',
          'anti_rotation',
          'anti_extension',
          'anti_lateral_flexion',
          'gait',
          'jump',
          'throw',
        ],
      },
    },
    primary_muscles: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'chest',
          'back',
          'shoulders',
          'triceps',
          'biceps',
          'forearms',
          'quads',
          'hamstrings',
          'glutes',
          'calves',
          'abs',
          'obliques',
          'lower_back',
          'hip_flexors',
          'adductors',
          'abductors',
          'traps',
          'lats',
        ],
      },
    },
    secondary_muscles: {
      type: 'array',
      items: { type: 'string' },
    },
    equipment: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'bodyweight',
          'dumbbell',
          'barbell',
          'kettlebell',
          'cable',
          'machine',
          'smith',
          'bands',
          'chains',
          'bench',
          'pullup_bar',
          'rings',
          'treadmill',
          'bike',
          'rower',
          'assault_bike',
          'sled',
          'medicine_ball',
          'trap_bar',
        ],
      },
    },
    short_description: { type: 'string', description: '1-2 sentence description' },
    instructions: { type: 'string', description: 'How to perform the exercise' },
    cues: {
      type: 'array',
      items: { type: 'string' },
      description: '2-4 coaching cues',
    },
    aliases: {
      type: 'array',
      items: { type: 'string' },
      description: '2-5 alternative names people might use',
    },
  },
  required: [
    'name',
    'slug',
    'type',
    'mechanics',
    'training_groups',
    'movement_patterns',
    'primary_muscles',
    'secondary_muscles',
    'equipment',
    'short_description',
    'instructions',
    'cues',
    'aliases',
  ],
  additionalProperties: false,
};

/**
 * Generate a single exercise via LLM
 */
async function generateSingleExercise(exerciseName: string): Promise<GeneratedExercise> {
  const prompt = `Generate a complete exercise entry for: "${exerciseName}"

You are an expert fitness coach and exercise taxonomist. Create accurate, detailed exercise data.

RULES:
- Use the exact exercise name provided, or a cleaner canonical version if appropriate
- Choose the single most appropriate type (strength, conditioning, mobility, skill, sport)
- For mechanics, use "compound" for multi-joint, "isolation" for single-joint, or "" if not applicable
- Include all relevant training groups, movement patterns, and muscles
- Equipment should list what's typically used for this exercise
- Provide a concise description and clear instructions
- Include 2-4 coaching cues that help with form
- Generate 2-5 realistic aliases (abbreviations, alternate spellings, common nicknames)

Be accurate and realistic - this data will be used in a production fitness app.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'Exercise',
        strict: true,
        schema: EXERCISE_GEN_SCHEMA,
      },
    },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from LLM');
  }

  return JSON.parse(content) as GeneratedExercise;
}

/**
 * Insert a generated exercise into the database
 */
async function insertGeneratedExercise(exercise: GeneratedExercise): Promise<string> {
  const slug = exercise.slug || exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Build array literals for PostgreSQL
  const trainingGroups =
    exercise.training_groups.length > 0
      ? `ARRAY[${exercise.training_groups.map((g) => `'${g}'`).join(',')}]::text[]`
      : `'{}'::text[]`;
  const movementPatterns =
    exercise.movement_patterns.length > 0
      ? `ARRAY[${exercise.movement_patterns.map((p) => `'${p}'`).join(',')}]::text[]`
      : `'{}'::text[]`;
  const primaryMuscles =
    exercise.primary_muscles.length > 0
      ? `ARRAY[${exercise.primary_muscles.map((m) => `'${m}'`).join(',')}]::text[]`
      : `'{}'::text[]`;
  const secondaryMuscles =
    exercise.secondary_muscles.length > 0
      ? `ARRAY[${exercise.secondary_muscles.map((m) => `'${m}'`).join(',')}]::text[]`
      : `'{}'::text[]`;
  const equipmentArr =
    exercise.equipment.length > 0
      ? `ARRAY[${exercise.equipment.map((e) => `'${e}'`).join(',')}]::text[]`
      : `'{}'::text[]`;
  const cuesArr =
    exercise.cues.length > 0
      ? `ARRAY[${exercise.cues.map((c) => `'${c.replace(/'/g, "''")}'`).join(',')}]::text[]`
      : `'{}'::text[]`;

  const result = await sql<{ id: string }>`
    INSERT INTO exercises (
      name, slug, type, mechanics, training_groups, movement_patterns,
      primary_muscles, secondary_muscles, equipment,
      short_description, instructions, cues, is_active
    ) VALUES (
      ${exercise.name},
      ${slug},
      ${exercise.type},
      ${exercise.mechanics || ''},
      ${sql.raw(trainingGroups)},
      ${sql.raw(movementPatterns)},
      ${sql.raw(primaryMuscles)},
      ${sql.raw(secondaryMuscles)},
      ${sql.raw(equipmentArr)},
      ${exercise.short_description},
      ${exercise.instructions || ''},
      ${sql.raw(cuesArr)},
      true
    )
    RETURNING id
  `.execute(db);

  return result.rows[0].id;
}

/**
 * Insert aliases for an exercise
 */
async function insertAliasesForExercise(
  exerciseId: string,
  name: string,
  aliases: string[]
): Promise<number> {
  let count = 0;

  // Default alias (the exercise name itself)
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  try {
    await sql`
      INSERT INTO exercise_aliases (exercise_id, alias, alias_normalized, source, is_default)
      VALUES (${exerciseId}, ${name}, ${normalized}, 'manual', true)
    `.execute(db);
    count++;
  } catch {
    // Ignore duplicate
  }

  // Additional aliases from LLM
  for (const alias of aliases) {
    const aliasNorm = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
    try {
      await sql`
        INSERT INTO exercise_aliases (exercise_id, alias, alias_normalized, source, is_default)
        VALUES (${exerciseId}, ${alias}, ${aliasNorm}, 'llm', false)
      `.execute(db);
      count++;
    } catch {
      // Ignore duplicates
    }
  }

  return count;
}

/**
 * Generate exercises via LLM for all pending exercises
 */
async function generateExercisesViaLLM(pending: PendingExercise[]): Promise<number> {
  console.log(chalk.bold(`\nGenerating ${pending.length} new exercises via LLM...\n`));

  let created = 0;

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];
    const idx = i + 1;
    const total = pending.length;

    try {
      console.log(chalk.gray(`[${idx}/${total}] Generating "${item.name}"...`));

      const exercise = await generateSingleExercise(item.name);

      // Insert exercise with all fields
      const exerciseId = await insertGeneratedExercise(exercise);

      // Create default alias + any LLM-generated aliases
      const aliasCount = await insertAliasesForExercise(exerciseId, exercise.name, exercise.aliases);

      // Reassign the original mismatched alias to this new exercise
      await handleReassign(item.aliasId, exerciseId);

      // Display summary
      console.log(`[${idx}/${total}] ${chalk.green(exercise.name)}`);
      console.log(
        `      Type: ${exercise.type} | Groups: ${exercise.training_groups.join(', ') || 'none'}`
      );
      console.log(`      Muscles: ${exercise.primary_muscles.join(', ') || 'none'}`);
      console.log(`      Equipment: ${exercise.equipment.join(', ') || 'none'}`);
      console.log(chalk.green(`      ✓ Created with ${aliasCount} aliases\n`));

      created++;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`[${idx}/${total}] Failed to generate "${item.name}": ${errMsg}\n`));
    }

    // Small delay between LLM calls
    if (i < pending.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return created;
}

/**
 * Interactive review of a single mismatched alias
 */
async function reviewMismatch(
  item: InappropriateItem,
  stats: SessionStats,
  dryRun: boolean,
  pendingExercises: PendingExercise[]
): Promise<boolean> {
  const separator = chalk.gray('━'.repeat(55));
  console.log(separator);
  console.log(chalk.bold(`Alias: "${item.alias.alias}"`));
  console.log(`Currently assigned to: ${chalk.cyan(item.exercise.name)}`);
  console.log(`Reason: ${chalk.yellow(item.reason)}`);
  console.log('');

  // Display candidates if available
  if (item.candidates && item.candidates.length > 0) {
    console.log(chalk.bold('Candidates:'));
    item.candidates.forEach((c, idx) => {
      const pct = Math.round(c.confidence * 100);
      console.log(`  [${idx + 1}] ${c.name} (${pct}% match)`);
    });
    console.log('');
  } else {
    console.log(chalk.gray('No similar exercises found.\n'));
  }

  console.log(chalk.bold('Actions:'));
  if (item.candidates && item.candidates.length > 0) {
    console.log(`  [1-${item.candidates.length}] Reassign to candidate`);
  }
  console.log('  [n]   Create new exercise');
  console.log('  [d]   Delete alias');
  console.log('  [s]   Skip (keep as-is)');
  console.log('  [q]   Quit');
  console.log('');

  const answer = await prompt('Choice: ');

  // Handle quit
  if (answer.toLowerCase() === 'q') {
    return false; // Signal to stop the loop
  }

  // Handle skip
  if (answer.toLowerCase() === 's') {
    stats.skipped++;
    console.log(chalk.gray('Skipped.\n'));
    return true;
  }

  // Handle delete
  if (answer.toLowerCase() === 'd') {
    if (!dryRun) {
      await handleDelete(item.alias.id);
    }
    stats.deleted++;
    const prefix = dryRun ? chalk.yellow('[DRY RUN] Would delete') : chalk.red('Deleted');
    console.log(`${prefix} alias "${item.alias.alias}".\n`);
    return true;
  }

  // Handle create new - queue for LLM generation
  if (answer.toLowerCase() === 'n') {
    const name = await prompt('Enter exercise name: ');
    if (!name) {
      console.log(chalk.gray('Cancelled.\n'));
      stats.skipped++;
      return true;
    }

    // Queue for LLM generation instead of creating immediately
    pendingExercises.push({
      name,
      aliasId: item.alias.id,
      originalAlias: item.alias.alias,
    });
    stats.created++;
    console.log(chalk.cyan(`Queued "${name}" for creation.\n`));
    return true;
  }

  // Handle reassign to candidate
  const candidateIdx = parseInt(answer, 10);
  if (
    !isNaN(candidateIdx) &&
    item.candidates &&
    candidateIdx >= 1 &&
    candidateIdx <= item.candidates.length
  ) {
    const candidate = item.candidates[candidateIdx - 1];
    if (!dryRun) {
      await handleReassign(item.alias.id, candidate.exerciseId);
    }
    stats.reassigned++;
    const prefix = dryRun ? chalk.yellow('[DRY RUN] Would reassign') : chalk.green('Reassigned');
    console.log(`${prefix} alias to "${candidate.name}".\n`);
    return true;
  }

  console.log(chalk.gray('Invalid choice, skipping.\n'));
  stats.skipped++;
  return true;
}

/**
 * Build the LLM prompt for auditing aliases
 */
function buildAuditPrompt(exercises: ExerciseWithAliases[]): string {
  const exerciseList = exercises.map((ex) => ({
    name: ex.name,
    aliases: ex.aliases
      .filter((a) => !a.isDefault) // Never audit default aliases
      .map((a) => a.alias),
  }));

  return `You are auditing exercise aliases for a fitness application. Your job is to identify aliases that are INAPPROPRIATE and should be removed.

For each exercise below, review its aliases and identify any that are INAPPROPRIATE.

## What makes an alias INAPPROPRIATE (should be removed):
- **Different exercise entirely**: The alias refers to a completely different exercise (e.g., "box jump" as an alias for "push-up")
- **Generic terms**: Terms too vague to be useful (e.g., "exercise", "workout", "movement")
- **Unrecognizable misspellings**: Typos so severe they don't resemble the exercise name
- **Fundamentally different variations**: Variations that are distinct exercises (e.g., "Romanian deadlift" is NOT an alias for "conventional deadlift")

## What makes an alias APPROPRIATE (should be kept):
- **Alternate spellings**: "pushup" vs "push-up" vs "push up"
- **Abbreviations**: "RDL" for "Romanian Deadlift"
- **Regional variations**: "press-up" for "push-up"
- **Common nicknames**: "skull crusher" for "lying tricep extension"
- **Formatting differences**: Capitalization, hyphens, spacing
- **Minor misspellings**: Typos that are still recognizable

## Exercises to audit:
${JSON.stringify(exerciseList, null, 2)}

## Response format:
Return a JSON object with this exact structure:
{
  "results": [
    {
      "exercise_name": "push-up",
      "inappropriate_aliases": [
        { "alias": "box jump", "reason": "Completely different exercise - plyometric jump vs upper body push" }
      ]
    }
  ]
}

Only include exercises that have at least one inappropriate alias. If all aliases for an exercise are appropriate, omit that exercise from the results.`;
}

/**
 * Audit a batch of exercises using the LLM
 */
async function auditBatch(exercises: ExerciseWithAliases[]): Promise<Map<string, InappropriateAlias[]>> {
  const results = new Map<string, InappropriateAlias[]>();

  // Filter out exercises with only default aliases
  const exercisesWithNonDefaultAliases = exercises.filter(
    (ex) => ex.aliases.some((a) => !a.isDefault)
  );

  if (exercisesWithNonDefaultAliases.length === 0) {
    return results;
  }

  const prompt = buildAuditPrompt(exercisesWithNonDefaultAliases);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed: LLMResponse = JSON.parse(content);

      if (parsed.results && Array.isArray(parsed.results)) {
        for (const result of parsed.results) {
          if (result.exercise_name && result.inappropriate_aliases?.length > 0) {
            results.set(result.exercise_name, result.inappropriate_aliases);
          }
        }
      }
    }
  } catch (error) {
    // Error logged in main, just rethrow or handle silently
    throw error;
  }

  return results;
}

/**
 * Main script
 */
async function main() {
  const config = parseArgs();

  log(config, chalk.bold.blue('\n=== Exercise Alias Audit Script ===\n'));

  if (config.dryRun) {
    log(config, chalk.yellow('🔍 DRY RUN MODE - No changes will be made\n'));
  }

  if (!process.env.OPENAI_API_KEY) {
    logError(config, chalk.red('OPENAI_API_KEY environment variable is not set'));
    process.exit(1);
  }

  // Load exercises with aliases
  let exerciseQuery = sql<{
    id: string;
    name: string;
    slug: string;
  }>`SELECT id, name, slug FROM exercises WHERE is_active = true`;

  if (config.exerciseId) {
    exerciseQuery = sql<{
      id: string;
      name: string;
      slug: string;
    }>`SELECT id, name, slug FROM exercises WHERE id = ${config.exerciseId}`;
  }

  const exercisesResult = await exerciseQuery.execute(db);
  const exercises = exercisesResult.rows;

  if (exercises.length === 0) {
    if (config.json) {
      console.log(JSON.stringify({ exercises: [], inappropriateAliases: [], statistics: {} }, null, 2));
    } else {
      log(config, chalk.yellow('No exercises found'));
    }
    await db.destroy();
    return;
  }

  log(config, `Loaded ${chalk.green(exercises.length)} exercises\n`);

  // Load aliases for each exercise
  const exercisesWithAliases: ExerciseWithAliases[] = [];

  for (const ex of exercises) {
    const aliasesResult = await sql<AliasRow>`
      SELECT id, alias, alias_normalized as "aliasNormalized", is_default as "isDefault", source
      FROM exercise_aliases
      WHERE exercise_id = ${ex.id}
    `.execute(db);

    exercisesWithAliases.push({
      ...ex,
      aliases: aliasesResult.rows,
    });
  }

  // Count total aliases
  const totalAliases = exercisesWithAliases.reduce((sum, ex) => sum + ex.aliases.length, 0);
  const defaultAliases = exercisesWithAliases.reduce(
    (sum, ex) => sum + ex.aliases.filter((a) => a.isDefault).length,
    0
  );

  log(config, `Total aliases: ${chalk.green(totalAliases)}`);
  log(config, `Default aliases (protected): ${chalk.blue(defaultAliases)}`);
  log(config, `Auditable aliases: ${chalk.yellow(totalAliases - defaultAliases)}\n`);

  // Process in batches
  const allInappropriate: InappropriateItem[] = [];
  let batchNum = 0;

  log(config, chalk.bold('--- Auditing aliases ---\n'));

  for (let i = 0; i < exercisesWithAliases.length; i += config.batchSize) {
    batchNum++;
    const batch = exercisesWithAliases.slice(i, i + config.batchSize);

    if (config.verbose) {
      log(config, `Processing batch ${batchNum}...`);
    }

    try {
      const batchResults = await auditBatch(batch);

      // Match results to exercises and aliases
      for (const [exerciseName, inappropriateAliases] of batchResults) {
        const exercise = batch.find((ex) => ex.name === exerciseName);
        if (!exercise) continue;

        for (const inappropriate of inappropriateAliases) {
          // Find the matching alias row
          const aliasRow = exercise.aliases.find(
            (a) => a.alias.toLowerCase() === inappropriate.alias.toLowerCase()
          );

          if (aliasRow && !aliasRow.isDefault) {
            allInappropriate.push({
              exercise,
              alias: aliasRow,
              reason: inappropriate.reason,
            });

            if (config.verbose) {
              log(
                config,
                chalk.red(`  ✗ ${exercise.name}: "${inappropriate.alias}"`) +
                  chalk.gray(` - ${inappropriate.reason}`)
              );
            }
          }
        }
      }
    } catch (error) {
      logError(config, chalk.red(`Batch ${batchNum} failed:`), error);
    }

    // Rate limiting
    if (i + config.batchSize < exercisesWithAliases.length) {
      await new Promise((resolve) => setTimeout(resolve, config.rateLimit));
    }
  }

  log(config, `\nProcessed ${chalk.green(batchNum)} batches\n`);

  // Search for candidates for each inappropriate alias (needed for interactive mode)
  if (config.interactive && allInappropriate.length > 0) {
    log(config, chalk.bold('--- Searching for candidates ---\n'));
    for (const item of allInappropriate) {
      item.candidates = await searchCandidates(item.alias.alias);
    }
    log(config, chalk.green(`Found candidates for ${allInappropriate.length} aliases\n`));
  }

  // JSON output mode
  if (config.json) {
    const jsonOutput = {
      dryRun: config.dryRun,
      statistics: {
        exercisesAudited: exercisesWithAliases.length,
        totalAliases,
        defaultAliases,
        auditableAliases: totalAliases - defaultAliases,
        inappropriateAliasesFound: allInappropriate.length,
      },
      inappropriateAliases: allInappropriate.map((item) => ({
        exerciseId: item.exercise.id,
        exerciseName: item.exercise.name,
        exerciseSlug: item.exercise.slug,
        aliasId: item.alias.id,
        alias: item.alias.alias,
        aliasNormalized: item.alias.aliasNormalized,
        source: item.alias.source,
        reason: item.reason,
      })),
    };

    console.log(JSON.stringify(jsonOutput, null, 2));
    await db.destroy();
    return;
  }

  // Summary (non-JSON mode)
  log(config, chalk.bold('--- Summary ---\n'));

  if (allInappropriate.length === 0) {
    log(config, chalk.green('✓ No inappropriate aliases found!\n'));
    await db.destroy();
    return;
  }

  log(config, chalk.red(`Found ${allInappropriate.length} inappropriate aliases:\n`));

  // Group by exercise for display
  const byExercise = new Map<string, typeof allInappropriate>();
  for (const item of allInappropriate) {
    const key = item.exercise.name;
    if (!byExercise.has(key)) {
      byExercise.set(key, []);
    }
    byExercise.get(key)!.push(item);
  }

  for (const [exerciseName, items] of byExercise) {
    log(config, chalk.bold(exerciseName));
    for (const item of items) {
      log(
        config,
        chalk.red(`  ✗ "${item.alias.alias}"`) +
          chalk.gray(` (${item.alias.source})`) +
          chalk.gray(` - ${item.reason}`)
      );
    }
    log(config, '');
  }

  // Interactive mode
  if (config.interactive) {
    if (config.dryRun) {
      log(config, chalk.yellow('🔍 DRY RUN MODE - No changes will be made\n'));
    }
    log(config, chalk.bold('--- Interactive Review ---\n'));
    const stats: SessionStats = { reassigned: 0, created: 0, deleted: 0, skipped: 0 };
    const pendingExercises: PendingExercise[] = [];

    for (const item of allInappropriate) {
      const shouldContinue = await reviewMismatch(item, stats, config.dryRun, pendingExercises);
      if (!shouldContinue) {
        log(config, chalk.gray('\nSession ended by user.\n'));
        break;
      }
    }

    // Generate exercises via LLM for any queued exercises
    if (pendingExercises.length > 0 && !config.dryRun) {
      const separator = chalk.gray('━'.repeat(55));
      log(config, separator);
      const generatedCount = await generateExercisesViaLLM(pendingExercises);
      // Update stats with actual count (may differ if some failed)
      stats.created = generatedCount;
    }

    // Session summary
    const separator = chalk.gray('━'.repeat(55));
    log(config, separator);
    const title = config.dryRun ? 'Session Complete (Dry Run)' : 'Session Complete';
    log(config, chalk.bold(`${title}\n`));
    const actionWord = config.dryRun ? 'Would reassign' : 'Reassigned';
    const createWord = config.dryRun ? 'Would create' : 'Created';
    const deleteWord = config.dryRun ? 'Would delete' : 'Deleted';
    log(config, `  ${actionWord}: ${chalk.green(stats.reassigned)} aliases`);
    log(config, `  ${createWord}:    ${chalk.green(stats.created)} new exercises (via LLM)`);
    log(config, `  ${deleteWord}:    ${chalk.red(stats.deleted)} aliases`);
    log(config, `  Skipped:    ${chalk.gray(stats.skipped)} aliases`);
    log(config, '');
  } else if (config.dryRun) {
    // Delete or report (non-interactive)
    log(config, chalk.yellow('🔍 DRY RUN - No aliases were deleted'));
    log(config, chalk.gray(`Run without --dry-run to delete ${allInappropriate.length} aliases\n`));
  } else {
    log(config, chalk.bold('--- Deleting inappropriate aliases ---\n'));

    let deleted = 0;
    for (const item of allInappropriate) {
      await sql`DELETE FROM exercise_aliases WHERE id = ${item.alias.id}`.execute(db);
      deleted++;

      if (config.verbose) {
        log(config, chalk.red(`  Deleted: "${item.alias.alias}" from ${item.exercise.name}`));
      }
    }

    log(config, chalk.green(`✓ Deleted ${deleted} inappropriate aliases\n`));
  }

  // Final stats (only show for non-interactive mode)
  if (!config.interactive) {
    log(config, chalk.bold('--- Final Statistics ---\n'));
    log(config, `Exercises audited: ${chalk.green(exercisesWithAliases.length)}`);
    log(config, `Total aliases: ${chalk.green(totalAliases)}`);
    log(config, `Default aliases (protected): ${chalk.blue(defaultAliases)}`);
    log(config, `Inappropriate aliases found: ${chalk.red(allInappropriate.length)}`);

    if (!config.dryRun) {
      log(config, `Aliases deleted: ${chalk.red(allInappropriate.length)}`);
      log(config, `Remaining aliases: ${chalk.green(totalAliases - allInappropriate.length)}`);
    }

    log(config, '');
  }

  await db.destroy();
  log(config, chalk.green('Done!\n'));
}

main().catch((err) => {
  console.error(chalk.red('Script failed:'), err);
  process.exit(1);
});
