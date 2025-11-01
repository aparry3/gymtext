import { z } from "zod";

// Long-form workout schema for step 1 of workout generation
export const LongFormWorkoutSchema = z.object({
  workout: z.string().describe("Detailed long-form description of the workout including all exercises, sets, reps, supersets, and structure"),
  reasoning: z.string().describe("Comprehensive explanation of all coaching decisions: why exercises were chosen, how they relate to user's goals/plan/profile/constraints, progressive overload strategy, and any modifications made")
}).strict();

export type LongFormWorkout = z.infer<typeof LongFormWorkoutSchema>;

/* ────────────────────────────────
   Lowest-level: individual exercise
────────────────────────────────── */
export const _WorkoutBlockItemSchema = z.object({
  type: z.enum(['prep', 'compound', 'secondary', 'accessory', 'core', 'cardio', 'cooldown'])
    .describe("Category of the movement or its role in the session."),
  exercise: z.string().describe("Explicit exercise name (e.g., 'Barbell Back Squat')."),
  sets: z.number().nullable().optional().describe("Number of sets."),
  reps: z.string().nullable().optional().describe("Reps (can be a range or a single value)."),
  durationSec: z.number().nullable().optional().describe("Exercise duration in seconds."),
  durationMin: z.number().nullable().optional().describe("Exercise duration in minutes."),
  RPE: z.number().min(1).max(10).nullable().optional().describe("Rate of Perceived Exertion 1–10."),
  rir: z.number().nullable().optional().describe("Reps in Reserve (autoregulation measure)."),
  percentageRM: z.number().min(0).max(100).nullable().optional().describe("Percent of 1RM load."),
  restSec: z.number().nullable().optional().describe("Rest between sets in seconds."),
  restText: z.string().nullable().optional().describe("Readable rest instruction, e.g. '90s between supersets'."),
  equipment: z.string().nullable().optional().describe("Equipment used (barbell, DB, band, etc.)."),
  pattern: z.string().nullable().optional().describe("Movement pattern label (e.g., 'horizontal_press')."),
  tempo: z.string().nullable().optional().describe("Tempo prescription, e.g. '3-1-1'."),
  cues: z.array(z.string()).nullable().optional().describe("Key coaching cues."),
  tags: z.array(z.string()).nullable().optional().describe("Semantic tags for filtering/substitution."),
  notes: z.string().nullable().optional().describe("Extra details or special instructions.")
}).strict();

/* ────────────────────────────────
   Mid-level: a work item (straight, superset, or circuit)
────────────────────────────────── */
export const _WorkoutWorkItemSchema = z.object({
  structureType: z.enum(['straight', 'superset', 'circuit']).default('straight')
    .describe("Defines how the exercises are grouped."),
  exercises: z.array(_WorkoutBlockItemSchema)
    .min(1)
    .describe("One or more exercises (1 = straight, 2 = superset, 3+ = circuit)."),
  restBetweenExercisesSec: z.number().nullable().optional()
    .describe("Rest between exercises inside the superset/circuit."),
  restAfterSetSec: z.number().nullable().optional()
    .describe("Rest between rounds or sets of this work item."),
  rounds: z.number().nullable().optional().describe("Number of times the group is repeated (for circuits)."),
  notes: z.string().nullable().optional().describe("Extra details about the grouping.")
}).strict();

/* ────────────────────────────────
   Block level: a section of the workout
────────────────────────────────── */
export const _WorkoutBlockSchema = z.object({
  name: z.string().describe("Name of the workout block (e.g., 'Warm-Up', 'Main Lift')."),
  goal: z.string().nullable().optional().describe("Purpose of this block."),
  durationMin: z.number().nullable().optional().describe("Estimated duration in minutes."),
  notes: z.string().nullable().optional().describe("General notes for this block."),
  work: z.array(_WorkoutWorkItemSchema)
    .describe("The list of work items (straight, superset, or circuit) within this block.")
}).strict();

