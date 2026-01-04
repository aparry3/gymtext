import { z } from 'zod';
/**
 * Formatted Workout Schema
 *
 * Replaces complex JSON schemas with a simple formatted text output.
 * See _claude_docs/workouts/WORKOUT_FORMAT_SPEC.md for format specification.
 */
export declare const FormattedWorkoutSchema: z.ZodObject<{
    formatted: z.ZodString;
}, "strict", z.ZodTypeAny, {
    formatted: string;
}, {
    formatted: string;
}>;
export type FormattedWorkout = z.infer<typeof FormattedWorkoutSchema>;
/**
 * Enhanced workout with formatted text
 */
export declare const EnhancedFormattedWorkoutSchema: z.ZodObject<{
    formatted: z.ZodString;
} & {
    theme: z.ZodString;
}, "strict", z.ZodTypeAny, {
    theme: string;
    formatted: string;
}, {
    theme: string;
    formatted: string;
}>;
export type EnhancedFormattedWorkout = z.infer<typeof EnhancedFormattedWorkoutSchema>;
/**
 * Updated workout with modifications tracking
 */
export declare const UpdatedFormattedWorkoutSchema: z.ZodObject<{
    formatted: z.ZodString;
} & {
    theme: z.ZodString;
} & {
    modificationsApplied: z.ZodArray<z.ZodString, "many">;
}, "strict", z.ZodTypeAny, {
    theme: string;
    formatted: string;
    modificationsApplied: string[];
}, {
    theme: string;
    formatted: string;
    modificationsApplied: string[];
}>;
export type UpdatedFormattedWorkout = z.infer<typeof UpdatedFormattedWorkoutSchema>;
//# sourceMappingURL=formattedSchema.d.ts.map