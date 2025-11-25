import { z } from 'zod';
import type { Microcycle } from '@/server/models/microcycle';
import { DayOfWeek } from '@/shared/utils/date';
import type { UserWithProfile } from '@/server/models/userModel';
import { MicrocycleGenerationOutputSchema } from '../../steps';

/**
 * Schema for microcycle modification output - extends base schema with wasModified flag and modifications explanation
 */
export const ModifyMicrocycleOutputSchema = MicrocycleGenerationOutputSchema.extend({
  wasModified: z.boolean().describe(
    'Whether the microcycle was actually modified in response to the change request. ' +
    'False if the current plan already satisfies the request or no changes were needed.'
  ),
  modifications: z.string().default('').describe(
    'Explanation of what changed and why (empty string if wasModified is false). ' +
    'When wasModified is true, describe specific changes made to the weekly pattern.'
  )
});

export type ModifyMicrocycleOutput = z.infer<typeof ModifyMicrocycleOutputSchema>;

/**
 * Parameters for modifying a microcycle
 */
export interface ModifyMicrocycleInput {
  user: UserWithProfile;
  currentMicrocycle: Microcycle;
  changeRequest: string;
  currentDayOfWeek: DayOfWeek;
  weekNumber: number;
}

/**
 * Context required to modify a microcycle
 */
export interface ModifyMicrocycleContext {
  overview: string;
  isDeload: boolean;
  days: {
    [key in DayOfWeek]: {
      sessionType: string;
      theme: string;
    };
  };
}

/**
 * Result of modifying a microcycle with all day overviews and modifications applied
 */
export interface ModifiedMicrocycleDayOverviews {
  days: string[];  // Array of 7 day overviews [Monday-Sunday]
  modificationsApplied: string[]; // List of specific changes made to the weekly pattern
}
