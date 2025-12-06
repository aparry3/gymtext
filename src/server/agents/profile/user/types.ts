import type { Message } from '@/server/models/messageModel';
import type { UserWithProfile } from '@/server/models/userModel';
import type { CommonTimezone } from '@/shared/utils/timezone';

/**
 * Input for the User Fields Agent
 *
 * Similar context to the profile agent - analyzes user messages
 * to extract user model field updates (timezone, send time, name)
 */
export interface UserFieldsInput {
  /** The user's message to analyze for field updates */
  message: string;
  /** User context (current timezone, name, etc.) */
  user: UserWithProfile;
  /** Current date formatted for AI context */
  currentDate: string;
  /** Optional conversation history for context */
  previousMessages?: Message[];
}

/**
 * Output from the User Fields Agent
 *
 * Returns extracted field values (or null if not mentioned)
 * and metadata about what was detected
 */
export interface UserFieldsOutput {
  /**
   * IANA timezone from constrained enum
   * LLM directly outputs valid timezone based on user's mention
   */
  timezone: CommonTimezone | null;

  /**
   * Inferred preferred send hour (0-23)
   * e.g., "morning" → 8, "after work" → 18, "6pm" → 18
   */
  preferredSendHour: number | null;

  /**
   * New name if user wants to change it
   * e.g., "call me Mike" → "Mike"
   */
  name: string | null;

  /** Whether any field updates were detected */
  hasUpdates: boolean;

  /** Summary of what was detected (for logging/response) */
  updateSummary: string;
}
