import { z } from "zod";

/**
 * Workout Structure Schemas
 *
 * These schemas define the structured workout format used for:
 * - LLM-generated workout outputs
 * - UI rendering of workout details
 * - Storing structured workout data
 */

/**
 * Intensity descriptor for exercises
 * Default values used to ensure no nulls reach the UI.
 */
export const IntensitySchema = z.object({
  type: z.enum(["RPE", "RIR", "Percentage", "Zone", "HeartRate", "Pace", "Other"]).default("Other"),
  value: z.string().describe("e.g., '7-8', '2', '75%', 'Zone 2', '150bpm'").default(''),
  description: z.string().describe("Context for the user").default('')
});

/**
 * Individual workout activity/exercise
 * Flexible schema for Lifting, Cardio, and Hybrid sessions.
 */
export const WorkoutActivitySchema = z.object({
  id: z.string().default(''),
  name: z.string().describe("e.g. 'Back Squat' or 'Zone 2 Run'"),
  type: z.enum(["Strength", "Cardio", "Plyometric", "Mobility", "Rest", "Other"]).default("Strength"),

  // Metrics (Strings used for flexibility: "4", "3-4", "AMRAP")
  sets: z.string().describe("e.g. '4' or '3-4'").default(''),
  reps: z.string().describe("e.g. '6-8' or '4 min'").default(''),

  // Cardio/Duration Specific
  duration: z.string().describe("e.g. '45 min'").default(''),
  distance: z.string().describe("e.g. '5km'").default(''),

  // Common
  rest: z.string().describe("e.g. '2-3 min'").default(''),
  intensity: IntensitySchema.default({ type: "Other", value: "", description: "" }),
  tempo: z.string().describe("e.g. '3-0-1'").default(''),

  // Execution & Grouping
  notes: z.string().describe("Execution cues").default(''),
  tags: z.array(z.string()).default([]),
  supersetId: z.string().default('')
});

/**
 * Section of a workout (e.g., Warm Up, Main Lift, Cooldown)
 */
export const WorkoutSectionSchema = z.object({
  title: z.string().describe("e.g. 'Warm Up', 'Main Lift'"),
  overview: z.string().describe("Brief goal of this section").default(''),
  exercises: z.array(WorkoutActivitySchema).default([])
});

/**
 * Complete workout structure
 */
export const WorkoutStructureSchema = z.object({
  title: z.string().describe("Concise workout name, 2-4 words max (e.g. 'Pull A', 'Upper Strength', 'Leg Day')"),
  focus: z.string().describe("Brief focus area, 1-3 words (e.g. 'Back & Biceps', 'Quads', 'Push')").default(''),
  description: z.string().default(''),

  // Optional flair
  quote: z.object({
    text: z.string().default(''),
    author: z.string().default('')
  }).default({ text: '', author: '' }),

  // The actual programming
  sections: z.array(WorkoutSectionSchema).default([]),

  // Metadata
  estimatedDurationMin: z.number().describe("Estimated minutes").default(-1),
  intensityLevel: z.enum(["Low", "Moderate", "High", "Severe"]).default("Moderate")
});

// Inferred types
export type WorkoutStructure = z.infer<typeof WorkoutStructureSchema>;
export type WorkoutActivity = z.infer<typeof WorkoutActivitySchema>;
export type WorkoutSection = z.infer<typeof WorkoutSectionSchema>;
export type Intensity = z.infer<typeof IntensitySchema>;
