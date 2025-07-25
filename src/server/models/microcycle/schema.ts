/**
 * This schema file defines the structured output expected from an LLM (Large Language Model)
 * for microcycle planning in fitness periodization. It provides Zod schemas for validating
 * microcycle overviews and detailed microcycle objects, ensuring that generated outputs
 * conform to the required structure for downstream processing and storage.
 */

import { z } from "zod";
import { _WorkoutInstanceSchema } from "../workout/schema";

export const _MicrocycleOverviewSchema = z.object({
    weekNumber: z.number().describe("Index of the microcycle in the mesocycle"),
    split: z.string().optional().describe("Split day pattern of the microcycle. ex.Upper-Lower-Rest-HIIT-Upper-Lower-Rest"),
    totalMileage: z.number().optional().describe("Total mileage of the microcycle"),
    longRunMileage: z.number().optional().describe("Long run mileage of the microcycle"),
    avgIntensityPct1RM: z.number().optional().describe("Average intensity percentage of the microcycle"),
    totalSetsMainLifts: z.number().optional().describe("Total sets of main lifts of the microcycle"),
    deload: z.boolean().optional().describe("Is this microcycle a deload week?")
});

export const _MicrocycleSchema = z.object({
    index: z.number().int().describe("index of the microcycle in the mesocycle"),
    workouts: z.array(
        _WorkoutInstanceSchema
    ).min(1).describe("Workouts scheduled for this week")
  }).strict();


  export type LLMMicrocycle = z.infer<typeof _MicrocycleSchema>;
