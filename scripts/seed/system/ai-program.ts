/**
 * Seed AI Personal Training Program Formats
 *
 * Updates the default AI program's published version `generation_config.formats`
 * with `Daily Message Format` and `Weekly Message Format` entries. These flow
 * into the `workout:format` and `week:format` agents via the `programFormat`
 * context (see markdownService.getContext), where they take precedence over
 * each agent's generic fallback rules.
 *
 * Why a seeder and not a migration: `generation_config` is a JSONB column.
 * Changing its contents is data, not schema. The original consolidated
 * migration is already applied and is immutable — do not edit it. Re-running
 * this seeder is the supported way to update default-program formats across
 * environments.
 *
 * Idempotent: always overwrites `generation_config.formats` on the AI version.
 */

import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';

// ─── Constants ───────────────────────────────────────────────────────────────

const AI_VERSION_ID = '00000000-0000-0000-0000-000000000003';

// ─── Format Content ──────────────────────────────────────────────────────────

const DAILY_MESSAGE_FORMAT = {
  title: 'Daily Message Format',
  instruction: `Format each day's workout as a concise, SMS-friendly message.

**Conciseness & line length**
- ~50-60 characters per line ideal, 80 absolute max
- Drop unnecessary words, parenthetical explanations, and exercise variants
- Use the standard abbreviations below everywhere possible

**Standard Abbreviations (always use):**
- SL = single-leg
- DB = dumbbell
- KB = kettlebell
- OH = overhead
- RDL = Romanian Deadlift
- SS = superset (SS1, SS2, SS3)
- C = circuit (C1, C2, C3)
- min = minutes, s = seconds
- @ = at (effort)
- w/ = with
- ea = each, alt = alternating

**Structure**
- Workout name on the top line ending with a colon (e.g. "Push Volume Day:")
- Exercises as bullets below
- No extra headers. No bottom "Rest:", "Adjustment:", or "Cool down:" sections.

**Exercise notation**
- Sets x reps: \`4x10-12\`, \`5x5\`, \`3x30s\` (time), \`4x40m\` (distance)
- Unilateral: \`/leg\`, \`/side\`, \`/arm\` (e.g. \`SL RDL: 3x8/leg\`)
- Supersets: prefix exercises grouped back-to-back with \`SS1\`, \`SS2\`, etc.
- Circuits: prefix with \`C1: Nx\`, \`C2: Nx\` (where N = rounds per circuit)

**Running / cardio notation**
- Always include effort: \`@ 75%\`, \`@ 85%\`, etc.
- Pace/distance segment: \`3-4 mi @ 75%\`, \`15 min @ 85%\`
- Intervals: \`6x: 400m @ 95% + 90s jog\`
- Warmup/cooldown as bullets: \`2 mi: warmup jog\`, \`1 mi: cooldown jog\`

**AMRAP / EMOM**
- AMRAP header: \`<Duration>-Minute AMRAP:\` followed by exercises as bullets
- EMOM header: \`<Duration>-Minute EMOM:\` followed by \`- Min 1: <exercise>\`, etc.

**Lifting days — CRITICAL:**
- Omit warmup bullets (no bike/row, no mobility drills, no ramp sets)
- Omit cooldown bullets (no stretching, no foam rolling)
- Omit rest-period notes
- Show only the main working sets. Lifters handle warmups themselves.

**Running / cardio days:**
- Include warmup and cooldown as part of the structure
- Brief pacing or form reminder is OK at the end, sparingly

**Rest / recovery days — keep it simple:**
- General activity type + total duration only (e.g. "Easy bike/row: 30min")
- Don't break into time segments. Don't list specific mobility drills with sets/reps.
- End with: "Let me know if you need specific mobility exercises"

**Notes**
- For lifting: avoid notes entirely — just show the work
- For cardio: brief pacing/form reminder OK, 1-2 bullets max
- Never create separate "Rest:", "Adjustment:", or "Cool down:" sections at the bottom`,
  examples: [
    `Deadlift Day:
- Deadlift: 4x4 @ 80%
- Front Squat: 3x5 @ 70%
- SL RDL: 3x8/leg
- Farmer/Suitcase Carry: 3x40-60m
- Pallof Press: 3x10-12`,

    `Push Volume Day:
- DB Flat Bench: 4x10-12
- Incline DB Bench: 3x12-15
- Seated DB Shoulder Press: 3x10-12
- SS1 Cable Lateral Raise: 3x15-20
- SS1 Reverse Pec Deck Fly: 3x15-20
- SS2 Rope Tri Pushdown: 3x12-15
- SS2 DB OH Tri Extension: 3x12-15
- SS3 Dead Bug: 3x8-10/side
- SS3 Front Plank: 3x30-45s

Conditioning:
- Moderate cardio: 20-25m`,

    `Track Intervals:
- 1.5 mi: warmup jog
- 6x: 400m @ 95% + 90s jog
- 1 mi: cooldown jog`,

    `Active Recovery:
- Easy bike/row: 30min
- Stretching and mobility

Let me know if you need specific mobility exercises`,
  ],
};

