import { z } from "zod";
/**
 * Schedule template for weekly rhythm
 */
export declare const PlanScheduleTemplateSchema: z.ZodArray<z.ZodObject<{
    day: z.ZodString;
    focus: z.ZodDefault<z.ZodString>;
    rationale: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    day: string;
    focus: string;
    rationale: string;
}, {
    day: string;
    focus?: string | undefined;
    rationale?: string | undefined;
}>, "many">;
/**
 * Complete plan structure (program blueprint)
 */
export declare const PlanStructureSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodDefault<z.ZodString>;
    coreStrategy: z.ZodDefault<z.ZodString>;
    progressionStrategy: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    adjustmentStrategy: z.ZodDefault<z.ZodString>;
    conditioning: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    scheduleTemplate: z.ZodDefault<z.ZodArray<z.ZodObject<{
        day: z.ZodString;
        focus: z.ZodDefault<z.ZodString>;
        rationale: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        day: string;
        focus: string;
        rationale: string;
    }, {
        day: string;
        focus?: string | undefined;
        rationale?: string | undefined;
    }>, "many">>;
    durationWeeks: z.ZodDefault<z.ZodNumber>;
    frequencyPerWeek: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: string;
    name: string;
    coreStrategy: string;
    progressionStrategy: string[];
    adjustmentStrategy: string;
    conditioning: string[];
    scheduleTemplate: {
        day: string;
        focus: string;
        rationale: string;
    }[];
    durationWeeks: number;
    frequencyPerWeek: number;
}, {
    name: string;
    type?: string | undefined;
    coreStrategy?: string | undefined;
    progressionStrategy?: string[] | undefined;
    adjustmentStrategy?: string | undefined;
    conditioning?: string[] | undefined;
    scheduleTemplate?: {
        day: string;
        focus?: string | undefined;
        rationale?: string | undefined;
    }[] | undefined;
    durationWeeks?: number | undefined;
    frequencyPerWeek?: number | undefined;
}>;
export type PlanStructure = z.infer<typeof PlanStructureSchema>;
export declare const _FitnessPlanSchema: z.ZodObject<{
    description: z.ZodString;
    message: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    message?: string | null | undefined;
}, {
    description: string;
    message?: string | null | undefined;
}>;
export type FitnessPlanSchemaType = z.infer<typeof _FitnessPlanSchema>;
//# sourceMappingURL=schema.d.ts.map