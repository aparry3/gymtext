import type { UserWithProfile } from "@/server/models/userModel";

export interface FitnessPlanInput {
  user: UserWithProfile;
}

/**
 * Context that flows through the fitness plan chain
 */
export interface GenerateFitnessPlanOutput {
  user: UserWithProfile;
  fitnessPlan: string;
}
