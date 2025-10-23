import { z } from "zod";

/**
 * Gemini-compatible workout schemas
 *
 * Gemini's structured output doesn't support union types (e.g., string | null)
 * or .nullable().optional() combinations. This schema uses sentinel values instead:
 * - Empty string "" for unset string values
 * - 0 for unset numeric values (sets, reps, duration, RPE, percentageRM)
 * - Empty arrays [] for unset array values
 *
 * Post-processing will convert these sentinel values back to null for compatibility.
 */

// Gemini-compatible workout block item schema
export const GeminiWorkoutBlockItemSchema = z.object({
  type: z.enum(['prep', 'compound', 'secondary', 'accessory', 'core', 'cardio', 'cooldown'])
    .describe("Type of exercise in the workout"),
  exercise: z.string().describe("Specific, actionable exercise name that a user can immediately perform (e.g., 'Band Pull-Aparts', 'Cat-Cow Stretch', 'Scapular Wall Slides'). Never use vague terms like 'mobility sequence' or 'dynamic warmup'."),
  sets: z.number().describe("Number of sets (use 0 if not applicable)"),
  reps: z.string().describe("Number of reps (can be range like '6-8' or number like '10', use empty string if not applicable)"),
  durationSec: z.number().describe("Duration in seconds (use 0 if not applicable)"),
  durationMin: z.number().describe("Duration in minutes (use 0 if not applicable)"),
  RPE: z.number().min(0).max(10).describe("Rate of Perceived Exertion (1-10, use 0 if not applicable)"),
  percentageRM: z.number().min(0).max(100).describe("Percentage of 1 Rep Max (use 0 if not applicable)"),
  rest: z.string().describe("Rest period between sets (use empty string if not applicable)"),
  notes: z.string().describe("Additional notes for the exercise (use empty string if no notes)")
}).strict();

export const GeminiWorkoutBlockSchema = z.object({
  name: z.string().describe("Name of the workout block (e.g., 'Warm-up', 'Main', 'Accessory')"),
  items: z.array(GeminiWorkoutBlockItemSchema).describe("Exercises in this block")
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

// Gemini-compatible enhanced workout instance schema
export const GeminiEnhancedWorkoutInstanceSchema = z.object({
  theme: z.string().describe("Overall theme of the workout (e.g., 'Upper Push', 'Lower Power')"),
  blocks: z.array(GeminiWorkoutBlockSchema).describe("Structured blocks of the workout"),
  modifications: z.array(GeminiWorkoutModificationSchema).describe("Modifications for special conditions (use empty array if none)"),
  targetMetrics: z.object({
    totalVolume: z.number().describe("Total volume in kg (use 0 if not applicable)"),
    totalDistance: z.number().describe("Total distance in km (use 0 if not applicable)"),
    totalDuration: z.number().describe("Total duration in minutes (use 0 if not applicable)"),
    averageIntensity: z.number().describe("Average RPE across workout (use 0 if not applicable)")
  }).describe("Target metrics for the workout"),
  notes: z.string().describe("Additional notes for the workout (use empty string if no notes)")
}).strict();

// Gemini schema with modifications tracking (for substitute/replace operations)
export const GeminiUpdatedWorkoutInstanceSchema = GeminiEnhancedWorkoutInstanceSchema.extend({
  modificationsApplied: z.array(z.string()).describe("List of specific changes made to the workout (e.g., 'Replaced Barbell Bench Press with Dumbbell Bench Press due to no barbell available')")
}).strict();

// Type exports
export type GeminiWorkoutBlockItem = z.infer<typeof GeminiWorkoutBlockItemSchema>;
export type GeminiWorkoutBlock = z.infer<typeof GeminiWorkoutBlockSchema>;
export type GeminiWorkoutModification = z.infer<typeof GeminiWorkoutModificationSchema>;
export type GeminiEnhancedWorkoutInstance = z.infer<typeof GeminiEnhancedWorkoutInstanceSchema>;
export type GeminiUpdatedWorkoutInstance = z.infer<typeof GeminiUpdatedWorkoutInstanceSchema>;

/**
 * Converts Gemini sentinel values to null for compatibility with existing types
 * - Empty strings → null
 * - 0 values for optional numeric fields → null
 * - Empty replace objects → null
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
      // Handle numeric sentinel values (0 for optional fields)
      else if (
        value === 0 &&
        (key === 'RPE' || key === 'percentageRM' || key === 'sets' ||
         key === 'durationSec' || key === 'durationMin' ||
         key === 'totalVolume' || key === 'totalDistance' ||
         key === 'totalDuration' || key === 'averageIntensity')
      ) {
        result[key] = null;
      }
      // Handle empty replace objects
      else if (key === 'replace' && typeof value === 'object' &&
               value.exercise === "" && value.with === "") {
        result[key] = null;
      }
      // Handle empty modifications array
      else if (key === 'modifications' && Array.isArray(value) && value.length === 0) {
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
