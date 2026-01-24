/**
 * Seed Exercises
 *
 * Uses GPT-5.2 with structured output to generate a comprehensive exercise database.
 * Exercises are generated in batches of 20, organized by category/activity type.
 * Results are written to exercises.json at the project root.
 *
 * Categories run in parallel; batches within each category run sequentially.
 * Progress is saved after each batch so interrupted runs can resume.
 *
 * Usage:
 *   source .env.local && npx tsx scripts/seed-exercises.ts
 *
 * Requires:
 *   - OPENAI_API_KEY environment variable
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CategoryConfig {
  type: string;
  label: string;
  focus: string;
  batchCount: number;
}

interface Exercise {
  name: string;
  slug: string;
  status: string;
  type: string;
  mechanics: string;
  kinetic_chain: string;
  press_plane: string;
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
}

interface ExerciseOutput {
  exercises: Exercise[];
}

// ─── Configuration ───────────────────────────────────────────────────────────

const BATCH_SIZE = 20;
const MAX_RETRIES = 3;
const MODEL = 'gpt-5.2';
const TEMPERATURE = 1;

const CATEGORIES: CategoryConfig[] = [
  { type: 'strength', label: 'Upper Body Push', focus: 'chest, shoulders, triceps pressing', batchCount: 3 },
  { type: 'strength', label: 'Upper Body Pull', focus: 'back, biceps pulling', batchCount: 3 },
  { type: 'strength', label: 'Lower Body', focus: 'squat, hinge, lunge, leg', batchCount: 3 },
  { type: 'strength', label: 'Core & Isolation', focus: 'core stability, isolation', batchCount: 2 },
  { type: 'conditioning', label: 'Conditioning & Cardio', focus: 'metabolic conditioning, HIIT, machines', batchCount: 2 },
  { type: 'conditioning', label: 'Endurance & Cardio', focus: 'running, cycling, rowing, swimming', batchCount: 1 },
  { type: 'mobility', label: 'Mobility & Flexibility', focus: 'stretching, joint mobility', batchCount: 1 },
  { type: 'sport', label: 'Running & Track', focus: 'sprints, drills, distance', batchCount: 1 },
  { type: 'sport', label: 'Basketball', focus: 'agility, plyometrics, court drills', batchCount: 1 },
  { type: 'sport', label: 'Skiing & Winter', focus: 'balance, leg endurance, lateral', batchCount: 1 },
  { type: 'skill', label: 'Calisthenics & Gymnastics', focus: 'bodyweight skills, progressions', batchCount: 1 },
];

const SYSTEM_PROMPT = `You are an expert fitness coach, strength trainer, endurance coach, and exercise taxonomist.

Your job is to generate canonical exercises for a general-purpose fitness database.
Exercises are NOT limited to gym-based movements.

Exercises may include:
- strength training (gym or non-gym)
- cardio and endurance (running, biking, rowing, etc.)
- conditioning
- bodyweight movements
- sport-specific or athletic movements
- outdoor or field-based exercises

As long as the exercise is commonly recognized and used, it is valid.

You MUST strictly follow the provided JSON schema.
This is critical.

OUTPUT REQUIREMENT:
- You MUST generate EXACTLY ${BATCH_SIZE} exercises.
- No more, no fewer.

STRICT OUTPUT RULES:
- Output MUST be valid JSON only.
- Output MUST match the schema exactly.
- Do NOT include explanations, comments, markdown, or extra keys.
- Do NOT invent enum values.
- Do NOT omit any required fields.
- Use empty string "" for string fields that do not apply (e.g. mechanics, press_plane, modality, intensity for exercises where they are irrelevant).
- All arrays must be present, even if empty.
- Do NOT repeat exercises already provided in the input.

EXERCISE SELECTION RULES:
- Generate only widely recognized, mainstream exercises.
- Exercises may be gym-based, outdoor, cardio, endurance, or sport-specific.
- Prefer foundational movements and common variations.
- Avoid obscure, novelty, or highly niche exercises.
- Avoid near-duplicates of existing exercises (e.g. same movement with trivial setup differences).
- Think like a real coach building a comprehensive, general fitness database.

POPULARITY RULES:
- Each exercise must include a popularity score between 0 and 1000.
- Popularity reflects how commonly the exercise is used or known in general fitness.
  - 900–1000: extremely common, foundational exercises
  - 700–899: very common exercises
  - 400–699: common accessories, conditioning, or sport staples
  - 100–399: less common but still recognizable
- Avoid values below 100 unless the exercise is genuinely uncommon.

ALIAS RULES:
- Include realistic alternative names, abbreviations, and spellings.
- Aliases should reflect how real users might type the exercise.
- Do not include aliases that clearly belong to a different exercise.

CLASSIFICATION RULES:
- Correctly assign training_groups, movement_patterns, muscles, equipment, and press_plane when applicable.
- Pressing movements must use press_plane where appropriate.
- Conditioning, cardio, and endurance exercises should use modality and intensity when applicable.
- Sport-specific exercises should still be classified by their primary movement patterns and muscles.
- If a string field does not apply, set it to "" (empty string).
- If an array field does not apply, set it to [] (empty array).

DIVERSITY GUIDANCE:
- Across the ${BATCH_SIZE} exercises, aim for reasonable diversity:
  - push, pull, legs, core, conditioning
  - strength, cardio, endurance, sport-specific
  - barbell, dumbbell, bodyweight, machines, and outdoor modalities
- Do not force diversity at the expense of correctness.

You are generating data for a real production system.
Accuracy, consistency, and realism matter more than creativity.`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OUTPUT_PATH = path.resolve(__dirname, '..', 'exercises.json');

function loadSchema(): Record<string, unknown> {
  const schemaPath = path.resolve(__dirname, '..', 'exercise-schema.json');
  const raw = fs.readFileSync(schemaPath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Recursively strip `default` fields from a JSON schema object.
 * OpenAI strict mode does not support `default`.
 */
