import { z } from "zod";
import { MesocycleModel } from "../mesocycle";

export const _MacrocycleSchema = z.object({
  name: z.string({
    description: "The name of the macrocycle, representing a major phase of the fitness plan."
  }),
  description: z.string({
    description: "A detailed description of the macrocycle's purpose and focus."
  }),
  durationWeeks: z.number({
    description: "The length of the macrocycle in weeks."
  }),
  mesocycles: z.array(MesocycleModel.schema, {
    description: "An array of mesocycles that make up this macrocycle."
  })
});

export const _FitnessPlanSchema = z.object({
    programType: z.enum(['endurance', 'strength', 'shred', 'hybrid', 'rehab', 'other'], {
      description: "The type of fitness program, e.g., endurance, strength, shred, hybrid, rehab, or other."
    }),
    macrocycles: z.array(_MacrocycleSchema, {
      description: "An array of macrocycles, each representing a major phase of the fitness plan, containing its own name, description, duration, and mesocycles."
    }),
    overview: z.string({
      description: "A high-level summary or description of the overall fitness plan."
    }),
    startDate: z.date({
      description: "The date when the fitness plan is scheduled to begin."
    })
});