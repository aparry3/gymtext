import { z } from "zod";

/**
 * Gemini-compatible workout schemas
 *
 * Gemini's structured output doesn't support union types (e.g., string | null)
 * or .nullable().optional() combinations. This schema uses sentinel values instead:
 * - Empty string "" for unset string values
 * - -1 for unset numeric values (sets, reps, duration, RPE, percentageRM, etc.)
 * - Empty arrays [] for unset array values
 *
 * Post-processing will convert these sentinel values back to null for compatibility.
 */

// Gemini-compatible workout block item schema
export const GeminiWorkoutBlockItemSchema = z.object({
  type: z.enum(['prep', 'compound', 'secondary', 'accessory', 'core', 'cardio', 'cooldown'])
    .describe("Type of exercise in the workout"),
  exercise: z.string().describe("Specific, actionable exercise name that a user can immediately perform (e.g., 'Band Pull-Aparts', 'Cat-Cow Stretch', 'Scapular Wall Slides'). Never use vague terms like 'mobility sequence' or 'dynamic warmup'."),
  sets: z.number().describe("Number of sets (use -1 if not applicable)"),
  reps: z.string().describe("Number of reps (can be range like '6-8' or number like '10', use empty string if not applicable)"),
  durationSec: z.number().describe("Duration in seconds (use -1 if not applicable)"),
  durationMin: z.number().describe("Duration in minutes (use -1 if not applicable)"),
  RPE: z.number().describe("Rate of Perceived Exertion (1-10 scale, use -1 if not applicable)"),
  rir: z.number().describe("Reps in Reserve (typically 0-5, use -1 if not applicable)"),
  percentageRM: z.number().describe("Percentage of 1 Rep Max (0-100 scale, use -1 if not applicable)"),
  restSec: z.number().describe("Rest between sets in seconds (use -1 if not applicable)"),
  restText: z.string().describe("Readable rest instruction (e.g., '90s between supersets', use empty string if not applicable)"),
  equipment: z.string().describe("Equipment used (barbell, DB, band, etc., use empty string if not applicable)"),
  pattern: z.string().describe("Movement pattern label (e.g., 'horizontal_press', use empty string if not applicable)"),
  tempo: z.string().describe("Tempo prescription (e.g., '3-1-1', use empty string if not applicable)"),
  cues: z.array(z.string()).describe("Key coaching cues (use empty array if none)"),
  tags: z.array(z.string()).describe("Semantic tags for filtering/substitution (use empty array if none)"),
  notes: z.string().describe("Additional notes for the exercise (use empty string if no notes)")
}).strict();

// Gemini-compatible workout work item schema (mid-level: straight, superset, or circuit)
export const GeminiWorkoutWorkItemSchema = z.object({
  structureType: z.enum(['straight', 'superset', 'circuit'])
    .describe("Defines how the exercises are grouped (straight = single exercise, superset = 2 exercises alternated, circuit = 3+ exercises)"),
  exercises: z.array(GeminiWorkoutBlockItemSchema).min(1)
    .describe("One or more exercises (1 = straight, 2 = superset, 3+ = circuit)"),
  restBetweenExercisesSec: z.number()
    .describe("Rest between exercises inside the superset/circuit in seconds (use -1 if not applicable)"),
  restAfterSetSec: z.number()
    .describe("Rest between rounds or sets of this work item in seconds (use -1 if not applicable)"),
  rounds: z.number()
    .describe("Number of times the group is repeated (for circuits, use -1 if not applicable)"),
  notes: z.string()
    .describe("Extra details about the grouping (use empty string if no notes)")
}).strict();

export const GeminiWorkoutBlockSchema = z.object({
  name: z.string().describe("Name of the workout block (e.g., 'Warm-Up', 'Main Lift', 'Accessory')"),
  goal: z.string().describe("Purpose of this block (use empty string if not applicable)"),
  durationMin: z.number().describe("Estimated duration in minutes (use -1 if not applicable)"),
  notes: z.string().describe("General notes for this block (use empty string if no notes)"),
  work: z.array(GeminiWorkoutWorkItemSchema)
    .describe("The list of work items (straight, superset, or circuit) within this block")
}).strict();

