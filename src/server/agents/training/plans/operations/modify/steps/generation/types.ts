import { z } from 'zod';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { UserWithProfile } from '@/server/models/userModel';

/**
 * Schema for fitness plan modification output
 */
export const ModifyFitnessPlanOutputSchema = z.object({
  description: z.string().describe(
    'The updated structured text plan with PROGRAM ARCHITECTURE, WEEKLY SCHEDULE TEMPLATE, ' +
    'SESSION GUIDELINES, PROGRESSION STRATEGY, DELOAD PROTOCOL, and KEY PRINCIPLES sections'
  ),
  wasModified: z.boolean().describe(
    'Whether the plan was actually modified in response to the change request. ' +
    'False if the current plan already satisfies the request or no changes were needed.'
  ),
  modifications: z.string().default('').describe(
    'Explanation of what changed and why (empty string if wasModified is false). ' +
    'When wasModified is true, describe specific changes made to the plan structure.'
  )
});

export type ModifyFitnessPlanOutput = z.infer<typeof ModifyFitnessPlanOutputSchema>;

/**
 * Input parameters for modifying a fitness plan
 */
export interface ModifyFitnessPlanInput {
  user: UserWithProfile;
  currentPlan: FitnessPlan;
  changeRequest: string;
}
