import { z } from "zod";

/**
 * SHARED PRIMITIVES
 * Default values used to ensure no nulls reach the UI.
 */
export const IntensitySchema = z.object({
  type: z.enum(["RPE", "RIR", "Percentage", "Zone", "HeartRate", "Pace", "Other"]).default("Other"),
  value: z.string().describe("e.g., '7-8', '2', '75%', 'Zone 2', '150bpm'").default(''),
  description: z.string().describe("Context for the user").default('')
});

/**
 * 1. WORKOUT SCHEMA (Daily Mission)
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

export const WorkoutSectionSchema = z.object({
  title: z.string().describe("e.g. 'Warm Up', 'Main Lift'"),
  overview: z.string().describe("Brief goal of this section").default(''),
  exercises: z.array(WorkoutActivitySchema).default([])
});

export const WorkoutStructureSchema = z.object({
  title: z.string(),
  focus: z.string().default(''),
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

export type WorkoutStructure = z.infer<typeof WorkoutStructureSchema>;
export type WorkoutActivity = z.infer<typeof WorkoutActivitySchema>;
export type WorkoutSection = z.infer<typeof WorkoutSectionSchema>;
export type Intensity = z.infer<typeof IntensitySchema>;


/**
 * 2. MICROCYCLE SCHEMA (Weekly Rhythm)
 */
export const MicrocycleDaySchema = z.object({
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  focus: z.string().default(''),
  activityType: z.enum(["Lifting", "Cardio", "Hybrid", "Mobility", "Rest", "Sport"]).default("Lifting"),
  isRest: z.boolean().default(false),
  notes: z.string().default('')
});

export const MicrocycleStructureSchema = z.object({
  weekNumber: z.number().default(-1),
  phase: z.string().default(''),
  overview: z.string().default(''),
  days: z.array(MicrocycleDaySchema).length(7), // LLM must provide exactly 7 days
  isDeload: z.boolean().default(false)
});

export type MicrocycleStructure = z.infer<typeof MicrocycleStructureSchema>;


/**
 * 3. PLAN SCHEMA (Program Blueprint)
 */
export const PlanScheduleTemplateSchema = z.array(
  z.object({
    day: z.string(), // e.g. "Monday"
    focus: z.string().default(''),
    rationale: z.string().default('')
  })
).describe("The ideal/default weekly rhythm");

export const PlanStructureSchema = z.object({
  name: z.string().describe("e.g. 'Strength + Lean Build Phase'"),
  type: z.string().describe("e.g. 'Powerbuilding'").default(''),

  // Core Strategy
  coreStrategy: z.string().default(''),

  // How You Progress
  progressionStrategy: z.array(z.string()).default([]),

  // When We Adjust
  adjustmentStrategy: z.string().default(''),

  // Conditioning Guidelines
  conditioning: z.array(z.string()).default([]),

  // Schedule
  scheduleTemplate: PlanScheduleTemplateSchema.default([]),

  // Metadata
  durationWeeks: z.number().default(-1),
  frequencyPerWeek: z.number().default(-1)
});

export type PlanStructure = z.infer<typeof PlanStructureSchema>;
