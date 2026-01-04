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
export declare const StructuredConstraintSchema: z.ZodObject<{
    value: z.ZodString;
    start: z.ZodNullable<z.ZodString>;
    end: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: string;
    start: string | null;
    end: string | null;
}, {
    value: string;
    start: string | null;
    end: string | null;
}>;
/**
 * Experience level enum
 */
export declare const ExperienceLevelSchema: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
/**
 * Main structured profile schema
 * A simplified, flat representation of the user's fitness profile
 * extracted from the Markdown dossier
 */
export declare const StructuredProfileSchema: z.ZodObject<{
    /** User's fitness goals extracted from profile */
    goals: z.ZodArray<z.ZodString, "many">;
    /** User's experience level if stated */
    experienceLevel: z.ZodNullable<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    /** Exercise, scheduling, and workout style preferences */
    preferences: z.ZodArray<z.ZodString, "many">;
    /** Permanent physical limitations or injuries */
    injuries: z.ZodArray<z.ZodString, "many">;
    /** Temporary constraints with optional date bounds */
    constraints: z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        start: z.ZodNullable<z.ZodString>;
        end: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        start: string | null;
        end: string | null;
    }, {
        value: string;
        start: string | null;
        end: string | null;
    }>, "many">;
    /** Available equipment and gym access info */
    equipmentAccess: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    goals: string[];
    experienceLevel: "beginner" | "intermediate" | "advanced" | null;
    equipmentAccess: string[];
    constraints: {
        value: string;
        start: string | null;
        end: string | null;
    }[];
    preferences: string[];
    injuries: string[];
}, {
    goals: string[];
    experienceLevel: "beginner" | "intermediate" | "advanced" | null;
    equipmentAccess: string[];
    constraints: {
        value: string;
        start: string | null;
        end: string | null;
    }[];
    preferences: string[];
    injuries: string[];
}>;
export type StructuredProfile = z.infer<typeof StructuredProfileSchema>;
export type StructuredConstraint = z.infer<typeof StructuredConstraintSchema>;
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;
//# sourceMappingURL=schema.d.ts.map