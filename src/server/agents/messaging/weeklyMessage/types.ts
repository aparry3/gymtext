import { UserWithProfile } from '@/server/models/userModel';
import { MicrocyclePattern } from '@/server/models/microcycle';

/**
 * Input for generating weekly check-in messages
 */
export interface WeeklyMessageInput {
  /** User receiving the weekly message */
  user: UserWithProfile;

  /** Next week's microcycle pattern (already advanced) */
  nextWeekMicrocycle: MicrocyclePattern;

  /** Whether next week is the first week of a new mesocycle */
  isNewMesocycle: boolean;

  /** Name of the new mesocycle (if isNewMesocycle is true) */
  mesocycleName?: string | null;
}

/**
 * Output from weekly message agent
 */
export interface WeeklyMessageOutput {
  /** First message: feedback request */
  feedbackMessage: string;

  /** Second message: week breakdown with pattern */
  breakdownMessage: string;
}
