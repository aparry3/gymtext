/**
 * Seed Prompts
 *
 * Seeds prompts table with default system prompts.
 * Uses upsert - idempotent (safe to run multiple times).
 *
 * Run: pnpm seed:prompts
 */

import 'dotenv/config';
import { Pool } from 'pg';

const DEFAULT_PROMPTS = [
  {
    key: 'TRAINING_FORMAT',
    content: `A) TRAINING
- Allowed section headers (0-2, in this order if present):
  Workout:
  Conditioning:
- ALWAYS omit warmup and cooldown.
- Each item is a bullet starting with "- ".
- Use standard exercise formatting.
- Training: "- BB Bench Press: 4x8-10"
- Abbreviations: Barbell -> BB, Dumbbell -> DB, Overhead Press -> OHP, Romanian Deadlift -> RDL, Single-Leg -> SL
- Supersets use "SS1", "SS2".
- Circuits use "C1", "C2".`,
    description: 'Format instructions for training days',
    category: 'format',
    is_active: true,
  },
  {
    key: 'ACTIVE_RECOVERY_FORMAT',
    content: `B) ACTIVE_RECOVERY (CRITICAL - NO HEADERS)
- DO NOT use any section headers ("Workout:", "Optional:", etc.).
- Output EXACTLY 1-2 bullet lines total.
- Bullets must be:
  - Simple
  - Non-prescriptive
  - Constraint-based (time + easy effort)

Required first bullet:
- Easy activity with duration and non-exhaustive examples.

Exact format:
- "- Easy activity: ~30m (walk, bike, jog, row, swim, etc.)"

Optional second bullet (if stretching or mobility is mentioned in source):
- Keep it supportive, not instructional.
- Do NOT list specific stretches.
- Do NOT imply requirement.

Allowed format:
- "- Stretching: 5-10m (let me know if you need stretches)"

Avoid for ACTIVE_RECOVERY:
- Section headers
- Checklists
- Multiple activity bullets
- Listing individual mobility movements
- Language implying obligation

ACTIVE_RECOVERY reads as permissive, not prescriptive.`,
    description: 'Format instructions for active recovery days',
    category: 'format',
    is_active: true,
  },
  {
    key: 'REST_FORMAT',
    content: `C) REST
- No section headers.
- Output at most 1 bullet line.
- Gentle, optional movement only.

Example:
- "- Optional easy walk: 5-15m"`,
    description: 'Format instructions for rest days',
    category: 'format',
    is_active: true,
  },
  {
    key: 'BEGINNER_MICROCYCLE_SNIPPET',
    content: `- Use **simple, everyday language only**.
  - Say **"building strength"** and **"building muscle/size"** instead of hypertrophy.
  - Say **"slowly getting stronger week to week"** instead of progressive overload.
- Keep weekly structure **simple and repetitive**.
  - Favor full-body, upper/lower, or very simple splits.
  - Avoid hybrid or multi-focus splits unless explicitly requested.
- Emphasize **learning movement patterns**, not chasing numbers.
- Prioritize **main compound lifts**:
  - Squat or leg press
  - Hinge (deadlift or hip hinge)
  - Push (bench / push-up / machine press)
  - Pull (row / lat pulldown)
- Limit total weekly exercise variety.
  - Avoid specialty bars, complex variations, unilateral overload, or stability-focused movements.
- Progress conservatively:
  - Small weight increases or 1 extra rep *only if all reps feel controlled*.
- Avoid phases, blocks, deload terminology, or conditioning zones.
- Cardio is described as **"easy cardio"** or **"short conditioning"**, not Zone 2 or intervals.`,
    description: 'Beginner-level microcycle (weekly) instructions',
    category: 'level_specific',
    is_active: true,
  },
  {
    key: 'BEGINNER_WORKOUT_SNIPPET',
    content: `- Write workouts like **a coach standing next to the lifter**.
- Focus on:
  - Sets
  - Reps
  - Rest time
  - How hard the set should feel
- Use effort cues such as:
  - "You should feel like you could do 1-3 more reps"
  - "Stop the set if your form breaks down"
- Avoid:
  - RIR / RPE
  - Tempo notation
  - Percentages of max
  - Advanced intensity techniques
- Structure each workout as:
  - 1 main lift
  - 1-2 supporting lifts
  - 1-2 simple accessories (optional)
- Include brief setup and form cues.
- Encourage confidence, consistency, and habit-building over optimization.`,
    description: 'Beginner-level workout instructions',
    category: 'level_specific',
    is_active: true,
  },
  {
    key: 'INTERMEDIATE_MICROCYCLE_SNIPPET',
    content: `- Use **mostly plain language**, with light exposure to standard training terms.
  - "Muscle growth (hypertrophy)" may appear once, then simplified afterward.
- Allow more structure and variety while staying readable.
- Weekly split can include:
  - Upper / Lower
  - Push / Pull / Legs
  - Simple strength + muscle-building hybrids
- Clearly state the **purpose of each day**:
  - Strength-focused
  - Muscle-building
  - Conditioning or recovery
- Introduce basic progression strategies:
  - Adding reps within a range
  - Small load increases
- Manage fatigue without heavy theory.
  - Occasional lighter weeks are implied, not over-explained.
- Conditioning may reference effort levels, but avoid technical zones unless requested.`,
    description: 'Intermediate-level microcycle (weekly) instructions',
    category: 'level_specific',
    is_active: true,
  },
  {
    key: 'INTERMEDIATE_WORKOUT_SNIPPET',
    content: `- Exercises can include:
  - Secondary variations
  - Targeted accessories (rear delts, hamstrings, calves, arms)
- Supersets and pairings are allowed when they improve efficiency.
- Effort guidance may include optional clarification:
  - "Add 1-2 reps if it feels easy"
  - "Rest an extra 30 seconds if needed"
- Include setup cues for key exercises.
- Progress is encouraged but not required every session.
- Suggest optional challenges for advanced users.`,
    description: 'Intermediate-level workout instructions',
    category: 'level_specific',
    is_active: true,
  },
  {
    key: 'ADVANCED_MICROCYCLE_SNIPPET',
    content: `- Use appropriate technical terminology.
- Advanced programming concepts allowed:
  - Block periodization
  - Wave loading
  - Accumulation/transmutation blocks
  - Deload weeks with specific parameters
- Multiple training phases within a mesocycle allowed.
- Conditioning can include:
  - Zone 2 cardio
  - HIIT intervals
  - Strongman/conditioning work
- Recovery modalities can be mentioned:
  - Massage
  - Stretching protocols
  - Cold exposure
- Periodization should be explained when relevant.`,
    description: 'Advanced-level microcycle (weekly) instructions',
    category: 'level_specific',
    is_active: true,
  },
  {
    key: 'ADVANCED_WORKOUT_SNIPPET',
    content: `- Full exercise selection available:
  - All variations and progressions
  - Advanced intensity techniques (rest-pause, DC, drop sets)
  - Unilateral exercises with load
- Complex structuring allowed:
  - Multiple supersets
  - Circuits
  - Complex pairings
- RIR/RPE guidance appropriate.
- Technical cues for complex movements.
- Competition prep considerations when relevant.
- Recovery recommendations between sessions.`,
    description: 'Advanced-level workout instructions',
    category: 'level_specific',
    is_active: true,
  },
  {
    key: 'WORKOUT_STRUCTURE',
    content: `Structure each workout as follows:

1. **Main Lift** (strength focus): 3-5 sets, 3-8 reps
2. **Secondary Lift** (hypertrophy/strength): 3-4 sets, 6-12 reps  
3. **Accessory Work** (volume): 2-3 sets, 8-15 reps
4. **Optional Finisher**: 1-2 sets to failure

For each exercise include:
- Sets x Reps
- Rest period
- Key cue for form`,
    description: 'Default workout structure template',
    category: 'structure',
    is_active: true,
  },
  {
    key: 'PROGRESSION_GUIDANCE',
    content: `Progression should be gradual and sustainable:

**If user hit all reps comfortably:**
- Increase weight by 2.5-5 lbs next time, OR
- Add 1 rep per set

**If user struggled to hit reps:**
- Keep same weight
- Focus on form
- Try to add 1 rep next session

**If user failed completely:**
- Drop weight by 10%
- Rebuild from there`,
    description: 'Default progression guidelines',
    category: 'guidance',
    is_active: true,
  },
];

export async function seedPrompts(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.SANDBOX_DATABASE_URL,
  });

  try {
    console.log('Seeding prompts...');

    // Check if prompts table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'prompts'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  prompts table does not exist. Run migrations first.');
      return;
    }

    for (const prompt of DEFAULT_PROMPTS) {
      await pool.query(
        `
        INSERT INTO prompts (key, content, description, category, is_active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (key) DO UPDATE SET
          content = EXCLUDED.content,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()
        `,
        [prompt.key, prompt.content, prompt.description, prompt.category, prompt.is_active]
      );
      console.log(`  ✓ ${prompt.key}`);
    }

    console.log(`✅ Seeded ${DEFAULT_PROMPTS.length} prompts`);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedPrompts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
