import { z } from "zod";

/**
 * Gemini-friendly schemas without circular references or $ref
 * These are flattened versions of the schemas from cycles.ts
 */

// Inline all sub-schemas to avoid $ref generation
export const MicrocyclesGeminiSchema = z.array(
  z.object({
    weekNumber: z.number().int()
                 .describe("Human-friendly week number"),
    metrics: z.array(
      z.object({
        key: z.string().describe("Metric / target field name"),
        value: z.number().describe("Numeric value for the key")
      }).strict()
    ).describe("Logged or planned totals for the week")
     .optional(),
    workouts: z.array(
      z.object({
        id: z.string().describe("Workout UUID / slug"),
        date: z.string().describe("Planned date YYYY-MM-DD"),
        sessionType: z.enum(["run","lift","metcon","mobility","rest","other"])
                     .describe("Primary modality"),
        blocks: z.array(
          z.object({
            label: z.string().describe("Name of the block (e.g. Warm-up)"),
            activities: z.array(z.string())
                         .describe("Ordered list of exercise descriptions")
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
    ).min(1).describe("Workouts scheduled for this week")
  }).strict()
).min(1).describe("Array of microcycles for structured output");