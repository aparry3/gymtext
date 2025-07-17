import { z } from "zod";

/* ───────────── Helper types ───────────── */
const KeyValuePair = z.object({
  /** Metric or target name (e.g. "totalMileage"). */
  key: z.string().describe("Metric / target field name"),
  /** Numeric value attached to the key. */
  value: z.number().describe("Numeric value for the key")
}).strict().describe("Generic key–value holder for numeric metrics.");

/* ───────────── Leaf objects ───────────── */
const WorkoutBlock = z.object({
  label: z.string().describe("Name of the block (e.g. Warm-up)"),
  activities: z.array(z.string())
               .describe("Ordered list of exercise descriptions")
}).strict().describe("Grouping of exercises within a workout.");

const WorkoutInstance = z.object({
  id: z.string().describe("Workout UUID / slug"),
  date: z.string().describe("Planned date YYYY-MM-DD"),
  sessionType: z.enum(["run","lift","metcon","mobility","rest","other"])
               .describe("Primary modality"),
  blocks: z.array(WorkoutBlock).min(1)
          .describe("Sequential blocks in the workout"),
  /** Flexible numeric targets, now encoded as KV array for Gemini safety. */
  targets: z.array(KeyValuePair)
            .describe("Numeric targets such as distanceKm, volumeKg")
            .optional()
}).strict().describe("Concrete workout delivered to the athlete.");

/* ───────────── Planning helpers ───────────── */
const WeeklyTarget = z.object({
    weekOffset: z.number().int()
                 .describe("0-based index inside the mesocycle"),
    /* NEW */
    split: z.string().optional().describe(
      "Text blueprint of the Mon-Sun pattern for this week, " +
      "e.g. 'UL-Lower-HIIT-Rest' or 'Tempo-Strength-Easy-Long'"
    ),
  
    /* existing numeric targets (all still optional) */
    totalMileage:       z.number().optional()
                         .describe("Planned weekly mileage"),
    longRunMileage:     z.number().optional()
                         .describe("Distance of the long run"),
    avgIntensityPct1RM: z.number().optional()
                         .describe("Average main-lift intensity (%1RM)"),
    totalSetsMainLifts: z.number().optional()
                         .describe("Total working sets on compound lifts"),
    deload:             z.boolean().optional()
                         .describe("True if this is a deload week")
  }).strict().describe(
    "Numeric and structural targets for a single week inside a mesocycle."
  );
/* ───────────── Structural layers ───────────── */
const Microcycle = z.object({
  weekNumber: z.number().int()
               .describe("Human-friendly week number"),
  /** Weekly totals or logged actuals, now Gemini-friendly KV array. */
  metrics: z.array(KeyValuePair)
            .describe("Logged or planned totals for the week")
            .optional(),
  workouts: z.array(WorkoutInstance).min(1)
            .describe("Workouts scheduled for this week")
}).strict().describe("Seven-day training block.");

const MesocyclePlan = z.object({
  id: z.string().describe("Mesocycle identifier"),
  phase: z.string().describe("Training phase label"),
  weeks: z.number().int().describe("Duration in weeks"),
  weeklyTargets: z.array(WeeklyTarget).min(1)
                 .describe("Progression targets per week"),
}).strict().describe("High-level mesocycle plan without detailed workouts.");

const MesocycleDetailed = z.object({
  id: z.string().describe("Mesocycle identifier"),
  phase: z.string().describe("Training phase label"),
  weeks: z.number().int().describe("Duration in weeks"),
  weeklyTargets: z.array(WeeklyTarget).min(1)
                 .describe("Progression targets per week"),
  microcycles: z.array(Microcycle).min(1)
                .describe("Detailed weekly workout plans")
}).strict().describe("Complete mesocycle with all workout details.");

// Legacy type for backward compatibility
const Mesocycle = z.object({
  id: z.string().describe("Mesocycle identifier"),
  phase: z.string().describe("Training phase label"),
  weeks: z.number().int().describe("Duration in weeks"),
  weeklyTargets: z.array(WeeklyTarget).min(1)
                 .describe("Progression targets per week"),
  microcycles: z.array(Microcycle)
                .describe("Weekly workout plans")
                .optional() // Optional for backward compatibility
}).strict().describe("Block of several weeks focused on one quality.");

const Macrocycle = z.object({
  id: z.string().describe("Macrocycle identifier"),
  startDate: z.string().optional()
             .describe("Optional start date YYYY-MM-DD"),
  lengthWeeks: z.number().int()
                .describe("Total weeks in macrocycle"),
  mesocycles: z.array(MesocyclePlan).min(1)
               .describe("Sequential mesocycle plans")
}).strict().describe("Top-level goal window with mesocycle plans.");

/** 🔸 TOP-LEVEL PROGRAM with embedded overview 🔸 */
export const FitnessProgramSchema = z.object({
    /** Friendly natural-language summary of the macrocycle. */
    overview: z.string().describe(
      "Motivating plain-English summary of the upcoming macrocycle."
    ),
  
    /** Stable identifier for storage / look-ups. */
    programId: z.string().describe("Program identifier (slug, UUID, etc.)."),
  
    /** Drives which weeklyTargets numbers are relevant. */
    programType: z.enum([
      "endurance", "strength", "shred", "hybrid", "rehab", "other"
    ]).describe("Main training style of the program."),
  
    /** Sequential macrocycles (usually one for onboarding flows). */
    macrocycles: z.array(Macrocycle).min(1)
      .describe("Ordered macrocycles forming the complete program.")
  }).strict().describe(
    "Complete periodised training program with an embedded plain-text overview."
  );
  
export const WorkoutInstanceSchema = WorkoutInstance;

// Export types for use in other modules
export type MesocyclePlan = z.infer<typeof MesocyclePlan>;
export type MesocycleDetailed = z.infer<typeof MesocycleDetailed>;
export type Mesocycle = z.infer<typeof Mesocycle>;
export type Microcycle = z.infer<typeof Microcycle>;
export type WorkoutInstance = z.infer<typeof WorkoutInstance>;
export type WeeklyTarget = z.infer<typeof WeeklyTarget>;
export type FitnessProgram = z.infer<typeof FitnessProgramSchema>;
// Define the Microcycles schema for structured output
export const MicrocyclesSchema = z.array(Microcycle).min(1);