export const GeminiWorkoutModificationSchema = z.object({
  condition: z.string().describe("Condition that triggers this modification (e.g., 'injury.lower_back.active')"),
  replace: z.object({
    exercise: z.string().describe("Exercise to replace"),
    with: z.string().describe("Replacement exercise")
  }).describe("Exercise replacement details (use empty strings if not applicable)"),
  adjustment: z.string().describe("Adjustment to make (e.g., 'reduce weight by 20%', use empty string if not applicable)"),
  note: z.string().describe("Explanation for the modification")
}).strict();

// Gemini-compatible session context schema
export const GeminiWorkoutSessionContextSchema = z.object({
  phaseName: z.string().describe("Name of the training phase (use empty string if not applicable)"),
  weekNumber: z.number().describe("Week number in the program (use -1 if not applicable)"),
  dayIndex: z.number().describe("Day index in the microcycle (use -1 if not applicable)"),
  goal: z.string().describe("Goal of the session (use empty string if not applicable)"),
  durationEstimateMin: z.number().describe("Estimated duration in minutes (use -1 if not applicable)"),
  environment: z.string().describe("Training environment (e.g., 'gym', 'home', use empty string if not applicable)"),
  clientConstraints: z.object({
    timeAvailable: z.number().describe("Time available in minutes (use -1 if not applicable)"),
    equipmentAvailable: z.array(z.string()).describe("Available equipment (use empty array if not specified)"),
    injuries: z.array(z.string()).describe("Current injuries or limitations (use empty array if none)"),
    preferences: z.array(z.string()).describe("Client preferences (use empty array if not specified)")
  }).describe("Client-specific constraints for the session")
}).strict();

// Gemini-compatible target metrics schema
export const GeminiWorkoutTargetMetricsSchema = z.object({
  totalVolume: z.number().describe("Total volume in kg (use -1 if not applicable)"),
  totalReps: z.number().describe("Total reps across all exercises (use -1 if not applicable)"),
  totalSets: z.number().describe("Total sets across all exercises (use -1 if not applicable)"),
  totalDistance: z.number().describe("Total distance in km (use -1 if not applicable)"),
  totalDuration: z.number().describe("Total duration in minutes (use -1 if not applicable)"),
  averageRPE: z.number().describe("Average RPE across workout (use -1 if not applicable)"),
  averageIntensity: z.number().describe("Average intensity across workout (use -1 if not applicable)")
}).strict();

// Gemini-compatible workout summary schema
export const GeminiWorkoutSummarySchema = z.object({
  adaptations: z.array(z.string()).describe("Expected adaptations from this workout (use empty array if not specified)"),
  coachingNotes: z.string().describe("Coaching notes for the client (use empty string if no notes)"),
  progressionNotes: z.string().describe("Notes on progression strategy (use empty string if no notes)"),
  recoveryFocus: z.string().describe("Recovery focus areas (use empty string if not specified)")
}).strict();

// Gemini-compatible enhanced workout instance schema
export const GeminiEnhancedWorkoutInstanceSchema = z.object({
  theme: z.string().describe("Overall theme of the workout (e.g., 'Upper Push', 'Lower Power')"),
  sessionContext: GeminiWorkoutSessionContextSchema.describe("Metadata and context about the session"),
  blocks: z.array(GeminiWorkoutBlockSchema).describe("Structured blocks of the workout"),
  modifications: z.array(GeminiWorkoutModificationSchema).describe("Modifications for special conditions (use empty array if none)"),
  targetMetrics: GeminiWorkoutTargetMetricsSchema.describe("Target metrics for the workout"),
  summary: GeminiWorkoutSummarySchema.describe("Summary and meta reflections about the workout"),
  notes: z.string().describe("Additional notes for the workout (use empty string if no notes)")
}).strict();

// Gemini schema with modifications tracking (for substitute/replace operations)
export const GeminiUpdatedWorkoutInstanceSchema = GeminiEnhancedWorkoutInstanceSchema.extend({
  modificationsApplied: z.array(z.string()).describe("List of specific changes made to the workout (e.g., 'Replaced Barbell Bench Press with Dumbbell Bench Press due to no barbell available')")
}).strict();

