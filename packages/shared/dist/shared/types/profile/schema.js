import { z } from 'zod';
/**
 * Structured Profile Schemas
 *
 * These schemas define the structured profile format extracted from the
 * Markdown dossier. Used for:
 * - LLM-extracted profile data
 * - Storing structured profile in profiles.structured JSONB column
 * - Type-safe access in repositories
 *
 * Note: This is different from FitnessProfile in user/schemas.ts which
 * is the full detailed user profile model.
 */
/**
 * Constraint with optional temporal bounds
 * Represents temporary constraints like travel, injuries with recovery time, etc.
 *
 * Named StructuredConstraint to differentiate from the more detailed
 * Constraint type in user/schemas.ts
 */
export const StructuredConstraintSchema = z.object({
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
    constraints: z.array(StructuredConstraintSchema).describe('Temporary constraints with optional start/end dates (travel, temporary injuries, etc.)'),
    /** Available equipment and gym access info */
    equipmentAccess: z.array(z.string()).describe('Equipment access including gym type, available equipment, and limitations'),
});
