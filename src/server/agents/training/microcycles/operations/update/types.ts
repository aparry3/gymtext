import { z } from 'zod';
import type { Microcycle } from '@/server/models/microcycle';
import { DayOfWeek } from '@/shared/utils/date';
import type { UserWithProfile } from '@/server/models/userModel';
import { MicrocycleGenerationOutputSchema } from '../../steps';

/**
 * Schema for microcycle update output - extends base schema with wasModified flag
 */
export const MicrocycleUpdateOutputSchema = MicrocycleGenerationOutputSchema.extend({
  wasModified: z.boolean().describe(
    'Whether the microcycle was actually modified in response to the change request. ' +
    'False if the current plan already satisfies the request or no changes were needed.'
  )
});

export type MicrocycleUpdateOutput = z.infer<typeof MicrocycleUpdateOutputSchema>;

/**
 * Parameters for updating a microcycle
 */
export interface MicrocycleUpdateInput {
  user: UserWithProfile;
  currentMicrocycle: Microcycle;
  changeRequest: string;
  currentDayOfWeek: DayOfWeek;
  weekNumber: number;
}

/**
 * Context required to update a microcycle
 */
export interface MicrocycleUpdateContext {
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
 * Result of updating a microcycle with all day overviews and modifications applied
 */
export interface UpdatedMicrocycleDayOverviews {
  mondayOverview: string;
  tuesdayOverview: string;
  wednesdayOverview: string;
  thursdayOverview: string;
  fridayOverview: string;
  saturdayOverview: string;
  sundayOverview: string;
  modificationsApplied: string[]; // List of specific changes made to the weekly pattern
}
