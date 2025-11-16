import { z } from "zod";

/* -----------------------------
   FITNESS PLAN SCHEMA

   Simplified schema that stores:
   - description: Long-form plan with all details
   - mesocycles: Array of mesocycle overview strings
   - summary: Brief SMS-friendly summary (optional)
   - notes: Special considerations (optional)
----------------------------- */
export const _FitnessPlanSchema = z.object({
  description: z.string({
    description: "Comprehensive long-form fitness plan description with mesocycle sections delimited by '--- MESOCYCLE N: [Name] ---'"
  }),
  mesocycles: z.array(z.string(), {
    description: "Array of mesocycle overview strings extracted from the plan description"
  }),
  summary: z.string({
    description: "Brief summary of the fitness plan for SMS messages"
  }).nullish(),
  notes: z.string({
    description: "Special considerations like travel plans, injuries, or schedule constraints"
  }).nullish()
});

/**
 * Schema for formatted fitness plan output
 */
export const FormattedFitnessPlanSchema = z.object({
  formatted: z.string({
    description: 'Markdown-formatted fitness plan overview with mesocycle breakdown and coaching notes'
  })
});

export type FormattedFitnessPlan = z.infer<typeof FormattedFitnessPlanSchema>;