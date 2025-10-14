import { z } from "zod";

// Long-form workout schema for step 1 of workout generation
export const LongFormWorkoutSchema = z.object({
  description: z.string().describe("Detailed long-form description of the workout including all exercises, sets, reps, supersets, and structure"),
  reasoning: z.string().describe("Comprehensive explanation of all coaching decisions: why exercises were chosen, how they relate to user's goals/plan/profile/constraints, progressive overload strategy, and any modifications made")
}).strict();

export type LongFormWorkout = z.infer<typeof LongFormWorkoutSchema>;

// Enhanced workout schema components
export const _WorkoutBlockItemSchema = z.object({
  type: z.enum(['prep', 'compound', 'secondary', 'accessory', 'core', 'cardio', 'cooldown'])
    .describe("Type of exercise in the workout"),
  exercise: z.string().describe("Specific, actionable exercise name that a user can immediately perform (e.g., 'Band Pull-Aparts', 'Cat-Cow Stretch', 'Scapular Wall Slides'). Never use vague terms like 'mobility sequence' or 'dynamic warmup'."),
  sets: z.number().nullable().optional().describe("Number of sets"),
  reps: z.string().nullable().optional().describe("Number of reps (can be range like '6-8' or number like '10')"),
  durationSec: z.number().nullable().optional().describe("Duration in seconds"),
  durationMin: z.number().nullable().optional().describe("Duration in minutes"),
  RPE: z.number().min(1).max(10).nullable().optional().describe("Rate of Perceived Exertion (1-10)"),
  percentageRM: z.number().min(0).max(100).nullable().optional().describe("Percentage of 1 Rep Max"),
  rest: z.string().nullable().optional().describe("Rest period between sets"),
  notes: z.string().nullable().optional().describe("Additional notes for the exercise")
}).strict();

export const _WorkoutBlockSchema = z.object({
  name: z.string().describe("Name of the workout block (e.g., 'Warm-up', 'Main', 'Accessory')"),
  items: z.array(_WorkoutBlockItemSchema).describe("Exercises in this block")
}).strict();

export const _WorkoutModificationSchema = z.object({
  condition: z.string().describe("Condition that triggers this modification (e.g., 'injury.lower_back.active')"),
  replace: z.object({
    exercise: z.string().describe("Exercise to replace"),
    with: z.string().describe("Replacement exercise")
  }).nullable().optional(),
  adjustment: z.string().nullable().optional().describe("Adjustment to make (e.g., 'reduce weight by 20%')"),
  note: z.string().describe("Explanation for the modification")
}).strict();

// Enhanced workout instance schema
export const _EnhancedWorkoutInstanceSchema = z.object({
  theme: z.string().describe("Overall theme of the workout (e.g., 'Upper Push', 'Lower Power')"),
  blocks: z.array(_WorkoutBlockSchema).describe("Structured blocks of the workout"),
  modifications: z.array(_WorkoutModificationSchema).nullable().optional().describe("Modifications for special conditions"),
  targetMetrics: z.object({
    totalVolume: z.number().nullable().optional(),
    totalDistance: z.number().nullable().optional(),
    totalDuration: z.number().nullable().optional(),
    averageIntensity: z.number().nullable().optional()
  }).nullable().optional().describe("Target metrics for the workout"),
  notes: z.string().nullable().optional().describe("Additional notes for the workout")
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

export type LLMWorkoutInstance = z.infer<typeof _WorkoutInstanceSchema>;
export type WorkoutBlockItem = z.infer<typeof _WorkoutBlockItemSchema>;
export type WorkoutBlock = z.infer<typeof _WorkoutBlockSchema>;
export type WorkoutModification = z.infer<typeof _WorkoutModificationSchema>;
export type EnhancedWorkoutInstance = z.infer<typeof _EnhancedWorkoutInstanceSchema> & { date: Date };
export type UpdatedWorkoutInstance = z.infer<typeof _UpdatedWorkoutInstanceSchema> & { date: Date };