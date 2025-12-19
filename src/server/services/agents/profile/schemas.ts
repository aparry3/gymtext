import { z } from 'zod';
import { COMMON_TIMEZONES } from '@/shared/utils/timezone';

// =============================================================================
// Profile Update Agent Schema
// =============================================================================

/**
 * Zod schema for Profile Update Agent output
 */
export const ProfileUpdateOutputSchema = z.object({
  updatedProfile: z.string().describe('The complete updated Markdown profile document'),
  wasUpdated: z.boolean().describe('Whether any changes were made to the profile'),
  updateSummary: z.string().describe('Brief summary of changes made. Empty string if nothing was updated.'),
});

export type ProfileUpdateSchemaOutput = z.infer<typeof ProfileUpdateOutputSchema>;

// =============================================================================
// User Fields Agent Schema
// =============================================================================

/**
 * Zod schema for User Fields Agent output
 *
 * Used with LLM structured output to ensure consistent response format.
 * Fields are nullable - agent returns null when not mentioned in message.
 */
export const UserFieldsOutputSchema = z.object({
  /**
   * IANA timezone from constrained enum
   * LLM picks from valid options based on user's location/timezone mention
   * Returns null if no timezone change was requested
   */
  timezone: z.enum(COMMON_TIMEZONES).nullable(),

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
   * True if at least one of timezone, preferredSendHour, or name is non-null
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

// =============================================================================
// Structured Profile Agent Schema
// =============================================================================

/**
 * Constraint with optional temporal bounds
 * Represents temporary constraints like travel, injuries with recovery time, etc.
 */
export const ConstraintSchema = z.object({
  value: z.string().describe('Description of the constraint (injury, travel, temporary limitation, etc.)'),
  start: z.string().nullable().describe('ISO date string when constraint started, or null if permanent/unknown'),
  end: z.string().nullable().describe('ISO date string when constraint ends, or null if ongoing/permanent'),
});

/**
 * Experience level enum
 */
export const ExperienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

/**
 * Main structured profile schema
 * A simplified, flat representation of the user's fitness profile
 * extracted from the Markdown dossier
 */
export const StructuredProfileSchema = z.object({
  /** User's fitness goals extracted from profile */
  goals: z.array(z.string()).describe("User's stated fitness goals"),

  /** User's experience level if stated */
  experienceLevel: ExperienceLevelSchema.nullable().describe("User's experience level (beginner, intermediate, advanced) or null if not stated"),

  /** Exercise, scheduling, and workout style preferences */
  preferences: z.array(z.string()).describe('Preferences including exercise likes/dislikes, scheduling preferences, and workout style preferences'),

  /** Permanent physical limitations or injuries */
  injuries: z.array(z.string()).describe('Permanent physical limitations or chronic injuries'),

  /** Temporary constraints with optional date bounds */
  constraints: z.array(ConstraintSchema).describe('Temporary constraints with optional start/end dates (travel, temporary injuries, etc.)'),

  /** Available equipment and gym access info */
  equipmentAccess: z.array(z.string()).describe('Equipment access including gym type, available equipment, and limitations'),
});

export type StructuredProfile = z.infer<typeof StructuredProfileSchema>;
export type Constraint = z.infer<typeof ConstraintSchema>;
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;