const WEEKLY_MESSAGE_FORMAT = {
  title: 'Weekly Message Format',
  instruction: `Format a full 7-day week as a compact, SMS-friendly summary — a preview of the week ahead, not a full breakdown of every day.

**Structure**
- Optional opening line with the week's focus / theme (e.g. "Week 3 - Volume Accumulation:")
- One block per day in order (Mon → Sun)
- Each day block: day label + focus on one line, then bullets for the main movements

**Per-day block**
- Header line: \`<Day> - <Focus>\` (e.g. "Mon - Push Volume", "Thu - Active Recovery")
- Bullets below with the main exercises/segments — use the same abbreviations and notation as the daily format (SL, DB, KB, RDL, SS, C, @, /leg, etc.)
- Keep it tight: highlight the key work, not every accessory
- Rest days can be a single line: \`Sun - Rest\`

**Voice & length**
- Concise, no fluff, no motivational closers
- SMS-friendly line lengths (~60 chars ideal)
- Return plain text, no code fences`,
  examples: [
    `Week 3 - Volume Accumulation:

Mon - Push Volume:
- DB Bench: 4x10-12
- Incline DB: 3x12-15
- SS Lat Raise + Rear Delt: 3x15-20

Tue - Easy Run:
- 3-4 mi @ 75%

Wed - Pull Strength:
- Deadlift: 4x4 @ 80%
- Row: 3x8-10
- Pull-up: 3xAMRAP

Thu - Active Recovery:
- Easy bike: 30min
- Stretching and mobility

Fri - Lower Volume:
- Back Squat: 4x8
- RDL: 3x10
- SL RDL: 3x8/leg

Sat - Tempo Run:
- 2 mi: warmup jog
- 5 mi @ 85%
- 1 mi: cooldown jog

Sun - Rest`,
  ],
};

// ─── Main Export ─────────────────────────────────────────────────────────────

export async function seedAiProgram(): Promise<void> {
  console.log('Seeding AI program formats...');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not set');
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 5 });
  const db = new Kysely<any>({
    dialect: new PostgresDialect({ pool }),
  });

  try {
    const existing = await sql<{ generation_config: Record<string, unknown> | null }>`
      SELECT generation_config FROM program_versions WHERE id = ${AI_VERSION_ID}::uuid
    `.execute(db).then(r => r.rows[0]);

    if (!existing) {
      console.log(`  ⚠️  AI program version ${AI_VERSION_ID} not found. Run migrations first.`);
      return;
    }

    const currentConfig = (existing.generation_config ?? {}) as Record<string, unknown>;
    const nextConfig = {
      ...currentConfig,
      formats: [DAILY_MESSAGE_FORMAT, WEEKLY_MESSAGE_FORMAT],
    };

    await sql`
      UPDATE program_versions
      SET generation_config = ${JSON.stringify(nextConfig)}::jsonb
      WHERE id = ${AI_VERSION_ID}::uuid
    `.execute(db);

    console.log(`  ✓ Updated generation_config.formats on AI program version (${AI_VERSION_ID})`);
    console.log(`    - ${DAILY_MESSAGE_FORMAT.title} (${DAILY_MESSAGE_FORMAT.examples.length} examples)`);
    console.log(`    - ${WEEKLY_MESSAGE_FORMAT.title} (${WEEKLY_MESSAGE_FORMAT.examples.length} examples)`);
  } finally {
    await db.destroy();
  }
}

// Allow standalone execution
if (require.main === module) {
  seedAiProgram()
    .then(() => {
      console.log('✅ AI program seed complete!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    });
}
