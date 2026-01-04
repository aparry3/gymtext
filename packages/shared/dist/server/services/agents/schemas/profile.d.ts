import { z } from 'zod';
/**
 * Agent-Specific Profile Schemas
 *
 * These schemas are for agent output formats only.
 * Domain types (StructuredProfile, etc.) have been moved to @/server/models/profile
 */
/**
 * Zod schema for Profile Update Agent output
 */
export declare const ProfileUpdateOutputSchema: z.ZodObject<{
    updatedProfile: z.ZodString;
    wasUpdated: z.ZodBoolean;
    updateSummary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    updateSummary: string;
    updatedProfile: string;
    wasUpdated: boolean;
}, {
    updateSummary: string;
    updatedProfile: string;
    wasUpdated: boolean;
}>;
export type ProfileUpdateSchemaOutput = z.infer<typeof ProfileUpdateOutputSchema>;
/**
 * Zod schema for User Fields Agent output
 *
 * Used with LLM structured output to ensure consistent response format.
 * Fields are nullable - agent returns null when not mentioned in message.
 */
export declare const UserFieldsOutputSchema: z.ZodObject<{
    /**
     * IANA timezone from constrained enum
     * LLM picks from valid options based on user's location/timezone mention
     * Returns null if no timezone change was requested
     */
    timezone: z.ZodNullable<z.ZodEnum<["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto", "America/Vancouver", "America/Mexico_City", "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Rome", "Europe/Amsterdam", "Europe/Stockholm", "Europe/Moscow", "Asia/Tokyo", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Singapore", "Asia/Seoul", "Asia/Mumbai", "Asia/Dubai", "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland"]>>;
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
    preferredSendHour: z.ZodNullable<z.ZodNumber>;
    /**
     * New name if user wants to change it
     * Detected from phrases like "call me X", "my name is X", "I go by X"
     * Returns null if no name change was requested
     */
    name: z.ZodNullable<z.ZodString>;
    /**
     * Whether any field updates were detected in the message
     * True if at least one of timezone, preferredSendHour, or name is non-null
     */
    hasUpdates: z.ZodBoolean;
    /**
     * Brief summary of what was detected
     * Examples:
     * - "User wants to change timezone to east coast"
     * - "User wants messages at 6pm and to be called Mike"
     * - "" (empty string if no updates)
     */
    updateSummary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string | null;
    preferredSendHour: number | null;
    timezone: "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "America/Toronto" | "America/Vancouver" | "America/Mexico_City" | "America/Sao_Paulo" | "Europe/London" | "Europe/Paris" | "Europe/Berlin" | "Europe/Madrid" | "Europe/Rome" | "Europe/Amsterdam" | "Europe/Stockholm" | "Europe/Moscow" | "Asia/Tokyo" | "Asia/Shanghai" | "Asia/Hong_Kong" | "Asia/Singapore" | "Asia/Seoul" | "Asia/Mumbai" | "Asia/Dubai" | "Australia/Sydney" | "Australia/Melbourne" | "Pacific/Auckland" | null;
    hasUpdates: boolean;
    updateSummary: string;
}, {
    name: string | null;
    preferredSendHour: number | null;
    timezone: "America/New_York" | "America/Chicago" | "America/Denver" | "America/Los_Angeles" | "America/Toronto" | "America/Vancouver" | "America/Mexico_City" | "America/Sao_Paulo" | "Europe/London" | "Europe/Paris" | "Europe/Berlin" | "Europe/Madrid" | "Europe/Rome" | "Europe/Amsterdam" | "Europe/Stockholm" | "Europe/Moscow" | "Asia/Tokyo" | "Asia/Shanghai" | "Asia/Hong_Kong" | "Asia/Singapore" | "Asia/Seoul" | "Asia/Mumbai" | "Asia/Dubai" | "Australia/Sydney" | "Australia/Melbourne" | "Pacific/Auckland" | null;
    hasUpdates: boolean;
    updateSummary: string;
}>;
export type UserFieldsOutputSchemaType = z.infer<typeof UserFieldsOutputSchema>;
//# sourceMappingURL=profile.d.ts.map