/* ────────────────────────────────
   Modifications (injury/equipment/etc.)
────────────────────────────────── */
export const _WorkoutModificationSchema = z.object({
  condition: z.string().describe("Trigger condition, e.g. 'injury.shoulder.active'."),
  replace: z.object({
    exercise: z.string().describe("Original exercise to replace."),
    with: z.string().describe("Substitute exercise.")
  }).nullable().optional(),
  adjustment: z.string().nullable().optional().describe("Other adjustments (e.g., reduce weight 20%)."),
  note: z.string().describe("Reason or context for this modification.")
}).strict();

/* ────────────────────────────────
   Optional metadata/context about the session
────────────────────────────────── */
export const _WorkoutSessionContextSchema = z.object({
  phaseName: z.string().nullable().optional(),
  weekNumber: z.number().nullable().optional(),
  dayIndex: z.number().nullable().optional(),
  goal: z.string().nullable().optional(),
  durationEstimateMin: z.number().nullable().optional(),
  environment: z.string().nullable().optional(),
  clientConstraints: z.object({
    timeAvailable: z.number().nullable().optional(),
    equipmentAvailable: z.array(z.string()).nullable().optional(),
    injuries: z.array(z.string()).nullable().optional(),
    preferences: z.array(z.string()).nullable().optional()
  }).nullable().optional()
}).nullable().optional();

/* ────────────────────────────────
   Target metrics for analytics or progress
────────────────────────────────── */
export const _WorkoutTargetMetricsSchema = z.object({
  totalVolume: z.number().nullable().optional(),
  totalReps: z.number().nullable().optional(),
  totalSets: z.number().nullable().optional(),
  totalDuration: z.number().nullable().optional(),
  averageRPE: z.number().nullable().optional(),
  averageIntensity: z.number().nullable().optional()
}).nullable().optional();

/* ────────────────────────────────
   Summary / meta reflections
────────────────────────────────── */
export const _WorkoutSummarySchema = z.object({
  adaptations: z.array(z.string()).nullable().optional(),
  coachingNotes: z.string().nullable().optional(),
  progressionNotes: z.string().nullable().optional(),
  recoveryFocus: z.string().nullable().optional()
}).nullable().optional();

/* ────────────────────────────────
   Full enhanced workout instance
────────────────────────────────── */
export const _EnhancedWorkoutInstanceSchema = z.object({
  theme: z.string().describe("Theme of the workout (e.g., 'Upper Push', 'Lower Power')."),
  sessionContext: _WorkoutSessionContextSchema,
  blocks: z.array(_WorkoutBlockSchema),
  modifications: z.array(_WorkoutModificationSchema).nullable().optional(),
  targetMetrics: _WorkoutTargetMetricsSchema,
  summary: _WorkoutSummarySchema,
  notes: z.string().nullable().optional()
}).strict();


// Updated workout instance schema with modifications tracking
export const _UpdatedWorkoutInstanceSchema = _EnhancedWorkoutInstanceSchema.extend({
  modificationsApplied: z.array(z.string()).describe("List of specific changes made to the workout (e.g., 'Replaced Barbell Bench Press with Dumbbell Bench Press due to no barbell available')")
}).strict();

// Legacy schema for backward compatibility
export const _WorkoutInstanceSchema = z.object({
  sessionType: z.enum(["run","lift","metcon","mobility","rest","other"]).describe("Primary modality"),
  details: z.array(
    z.object({
      label: z.string().describe("Name of the block (e.g. Warm-up)"),
      activities: z.array(z.string()).describe("Ordered list of exercise descriptions")
    }).strict()
  ).min(1).describe("Sequential blocks in the workout"),

  targets: z.array(
    z.object({
      key: z.string().describe("Metric / target field name"),
      value: z.number().describe("Numeric value for the key")
    }).strict()
  ).describe("Numeric targets such as distanceKm, volumeKg")
   .nullable().optional()
}).strict()

export type WorkoutBlockItem = z.infer<typeof _WorkoutBlockItemSchema>;
export type WorkoutBlock = z.infer<typeof _WorkoutBlockSchema>;
export type WorkoutModification = z.infer<typeof _WorkoutModificationSchema>;
export type EnhancedWorkoutInstance = z.infer<typeof _EnhancedWorkoutInstanceSchema> & { date: Date };
export type UpdatedWorkoutInstance = z.infer<typeof _UpdatedWorkoutInstanceSchema> & { date: Date };