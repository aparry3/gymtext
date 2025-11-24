import { z } from "zod";
import type { UserWithProfile } from "@/server/models/userModel";

/**
 * Schema for structured mesocycle generation output
 */
export const MesocycleOutputSchema = z.object({
  overview: z.string({
    description: "Comprehensive mesocycle overview including objective, duration, volume/intensity trends, split, and conditioning strategy"
  }),
  microcycles: z.array(z.string(), {
    description: "Array of weekly microcycle overview strings with all required details (volume, intensity, split, session themes, etc.)"
  }),
  number_of_microcycles: z.number({
    description: "The number of microcycles in the mesocycle"
  })
});

export type MesocycleOutput = z.infer<typeof MesocycleOutputSchema>;

export interface StructuredMesocycleInput {
  user: UserWithProfile;
  mesocycleText: string;
  mesocycleOverview: string;
}

/**
 * Context that flows through the mesocycle chain after structured step
 */
export interface StructuredMesocycleContext {
  user: UserWithProfile;
  mesocycleOverview: string;
  mesocycle: MesocycleOutput;
}