// Type exports
export type GeminiWorkoutBlockItem = z.infer<typeof GeminiWorkoutBlockItemSchema>;
export type GeminiWorkoutWorkItem = z.infer<typeof GeminiWorkoutWorkItemSchema>;
export type GeminiWorkoutBlock = z.infer<typeof GeminiWorkoutBlockSchema>;
export type GeminiWorkoutModification = z.infer<typeof GeminiWorkoutModificationSchema>;
export type GeminiWorkoutSessionContext = z.infer<typeof GeminiWorkoutSessionContextSchema>;
export type GeminiWorkoutTargetMetrics = z.infer<typeof GeminiWorkoutTargetMetricsSchema>;
export type GeminiWorkoutSummary = z.infer<typeof GeminiWorkoutSummarySchema>;
export type GeminiEnhancedWorkoutInstance = z.infer<typeof GeminiEnhancedWorkoutInstanceSchema>;
export type GeminiUpdatedWorkoutInstance = z.infer<typeof GeminiUpdatedWorkoutInstanceSchema>;

/**
 * Converts Gemini sentinel values to null for compatibility with existing types
 * - Empty strings → null
 * - -1 values → null (for optional numeric fields)
 * - Empty arrays → null (for optional array fields)
 * - Empty replace objects → null
 * - Invalid numeric ranges → null (e.g., RPE > 10, percentageRM > 100)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertGeminiToStandard<T extends Record<string, any>>(geminiOutput: T): any {
  if (Array.isArray(geminiOutput)) {
    return geminiOutput.map(convertGeminiToStandard);
  }

  if (geminiOutput && typeof geminiOutput === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};

    for (const [key, value] of Object.entries(geminiOutput)) {
      // Handle empty strings
      if (value === "") {
        result[key] = null;
      }
      // Handle numeric sentinel value (-1 for optional fields)
      else if (value === -1) {
        result[key] = null;
      }
      // Validate RPE range (1-10)
      else if (key === 'RPE' && typeof value === 'number') {
        result[key] = (value >= 1 && value <= 10) ? value : null;
      }
      // Validate percentageRM range (0-100)
      else if (key === 'percentageRM' && typeof value === 'number') {
        result[key] = (value >= 0 && value <= 100) ? value : null;
      }
      // Validate rir (typically 0-5, but allow up to 10 for flexibility)
      else if (key === 'rir' && typeof value === 'number') {
        result[key] = (value >= 0 && value <= 10) ? value : null;
      }
      // Validate sets (should be positive)
      else if (key === 'sets' && typeof value === 'number') {
        result[key] = (value > 0) ? value : null;
      }
      // Validate duration fields (should be positive)
      else if ((key === 'durationSec' || key === 'durationMin') && typeof value === 'number') {
        result[key] = (value > 0) ? value : null;
      }
      // Validate rest fields (should be positive)
      else if ((key === 'restSec' || key === 'restAfterSetSec' || key === 'restBetweenExercisesSec') && typeof value === 'number') {
        result[key] = (value > 0) ? value : null;
      }
      // Validate rounds (should be positive)
      else if (key === 'rounds' && typeof value === 'number') {
        result[key] = (value > 0) ? value : null;
      }
      // Handle empty arrays (for optional array fields)
      else if (Array.isArray(value) && value.length === 0 &&
               (key === 'cues' || key === 'tags' || key === 'modifications' ||
                key === 'adaptations' || key === 'equipmentAvailable' ||
                key === 'injuries' || key === 'preferences')) {
        result[key] = null;
      }
      // Handle empty replace objects
      else if (key === 'replace' && typeof value === 'object' &&
               value.exercise === "" && value.with === "") {
        result[key] = null;
      }
      // Recursively process objects and arrays
      else if (typeof value === 'object' && value !== null) {
        result[key] = convertGeminiToStandard(value);
      }
      // Keep other values as-is
      else {
        result[key] = value;
      }
    }

    return result;
  }

  return geminiOutput;
}
