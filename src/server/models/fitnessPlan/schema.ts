import { z } from "zod";
import { MesocycleModel } from "../mesocycle";

export const _MacrocycleSchema = z.object({
    name: z.string(),
    description: z.string(),
    durationWeeks: z.number(),
    mesocycles: z.array(MesocycleModel.schema)
  });

export const _FitnessPlanSchema = z.object({
    programType: z.string(),
    macrocycles: z.array(_MacrocycleSchema),
    overview: z.string(),
    startDate: z.date()
});