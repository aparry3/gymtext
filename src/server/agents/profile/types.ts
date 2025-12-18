import type { Message } from '@/server/models/messageModel';
import type { UserWithProfile } from '@/server/models/userModel';
import type { CommonTimezone } from '@/shared/utils/timezone';
import type { StructuredProfile } from './schemas';

// =============================================================================
// Profile Update Agent Types
// =============================================================================

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

// =============================================================================
// User Fields Agent Types
// =============================================================================

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

// =============================================================================
// Structured Profile Agent Types
// =============================================================================

/**
 * Input for the Structured Profile Agent
 */
export interface StructuredProfileInput {
  /** The Markdown dossier text to parse */
  dossierText: string;
  /** Current date for temporal reasoning (ISO format) */
  currentDate: string;
}

/**
 * Output from the Structured Profile Agent
 */
export interface StructuredProfileOutput {
  /** Extracted structured profile */
  structured: StructuredProfile;
  /** Whether extraction was successful */
  success: boolean;
  /** Any notes about the extraction (for logging) */
  notes?: string;
}
