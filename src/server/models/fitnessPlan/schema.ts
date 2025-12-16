import { z } from "zod";

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

export type FitnessPlanSchemaType = z.infer<typeof _FitnessPlanSchema>;
