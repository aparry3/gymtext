import { z } from "zod";


export const _WorkoutInstanceSchema = z.object({
  sessionType: z.enum(["run","lift","metcon","mobility","rest","other"]).describe("Primary modality"),
  details: z.array(
    z.object({
      label: z.string().describe("Name of the block (e.g. Warm-up)"),
      activities: z.array(z.string()).describe("Ordered list of exercise descriptions")
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

export type LLMWorkoutInstance = z.infer<typeof _WorkoutInstanceSchema>;