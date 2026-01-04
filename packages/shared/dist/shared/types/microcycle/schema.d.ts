import { z } from "zod";
/**
 * Activity type enum for microcycle days
 */
export declare const ActivityTypeEnum: z.ZodEnum<["TRAINING", "ACTIVE_RECOVERY", "REST"]>;
export type ActivityType = z.infer<typeof ActivityTypeEnum>;
/**
 * Individual day within a microcycle
 */
export declare const MicrocycleDaySchema: z.ZodObject<{
    day: z.ZodEnum<["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]>;
    focus: z.ZodDefault<z.ZodString>;
    activityType: z.ZodDefault<z.ZodEnum<["TRAINING", "ACTIVE_RECOVERY", "REST"]>>;
    notes: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    focus: string;
    activityType: "TRAINING" | "ACTIVE_RECOVERY" | "REST";
    notes: string;
}, {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    focus?: string | undefined;
    activityType?: "TRAINING" | "ACTIVE_RECOVERY" | "REST" | undefined;
    notes?: string | undefined;
}>;
/**
 * Complete microcycle structure (weekly rhythm)
 */
export declare const MicrocycleStructureSchema: z.ZodObject<{
    weekNumber: z.ZodDefault<z.ZodNumber>;
    phase: z.ZodDefault<z.ZodString>;
    overview: z.ZodDefault<z.ZodString>;
    days: z.ZodArray<z.ZodObject<{
        day: z.ZodEnum<["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]>;
        focus: z.ZodDefault<z.ZodString>;
        activityType: z.ZodDefault<z.ZodEnum<["TRAINING", "ACTIVE_RECOVERY", "REST"]>>;
        notes: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
        focus: string;
        activityType: "TRAINING" | "ACTIVE_RECOVERY" | "REST";
        notes: string;
    }, {
        day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
        focus?: string | undefined;
        activityType?: "TRAINING" | "ACTIVE_RECOVERY" | "REST" | undefined;
        notes?: string | undefined;
    }>, "many">;
    isDeload: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    weekNumber: number;
    phase: string;
    overview: string;
    days: {
        day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
        focus: string;
        activityType: "TRAINING" | "ACTIVE_RECOVERY" | "REST";
        notes: string;
    }[];
    isDeload: boolean;
}, {
    days: {
        day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
        focus?: string | undefined;
        activityType?: "TRAINING" | "ACTIVE_RECOVERY" | "REST" | undefined;
        notes?: string | undefined;
    }[];
    weekNumber?: number | undefined;
    phase?: string | undefined;
    overview?: string | undefined;
    isDeload?: boolean | undefined;
}>;
export type MicrocycleStructure = z.infer<typeof MicrocycleStructureSchema>;
export type MicrocycleDay = z.infer<typeof MicrocycleDaySchema>;
/**
 * Schema for microcycle generation output
 *
 * Simplified structure:
 * - overview: Description of the week's focus and goals
 * - isDeload: Whether this is a deload week
 * - days: Array of 7 day descriptions (strings)
 */
export declare const _MicrocycleGenerationSchema: z.ZodObject<{
    overview: z.ZodString;
    isDeload: z.ZodDefault<z.ZodBoolean>;
    days: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    overview: string;
    days: string[];
    isDeload: boolean;
}, {
    overview: string;
    days: string[];
    isDeload?: boolean | undefined;
}>;
export type MicrocycleGenerationOutput = z.infer<typeof _MicrocycleGenerationSchema>;
/**
 * Full microcycle pattern
 */
export interface MicrocyclePattern {
    overview: string;
    isDeload: boolean;
    days: string[];
    message?: string;
}
/**
 * Updated microcycle pattern with modification tracking
 */
export interface UpdatedMicrocyclePattern extends MicrocyclePattern {
    modificationsApplied?: string[];
}
//# sourceMappingURL=schema.d.ts.map