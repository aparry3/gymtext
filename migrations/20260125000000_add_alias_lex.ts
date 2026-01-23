import { Kysely, sql } from 'kysely';

/**
 * Add alias_lex Column Migration
 *
 * Adds a token-based, order-invariant representation of exercise aliases
 * for improved fuzzy matching. The alias_lex column enables:
 * - Synonym resolution (dumbell → dumbbell, rdl → romanian deadlift)
 * - Singularization (curls → curl, presses → press)
 * - Order-invariant matching (leg curl lying = lying leg curl)
 * - Stopword removal (with, and, the, etc.)
 */

// --- Duplicated normalization logic (standard practice for migrations) ---

const EXERCISE_SYNONYM_MAP: Record<string, string> = {
  laying: 'lying',
  dumbell: 'dumbbell',
  dumbel: 'dumbbell',
  dumble: 'dumbbell',
  db: 'dumbbell',
  bb: 'barbell',
  rdl: 'romanian deadlift',
  pullup: 'pull up',
  pushup: 'push up',
  situp: 'sit up',
  chinup: 'chin up',
  stepup: 'step up',
  incl: 'incline',
  decl: 'decline',
  ext: 'extension',
  tri: 'tricep',
  bi: 'bicep',
};

const STOPWORDS = new Set([
  'with', 'and', 'the', 'a', 'an', 'of', 'on', 'to',
  'for', 'in', 'using', 'from', 'by',
]);

const IRREGULAR_SINGULARS: Record<string, string> = {
  calves: 'calf',
};

function singularize(word: string): string {
  if (IRREGULAR_SINGULARS[word]) return IRREGULAR_SINGULARS[word];
  if (word.length <= 2) return word;
  if (word.endsWith('sses')) return word.slice(0, -2);
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('ses') && !word.endsWith('sses')) return word.slice(0, -1);
  if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) return word.slice(0, -1);
  return word;
}

function normalizeForLex(input: string): string {
  let text = input.toLowerCase();
  text = text.replace(/-/g, ' ');
  text = text.replace(/[^a-z\s]/g, '');
  let tokens = text.split(/\s+/).filter(t => t.length > 0);
  tokens = tokens.filter(t => !STOPWORDS.has(t));
  tokens = tokens.map(singularize);
  tokens = tokens.flatMap(t => {
    const replacement = EXERCISE_SYNONYM_MAP[t];
    if (replacement) return replacement.split(' ');
    return [t];
  });
  tokens = [...new Set(tokens)];
  tokens.sort();
  return tokens.join(' ');
}

// --- Migration ---

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Adding alias_lex column to exercise_aliases...');

  // Step 1: Add column (nullable initially for backfill)
  await sql`ALTER TABLE exercise_aliases ADD COLUMN alias_lex varchar(200)`.execute(db);
  console.log('Added alias_lex column');

  // Step 2: Create indexes
  await sql`CREATE INDEX idx_exercise_aliases_lex_trgm ON exercise_aliases USING gin (alias_lex gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX idx_exercise_aliases_lex_exact ON exercise_aliases (alias_lex)`.execute(db);
  console.log('Created indexes on alias_lex');

  // Step 3: Backfill existing aliases
  const aliases = await sql<{ id: string; alias: string }>`
    SELECT id, alias FROM exercise_aliases
  `.execute(db);

  console.log(`Backfilling ${aliases.rows.length} aliases...`);

  let updated = 0;
  for (const row of aliases.rows) {
    const lex = normalizeForLex(row.alias);
    await sql`
      UPDATE exercise_aliases SET alias_lex = ${lex} WHERE id = ${row.id}::uuid
    `.execute(db);
    updated++;
  }

  console.log(`Backfilled ${updated} aliases`);

  // Step 4: Set NOT NULL constraint
  await sql`ALTER TABLE exercise_aliases ALTER COLUMN alias_lex SET NOT NULL`.execute(db);
  console.log('Set alias_lex NOT NULL');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_exercise_aliases_lex_exact`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_exercise_aliases_lex_trgm`.execute(db);
  await sql`ALTER TABLE exercise_aliases DROP COLUMN IF EXISTS alias_lex`.execute(db);
  console.log('Removed alias_lex column and indexes');
}
