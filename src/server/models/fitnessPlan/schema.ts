import { z } from "zod";

/* -----------------------------
   MESOCYCLE SCHEMA
----------------------------- */
export const _MesocycleSchema = z.object({
  name: z.string({
    description: "The name of the mesocycle phase, e.g., 'Accumulation', 'Intensification'."
  }),
  objective: z.string({
    description: "Main objective for this phase, e.g., 'Build volume base' or 'Increase strength intensity'."
  }),
  focus: z.array(z.string(), {
    description: "Key focus areas for this phase, e.g., ['hypertrophy', 'volume tolerance']."
  }),
  durationWeeks: z.number({
    description: "Total duration of the mesocycle in weeks."
  }),
  startWeek: z.number({
    description: "The starting week number relative to the full plan."
  }),
  endWeek: z.number({
    description: "The ending week number relative to the full plan."
  }),
  volumeTrend: z.enum(["increasing", "stable", "decreasing"], {
    description: "How volume changes across this mesocycle."
  }),
  intensityTrend: z.enum(["increasing", "stable", "taper"], {
    description: "How intensity changes across this mesocycle."
  }),
  conditioningFocus: z.string().nullish(),
  weeklyVolumeTargets: z.record(z.number(), {
    description: "Average weekly hard sets per muscle group, e.g., { chest: 14, back: 16 }."
  }),
  avgRIRRange: z.array(z.number()).length(2).nullish(),
  keyThemes: z.array(z.string()).nullish(),
  longFormDescription: z.string({
    description:
      "Full natural-language explanation of this mesocycle's purpose, trends, and expected adaptations (from LLM output)."
  }),
  microcycles: z.array(
    z.string({
      description:
        "A long-form description of each week's microcycle within this mesocycle. Each string represents one week of programming in natural language."
    }),
    {
      description:
        "Array of long-form microcycle descriptions (one per week, same order as weeks in this mesocycle)."
    }
  )
});

/* -----------------------------
   LEGACY MESOCYCLE SCHEMA (for backward compatibility)
----------------------------- */
export const _MesocycleOverviewSchema = z.object({
  name: z.string({
    description: "The name of the mesocycle phase, e.g., 'Accumulation', 'Intensification'"
  }),
  weeks: z.number({
    description: "The duration of this mesocycle in weeks"
  }),
  focus: z.array(z.string(), {
    description: "Focus areas for this mesocycle, e.g., ['volume', 'technique']"
  }),
  deload: z.boolean({
    description: "Whether the last week is a deload week"
  })
});

/* -----------------------------
   FITNESS PLAN SCHEMA
----------------------------- */
export const _FitnessPlanSchema = z.object({
  programType: z.enum(['endurance', 'strength', 'shred', 'hybrid', 'rehab', 'other'], {
    description: "The type of fitness program, e.g., endurance, strength, shred, hybrid, rehab, or other."
  }),
  lengthWeeks: z.number({
    description: "The total duration of the fitness plan in weeks"
  }),
  mesocycles: z.array(_MesocycleSchema, {
    description: "Structured representations of each mesocycle, each with long-form weekly descriptions."
  }),
  overview: z.string({
    description: "A high-level summary or description of the overall fitness plan."
  }),
  notes: z.string({
    description: "Special considerations like travel plans, injuries, or schedule constraints"
  }).nullish()
});