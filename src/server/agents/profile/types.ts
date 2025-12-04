import type { UserWithProfile } from '../../models/userModel';
import type { Message } from '../../models/messageModel';

/**
 * Input for the Profile Update Agent
 */
export interface ProfileUpdateInput {
  /** Current Markdown profile (or empty string if no profile exists) */
  currentProfile: string;
  /** User's message that may contain profile updates */
  message: string;
  /** User data for context */
  user: UserWithProfile;
  /** Current date in ISO format for temporal reasoning */
  currentDate: string;
  /** Optional conversation history for context */
  previousMessages?: Message[];
}

/**
 * Output from the Profile Update Agent
 */
export interface ProfileUpdateOutput {
  /** Updated complete Markdown profile document */
  updatedProfile: string;
  /** Whether any changes were made */
  wasUpdated: boolean;
  /** Brief summary of what was updated (for logging/display). Empty string if nothing was updated. */
  updateSummary: string;
}
