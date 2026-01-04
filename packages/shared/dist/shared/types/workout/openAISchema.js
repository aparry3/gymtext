import { z } from "zod";
/* ────────────────────────────────
   Lowest-level: individual exercise
────────────────────────────────── */
export const _WorkoutBlockItemSchema = z.object({
    type: z.enum(['prep', 'compound', 'secondary', 'accessory', 'core', 'cardio', 'cooldown'])
        .describe("Category of the movement or its role in the session."),
    exercise: z.string().describe("Explicit exercise name (e.g., 'Barbell Back Squat')."),
    sets: z.number().nullish().describe("Number of sets."),
    reps: z.string().nullish().describe("Reps (can be a range or a single value)."),
    durationSec: z.number().nullish().describe("Exercise duration in seconds."),
    durationMin: z.number().nullish().describe("Exercise duration in minutes."),
    RPE: z.number().min(1).max(10).nullish().describe("Rate of Perceived Exertion 1–10."),
    rir: z.number().nullish().describe("Reps in Reserve (autoregulation measure)."),
    percentageRM: z.number().min(0).max(100).nullish().describe("Percent of 1RM load."),
    restSec: z.number().nullish().describe("Rest between sets in seconds."),
    restText: z.string().nullish().describe("Readable rest instruction, e.g. '90s between supersets'."),
    equipment: z.string().nullish().describe("Equipment used (barbell, DB, band, etc.)."),
    pattern: z.string().nullish().describe("Movement pattern label (e.g., 'horizontal_press')."),
    tempo: z.string().nullish().describe("Tempo prescription, e.g. '3-1-1'."),
    cues: z.array(z.string()).nullish().describe("Key coaching cues."),
    tags: z.array(z.string()).nullish().describe("Semantic tags for filtering/substitution."),
    notes: z.string().nullish().describe("Extra details or special instructions.")
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
    restBetweenExercisesSec: z.number().nullish()
        .describe("Rest between exercises inside the superset/circuit."),
    restAfterSetSec: z.number().nullish()
        .describe("Rest between rounds or sets of this work item."),
    rounds: z.number().nullish().describe("Number of times the group is repeated (for circuits)."),
    notes: z.string().nullish().describe("Extra details about the grouping.")
}).strict();
/* ────────────────────────────────
   Block level: a section of the workout
────────────────────────────────── */
export const _WorkoutBlockSchema = z.object({
    name: z.string().describe("Name of the workout block (e.g., 'Warm-Up', 'Main Lift')."),
    goal: z.string().nullish().describe("Purpose of this block."),
    durationMin: z.number().nullish().describe("Estimated duration in minutes."),
    notes: z.string().nullish().describe("General notes for this block."),
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
    }).nullish(),
    adjustment: z.string().nullish().describe("Other adjustments (e.g., reduce weight 20%)."),
    note: z.string().describe("Reason or context for this modification.")
}).strict();
/* ────────────────────────────────
   Optional metadata/context about the session
────────────────────────────────── */
export const _WorkoutSessionContextSchema = z.object({
    phaseName: z.string().nullish(),
    weekNumber: z.number().nullish(),
    dayIndex: z.number().nullish(),
    goal: z.string().nullish(),
    durationEstimateMin: z.number().nullish(),
    environment: z.string().nullish(),
    clientConstraints: z.object({
        timeAvailable: z.number().nullish(),
        equipmentAvailable: z.array(z.string()).nullish(),
        injuries: z.array(z.string()).nullish(),
        preferences: z.array(z.string()).nullish()
    }).nullish()
}).nullish();
/* ────────────────────────────────
   Target metrics for analytics or progress
────────────────────────────────── */
export const _WorkoutTargetMetricsSchema = z.object({
    totalVolume: z.number().nullish(),
    totalReps: z.number().nullish(),
    totalSets: z.number().nullish(),
    totalDuration: z.number().nullish(),
    averageRPE: z.number().nullish(),
    averageIntensity: z.number().nullish()
}).nullish();
/* ────────────────────────────────
   Summary / meta reflections
────────────────────────────────── */
export const _WorkoutSummarySchema = z.object({
    adaptations: z.array(z.string()).nullish(),
    coachingNotes: z.string().nullish(),
    progressionNotes: z.string().nullish(),
    recoveryFocus: z.string().nullish()
}).nullish();
/* ────────────────────────────────
   Full enhanced workout instance
────────────────────────────────── */
export const _EnhancedWorkoutInstanceSchema = z.object({
    theme: z.string().describe("Theme of the workout (e.g., 'Upper Push', 'Lower Power')."),
    sessionContext: _WorkoutSessionContextSchema,
    blocks: z.array(_WorkoutBlockSchema),
    modifications: z.array(_WorkoutModificationSchema).nullish(),
    targetMetrics: _WorkoutTargetMetricsSchema,
    summary: _WorkoutSummarySchema,
    notes: z.string().nullish()
}).strict();
// Updated workout instance schema with modifications tracking
export const _UpdatedWorkoutInstanceSchema = _EnhancedWorkoutInstanceSchema.extend({
    modificationsApplied: z.array(z.string()).describe("List of specific changes made to the workout (e.g., 'Replaced Barbell Bench Press with Dumbbell Bench Press due to no barbell available')")
}).strict();
// Legacy schema for backward compatibility
export const _WorkoutInstanceSchema = z.object({
    sessionType: z.enum(["run", "lift", "metcon", "mobility", "rest", "other"]).describe("Primary modality"),
    details: z.array(z.object({
        label: z.string().describe("Name of the block (e.g. Warm-up)"),
        activities: z.array(z.string()).describe("Ordered list of exercise descriptions")
    }).strict()).min(1).describe("Sequential blocks in the workout"),
    targets: z.array(z.object({
        key: z.string().describe("Metric / target field name"),
        value: z.number().describe("Numeric value for the key")
    }).strict()).describe("Numeric targets such as distanceKm, volumeKg")
        .nullish()
}).strict();
