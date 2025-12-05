import { z } from 'zod';

/**
 * Zod schema for User Fields Agent output
 *
 * Used with LLM structured output to ensure consistent response format.
 * Fields are nullable - agent returns null when not mentioned in message.
 */
export const UserFieldsOutputSchema = z.object({
  /**
   * Raw timezone phrase extracted from the user's message
   * Examples: "east coast", "PST", "california", "new york", "pacific time"
   * Returns null if no timezone/location change was requested
   */
  timezonePhrase: z.string().nullable(),

  /**
   * Inferred preferred send hour (0-23 in 24-hour format)
   * The agent interprets natural language time expressions:
   * - "morning" → 8
   * - "early morning" → 6
   * - "afternoon" → 14
   * - "evening" / "after work" → 18
   * - "night" → 20
   * - "noon" / "lunch" → 12
   * - Explicit times: "8am" → 8, "6pm" → 18
   * Returns null if no send time change was requested
   */
  preferredSendHour: z.number().int().min(0).max(23).nullable(),

  /**
   * New name if user wants to change it
   * Detected from phrases like "call me X", "my name is X", "I go by X"
   * Returns null if no name change was requested
   */
  name: z.string().nullable(),

  /**
   * Whether any field updates were detected in the message
   * True if at least one of timezonePhrase, preferredSendHour, or name is non-null
   */
  hasUpdates: z.boolean(),

  /**
   * Brief summary of what was detected
   * Examples:
   * - "User wants to change timezone to east coast"
   * - "User wants messages at 6pm and to be called Mike"
   * - "" (empty string if no updates)
   */
  updateSummary: z.string(),
});

export type UserFieldsOutputSchemaType = z.infer<typeof UserFieldsOutputSchema>;
