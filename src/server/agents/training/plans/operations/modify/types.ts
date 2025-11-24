import { z } from 'zod';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { UserWithProfile } from '@/server/models/userModel';
import { FitnessPlanGenerationOutputSchema } from '../../steps/generation/types';

/**
 * Schema for fitness plan modification output - extends base schema with wasModified flag and modifications explanation
 */
export const ModifyFitnessPlanOutputSchema = FitnessPlanGenerationOutputSchema.extend({
  wasModified: z.boolean().describe(
    'Whether the fitness plan was actually modified in response to the change request. ' +
    'False if the current plan already satisfies the request or no changes were needed.'
  ),
  modifications: z.string().default('').describe(
    'Explanation of what changed and why (empty string if wasModified is false). ' +
    'When wasModified is true, describe specific changes made to the plan structure (frequency, split, duration, etc.).'
  )
});

export type ModifyFitnessPlanOutput = z.infer<typeof ModifyFitnessPlanOutputSchema>;

/**
 * Parameters for modifying a fitness plan
 */
export interface ModifyFitnessPlanInput {
  user: UserWithProfile;
  currentPlan: FitnessPlan;
  changeRequest: string;
}

/**
 * Context for fitness plan modification chain
 */
export interface ModifyFitnessPlanContext {
  fitnessPlan: {
    overview: string;
    mesocycles: string[];
    total_weeks: number;
  };
  wasModified: boolean;
  modifications: string;
}

/**
 * Agent configuration
 */
export interface ModifyFitnessPlanAgentDeps {
  config?: {
    model?: string;
  };
}

/**
 * Final output from the modify fitness plan agent
 */
export interface ModifyFitnessPlanAgentOutput {
  description: string;
  mesocycles: string[];
  totalWeeks: number;
  formatted: string;
  message: string;
  wasModified: boolean;
  modifications: string;
}
