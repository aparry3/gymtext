import { UserWithProfile } from '@/server/models/userModel';

/**
 * Input for generating weekly feedback message
 */
export interface WeeklyMessageInput {
  /** User receiving the weekly message */
  user: UserWithProfile;

  /** Whether next week is the first week of a new mesocycle */
  isNewMesocycle: boolean;

  /** Name of the new mesocycle (if isNewMesocycle is true) */
  mesocycleName?: string | null;
}

/**
 * Output from weekly message agent
 */
export interface WeeklyMessageOutput {
  /** Feedback request message asking about past week */
  feedbackMessage: string;
}
