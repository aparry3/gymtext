import { UserWithProfile } from '@/server/models/userModel';

/**
 * Input for generating weekly feedback message
 */
export interface WeeklyMessageInput {
  /** User receiving the weekly message */
  user: UserWithProfile;

  /** Whether next week is a deload week */
  isDeload: boolean;

  /** Week number from plan start (1-indexed) */
  absoluteWeek: number;
}

/**
 * Output from weekly message agent
 */
export interface WeeklyMessageOutput {
  /** Feedback request message asking about past week */
  feedbackMessage: string;
}
