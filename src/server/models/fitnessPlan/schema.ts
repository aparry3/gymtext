import { z } from "zod";

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

export const _FitnessPlanSchema = z.object({
  programType: z.enum(['endurance', 'strength', 'shred', 'hybrid', 'rehab', 'other'], {
    description: "The type of fitness program, e.g., endurance, strength, shred, hybrid, rehab, or other."
  }),
  macrocycleWeeks: z.number({
    description: "The total duration of the fitness plan in weeks"
  }),
  mesocycles: z.array(_MesocycleOverviewSchema, {
    description: "An array of mesocycle overviews that make up the entire fitness plan"
  }),
  overview: z.string({
    description: "A high-level summary or description of the overall fitness plan."
  }),
  notes: z.string({
    description: "Special considerations like travel plans, injuries, or schedule constraints"
  }).optional()
});