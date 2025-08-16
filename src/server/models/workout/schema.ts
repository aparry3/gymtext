import { z } from "zod";

// Enhanced workout schema components
export const _WorkoutBlockItemSchema = z.object({
  type: z.enum(['prep', 'compound', 'secondary', 'accessory', 'core', 'cardio', 'cooldown'])
    .describe("Type of exercise in the workout"),
  exercise: z.string().describe("Name of the exercise"),
  sets: z.number().optional().describe("Number of sets"),
  reps: z.string().optional().describe("Number of reps (can be range like '6-8' or number like '10')"),
  durationSec: z.number().optional().describe("Duration in seconds"),
  durationMin: z.number().optional().describe("Duration in minutes"),
  RPE: z.number().min(1).max(10).optional().describe("Rate of Perceived Exertion (1-10)"),
  percentageRM: z.number().min(0).max(100).optional().describe("Percentage of 1 Rep Max"),
  rest: z.string().optional().describe("Rest period between sets"),
  notes: z.string().optional().describe("Additional notes for the exercise")
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
  }).optional(),
  adjustment: z.string().optional().describe("Adjustment to make (e.g., 'reduce weight by 20%')"),
  note: z.string().describe("Explanation for the modification")
}).strict();

// Enhanced workout instance schema
export const _EnhancedWorkoutInstanceSchema = z.object({
  date: z.date().describe("Date of the workout"),
  theme: z.string().describe("Overall theme of the workout (e.g., 'Upper Push', 'Lower Power')"),
  blocks: z.array(_WorkoutBlockSchema).describe("Structured blocks of the workout"),
  modifications: z.array(_WorkoutModificationSchema).optional().describe("Modifications for special conditions"),
  targetMetrics: z.object({
    totalVolume: z.number().optional(),
    totalDistance: z.number().optional(),
    totalDuration: z.number().optional(),
    averageIntensity: z.number().optional()
  }).optional().describe("Target metrics for the workout"),
  notes: z.string().optional().describe("Additional notes for the workout")
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
   .optional()
}).strict()

export type LLMWorkoutInstance = z.infer<typeof _WorkoutInstanceSchema>;
export type WorkoutBlockItem = z.infer<typeof _WorkoutBlockItemSchema>;
export type WorkoutBlock = z.infer<typeof _WorkoutBlockSchema>;
export type WorkoutModification = z.infer<typeof _WorkoutModificationSchema>;
export type EnhancedWorkoutInstance = z.infer<typeof _EnhancedWorkoutInstanceSchema>;