function stripDefaults(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(stripDefaults);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key === 'default') continue;
      result[key] = stripDefaults(value);
    }
    return result;
  }
  return obj;
}

function loadExistingExercises(): Exercise[] {
  if (!fs.existsSync(OUTPUT_PATH)) return [];
  try {
    const raw = fs.readFileSync(OUTPUT_PATH, 'utf-8');
    const data = JSON.parse(raw) as ExerciseOutput;
    return data.exercises ?? [];
  } catch {
    return [];
  }
}

function writeExercises(exercises: Exercise[]): void {
  const output: ExerciseOutput = { exercises };
  const tmpPath = OUTPUT_PATH + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(output, null, 2), 'utf-8');
  fs.renameSync(tmpPath, OUTPUT_PATH);
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error('OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: openaiKey });

  // Load and prepare schema for structured output
  const rawSchema = loadSchema();
  const schema = stripDefaults(rawSchema) as Record<string, unknown>;

  // Load existing exercises
  const allExercises: Exercise[] = loadExistingExercises();
  console.log(`Loaded ${allExercises.length} existing exercises`);

  let totalGenerated = 0;
  let totalErrors = 0;

  const totalBatches = CATEGORIES.reduce((sum, c) => sum + c.batchCount, 0);
  let completedBatches = 0;

  async function processCategory(category: CategoryConfig): Promise<void> {
    for (let batch = 0; batch < category.batchCount; batch++) {
      const batchLabel = `[${category.label} ${batch + 1}/${category.batchCount}]`;

      // Get current snapshot of exercise names for dedup
      const existingNames = allExercises.map((e) => e.name).join('\n');

      const userPrompt = `Generate ${BATCH_SIZE} exercises for the category: ${category.label}
Type: ${category.type}
Focus area: ${category.focus}
Batch ${batch + 1} of ${category.batchCount} — generate different exercises for each batch.

EXISTING EXERCISES (do NOT repeat any of these):
${existingNames || '(none yet)'}`;

      let success = false;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await openai.chat.completions.create({
            model: MODEL,
            temperature: TEMPERATURE,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userPrompt },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'ExerciseOutput',
                strict: true,
                schema,
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content) {
            throw new Error('Empty response from API');
          }

          const parsed = JSON.parse(content) as ExerciseOutput;
          if (!Array.isArray(parsed.exercises)) {
            throw new Error('Response missing exercises array');
          }

          // Deduplicate against existing exercises
          const existingSlugs = new Set(allExercises.map((e) => e.slug.toLowerCase()));
          const existingNameSet = new Set(allExercises.map((e) => e.name.toLowerCase()));

          const newExercises: Exercise[] = [];
          for (const exercise of parsed.exercises) {
            const slug = exercise.slug || slugify(exercise.name);
            exercise.slug = slug;

            if (existingSlugs.has(slug.toLowerCase())) continue;
            if (existingNameSet.has(exercise.name.toLowerCase())) continue;

            existingSlugs.add(slug.toLowerCase());
            existingNameSet.add(exercise.name.toLowerCase());
            newExercises.push(exercise);
          }

          // Append to shared array
          allExercises.push(...newExercises);
          totalGenerated += newExercises.length;

          // Write progress
          writeExercises(allExercises);

          completedBatches++;
          console.log(
            `${batchLabel} +${newExercises.length} exercises (${parsed.exercises.length - newExercises.length} dupes skipped) | Total: ${allExercises.length} | Progress: ${completedBatches}/${totalBatches}`
          );

          success = true;
          break;
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error(`${batchLabel} Attempt ${attempt}/${MAX_RETRIES} failed: ${errMsg}`);
          if (attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt) * 1000;
            await sleep(delay);
          }
        }
      }

      if (!success) {
        console.error(`${batchLabel} FAILED after ${MAX_RETRIES} attempts, skipping`);
        totalErrors++;
        completedBatches++;
      }
    }
  }

  // Process all categories in parallel
  console.log(`\nStarting generation: ${totalBatches} batches across ${CATEGORIES.length} categories\n`);
  await Promise.all(CATEGORIES.map((category) => processCategory(category)));

  // Final write
  writeExercises(allExercises);

  console.log(`\n── Summary ──`);
  console.log(`Total exercises: ${allExercises.length}`);
  console.log(`Generated this run: ${totalGenerated}`);
  console.log(`Failed batches: ${totalErrors}`);

  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
