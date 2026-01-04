import { z } from "zod";
// ============================================================================
// Plan Structure Schemas (for structured plan representation)
// ============================================================================
/**
 * Schedule template for weekly rhythm
 */
export const PlanScheduleTemplateSchema = z.array(z.object({
    day: z.string(), // e.g. "Monday"
    focus: z.string().default(''),
    rationale: z.string().default('')
})).describe("The ideal/default weekly rhythm");
/**
 * Complete plan structure (program blueprint)
 */
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
// ============================================================================
// Fitness Plan LLM Output Schema
// ============================================================================
/* -----------------------------
   FITNESS PLAN SCHEMA

   Simplified schema that stores:
   - description: Structured text plan (split, frequency, goals, deload rules, etc.)
   - message: Brief SMS-friendly summary (optional)
   - structured: Parsed plan data for UI rendering (stored separately)

   Plans are ongoing by default - no fixed duration.
----------------------------- */
export const _FitnessPlanSchema = z.object({
    description: z.string({
        description: "Structured text fitness plan containing split, frequency, deload rules, goals, and progression principles"
    }),
    message: z.string({
        description: "Brief summary of the fitness plan for SMS messages"
    }).nullish()
});
