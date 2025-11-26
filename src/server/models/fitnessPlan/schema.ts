import { z } from "zod";

/* -----------------------------
   FITNESS PLAN SCHEMA

   Simplified schema that stores:
   - description: Structured text plan (split, frequency, goals, deload rules, etc.)
   - formatted: Markdown-formatted for frontend display
   - message: Brief SMS-friendly summary (optional)

   Plans are ongoing by default - no fixed duration.
----------------------------- */
export const _FitnessPlanSchema = z.object({
  description: z.string({
    description: "Structured text fitness plan containing split, frequency, deload rules, goals, and progression principles"
  }),
  formatted: z.string({
    description: "Markdown-formatted plan for frontend display"
  }),
  message: z.string({
    description: "Brief summary of the fitness plan for SMS messages"
  }).nullish()
});

export type FitnessPlanSchemaType = z.infer<typeof _FitnessPlanSchema>;
