import { z } from "zod";

// ============================================================================
// Microcycle Structure Schemas (for structured microcycle representation)
// ============================================================================

/**
 * Individual day within a microcycle
 */
export const MicrocycleDaySchema = z.object({
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  focus: z.string().default(''),
  activityType: z.enum(["Lifting", "Cardio", "Hybrid", "Mobility", "Rest", "Sport"]).default("Lifting"),
  isRest: z.boolean().default(false),
  notes: z.string().default('')
});

/**
 * Complete microcycle structure (weekly rhythm)
 */
export const MicrocycleStructureSchema = z.object({
  weekNumber: z.number().default(-1),
  phase: z.string().default(''),
  overview: z.string().default(''),
  days: z.array(MicrocycleDaySchema).length(7), // LLM must provide exactly 7 days
  isDeload: z.boolean().default(false)
});

export type MicrocycleStructure = z.infer<typeof MicrocycleStructureSchema>;
export type MicrocycleDay = z.infer<typeof MicrocycleDaySchema>;

// ============================================================================
// Microcycle Generation Schema (for LLM output)
// ============================================================================

/**
 * Schema for microcycle generation output
 *
 * Simplified structure:
 * - overview: Description of the week's focus and goals
 * - isDeload: Whether this is a deload week
 * - days: Array of 7 day descriptions (strings)
 */
export const _MicrocycleGenerationSchema = z.object({
  overview: z.string({
    description: "Overview of the week's training focus, objectives, and progression context"
  }),
  isDeload: z.boolean({
    description: "Whether this is a deload week (reduced volume/intensity)"
  }).default(false),
  days: z.array(z.string(), {
    description: "Array of 7 day descriptions (day 1 through day 7). Each string describes the session for that day including theme, focus, volume/intensity targets, and conditioning if applicable."
  }).length(7, "Must have exactly 7 days")
});

export type MicrocycleGenerationOutput = z.infer<typeof _MicrocycleGenerationSchema>;

/**
 * Full microcycle pattern
 */
export interface MicrocyclePattern {
  overview: string;
  isDeload: boolean;
  days: string[];
  message?: string;
}

/**
 * Updated microcycle pattern with modification tracking
 */
export interface UpdatedMicrocyclePattern extends MicrocyclePattern {
  modificationsApplied?: string[];
}
