import { z } from "zod";
/**
 * Workout Structure Schemas
 *
 * These schemas define the structured workout format used for:
 * - LLM-generated workout outputs
 * - UI rendering of workout details
 * - Storing structured workout data
 */
/**
 * Intensity descriptor for exercises
 * Default values used to ensure no nulls reach the UI.
 */
export declare const IntensitySchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<["RPE", "RIR", "Percentage", "Zone", "HeartRate", "Pace", "Other"]>>;
    value: z.ZodDefault<z.ZodString>;
    description: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: string;
    type: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace";
    description: string;
}, {
    value?: string | undefined;
    type?: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace" | undefined;
    description?: string | undefined;
}>;
/**
 * Individual workout activity/exercise
 * Flexible schema for Lifting, Cardio, and Hybrid sessions.
 */
export declare const WorkoutActivitySchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodString>;
    name: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["Strength", "Cardio", "Plyometric", "Mobility", "Rest", "Other"]>>;
    sets: z.ZodDefault<z.ZodString>;
    reps: z.ZodDefault<z.ZodString>;
    duration: z.ZodDefault<z.ZodString>;
    distance: z.ZodDefault<z.ZodString>;
    rest: z.ZodDefault<z.ZodString>;
    intensity: z.ZodDefault<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["RPE", "RIR", "Percentage", "Zone", "HeartRate", "Pace", "Other"]>>;
        value: z.ZodDefault<z.ZodString>;
        description: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace";
        description: string;
    }, {
        value?: string | undefined;
        type?: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace" | undefined;
        description?: string | undefined;
    }>>;
    tempo: z.ZodDefault<z.ZodString>;
    notes: z.ZodDefault<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    supersetId: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other";
    name: string;
    id: string;
    duration: string;
    notes: string;
    tags: string[];
    sets: string;
    reps: string;
    distance: string;
    rest: string;
    intensity: {
        value: string;
        type: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace";
        description: string;
    };
    tempo: string;
    supersetId: string;
}, {
    name: string;
    type?: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other" | undefined;
    id?: string | undefined;
    duration?: string | undefined;
    notes?: string | undefined;
    tags?: string[] | undefined;
    sets?: string | undefined;
    reps?: string | undefined;
    distance?: string | undefined;
    rest?: string | undefined;
    intensity?: {
        value?: string | undefined;
        type?: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace" | undefined;
        description?: string | undefined;
    } | undefined;
    tempo?: string | undefined;
    supersetId?: string | undefined;
}>;
/**
 * Section of a workout (e.g., Warm Up, Main Lift, Cooldown)
 */
export declare const WorkoutSectionSchema: z.ZodObject<{
    title: z.ZodString;
    overview: z.ZodDefault<z.ZodString>;
    exercises: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodDefault<z.ZodString>;
        name: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["Strength", "Cardio", "Plyometric", "Mobility", "Rest", "Other"]>>;
        sets: z.ZodDefault<z.ZodString>;
        reps: z.ZodDefault<z.ZodString>;
        duration: z.ZodDefault<z.ZodString>;
        distance: z.ZodDefault<z.ZodString>;
        rest: z.ZodDefault<z.ZodString>;
        intensity: z.ZodDefault<z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<["RPE", "RIR", "Percentage", "Zone", "HeartRate", "Pace", "Other"]>>;
            value: z.ZodDefault<z.ZodString>;
            description: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace";
            description: string;
        }, {
            value?: string | undefined;
            type?: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace" | undefined;
            description?: string | undefined;
        }>>;
        tempo: z.ZodDefault<z.ZodString>;
        notes: z.ZodDefault<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        supersetId: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other";
        name: string;
        id: string;
        duration: string;
        notes: string;
        tags: string[];
        sets: string;
        reps: string;
        distance: string;
        rest: string;
        intensity: {
            value: string;
            type: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace";
            description: string;
        };
        tempo: string;
        supersetId: string;
    }, {
        name: string;
        type?: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other" | undefined;
        id?: string | undefined;
        duration?: string | undefined;
        notes?: string | undefined;
        tags?: string[] | undefined;
        sets?: string | undefined;
        reps?: string | undefined;
        distance?: string | undefined;
        rest?: string | undefined;
        intensity?: {
            value?: string | undefined;
            type?: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace" | undefined;
            description?: string | undefined;
        } | undefined;
        tempo?: string | undefined;
        supersetId?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    overview: string;
    exercises: {
        type: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other";
        name: string;
        id: string;
        duration: string;
        notes: string;
        tags: string[];
        sets: string;
        reps: string;
        distance: string;
        rest: string;
        intensity: {
            value: string;
            type: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace";
            description: string;
        };
        tempo: string;
        supersetId: string;
    }[];
}, {
    title: string;
    overview?: string | undefined;
    exercises?: {
        name: string;
        type?: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other" | undefined;
        id?: string | undefined;
        duration?: string | undefined;
        notes?: string | undefined;
        tags?: string[] | undefined;
        sets?: string | undefined;
        reps?: string | undefined;
        distance?: string | undefined;
        rest?: string | undefined;
        intensity?: {
            value?: string | undefined;
            type?: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace" | undefined;
            description?: string | undefined;
        } | undefined;
        tempo?: string | undefined;
        supersetId?: string | undefined;
    }[] | undefined;
}>;
/**
 * Complete workout structure
 */
export declare const WorkoutStructureSchema: z.ZodObject<{
    title: z.ZodString;
    focus: z.ZodDefault<z.ZodString>;
    description: z.ZodDefault<z.ZodString>;
    quote: z.ZodDefault<z.ZodObject<{
        text: z.ZodDefault<z.ZodString>;
        author: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        author: string;
    }, {
        text?: string | undefined;
        author?: string | undefined;
    }>>;
    sections: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        overview: z.ZodDefault<z.ZodString>;
        exercises: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodDefault<z.ZodString>;
            name: z.ZodString;
            type: z.ZodDefault<z.ZodEnum<["Strength", "Cardio", "Plyometric", "Mobility", "Rest", "Other"]>>;
            sets: z.ZodDefault<z.ZodString>;
            reps: z.ZodDefault<z.ZodString>;
            duration: z.ZodDefault<z.ZodString>;
            distance: z.ZodDefault<z.ZodString>;
            rest: z.ZodDefault<z.ZodString>;
            intensity: z.ZodDefault<z.ZodObject<{
                type: z.ZodDefault<z.ZodEnum<["RPE", "RIR", "Percentage", "Zone", "HeartRate", "Pace", "Other"]>>;
                value: z.ZodDefault<z.ZodString>;
                description: z.ZodDefault<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                value: string;
                type: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace";
                description: string;
            }, {
                value?: string | undefined;
                type?: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace" | undefined;
                description?: string | undefined;
            }>>;
            tempo: z.ZodDefault<z.ZodString>;
            notes: z.ZodDefault<z.ZodString>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            supersetId: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other";
            name: string;
            id: string;
            duration: string;
            notes: string;
            tags: string[];
            sets: string;
            reps: string;
            distance: string;
            rest: string;
            intensity: {
                value: string;
                type: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace";
                description: string;
            };
            tempo: string;
            supersetId: string;
        }, {
            name: string;
            type?: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other" | undefined;
            id?: string | undefined;
            duration?: string | undefined;
            notes?: string | undefined;
            tags?: string[] | undefined;
            sets?: string | undefined;
            reps?: string | undefined;
            distance?: string | undefined;
            rest?: string | undefined;
            intensity?: {
                value?: string | undefined;
                type?: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace" | undefined;
                description?: string | undefined;
            } | undefined;
            tempo?: string | undefined;
            supersetId?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        overview: string;
        exercises: {
            type: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other";
            name: string;
            id: string;
            duration: string;
            notes: string;
            tags: string[];
            sets: string;
            reps: string;
            distance: string;
            rest: string;
            intensity: {
                value: string;
                type: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace";
                description: string;
            };
            tempo: string;
            supersetId: string;
        }[];
    }, {
        title: string;
        overview?: string | undefined;
        exercises?: {
            name: string;
            type?: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other" | undefined;
            id?: string | undefined;
            duration?: string | undefined;
            notes?: string | undefined;
            tags?: string[] | undefined;
            sets?: string | undefined;
            reps?: string | undefined;
            distance?: string | undefined;
            rest?: string | undefined;
            intensity?: {
                value?: string | undefined;
                type?: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace" | undefined;
                description?: string | undefined;
            } | undefined;
            tempo?: string | undefined;
            supersetId?: string | undefined;
        }[] | undefined;
    }>, "many">>;
    estimatedDurationMin: z.ZodDefault<z.ZodNumber>;
    intensityLevel: z.ZodDefault<z.ZodEnum<["Low", "Moderate", "High", "Severe"]>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    focus: string;
    quote: {
        text: string;
        author: string;
    };
    sections: {
        title: string;
        overview: string;
        exercises: {
            type: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other";
            name: string;
            id: string;
            duration: string;
            notes: string;
            tags: string[];
            sets: string;
            reps: string;
            distance: string;
            rest: string;
            intensity: {
                value: string;
                type: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace";
                description: string;
            };
            tempo: string;
            supersetId: string;
        }[];
    }[];
    estimatedDurationMin: number;
    intensityLevel: "Low" | "Moderate" | "High" | "Severe";
}, {
    title: string;
    description?: string | undefined;
    focus?: string | undefined;
    quote?: {
        text?: string | undefined;
        author?: string | undefined;
    } | undefined;
    sections?: {
        title: string;
        overview?: string | undefined;
        exercises?: {
            name: string;
            type?: "Strength" | "Cardio" | "Plyometric" | "Mobility" | "Rest" | "Other" | undefined;
            id?: string | undefined;
            duration?: string | undefined;
            notes?: string | undefined;
            tags?: string[] | undefined;
            sets?: string | undefined;
            reps?: string | undefined;
            distance?: string | undefined;
            rest?: string | undefined;
            intensity?: {
                value?: string | undefined;
                type?: "Other" | "RPE" | "RIR" | "Percentage" | "Zone" | "HeartRate" | "Pace" | undefined;
                description?: string | undefined;
            } | undefined;
            tempo?: string | undefined;
            supersetId?: string | undefined;
        }[] | undefined;
    }[] | undefined;
    estimatedDurationMin?: number | undefined;
    intensityLevel?: "Low" | "Moderate" | "High" | "Severe" | undefined;
}>;
export type WorkoutStructure = z.infer<typeof WorkoutStructureSchema>;
export type WorkoutActivity = z.infer<typeof WorkoutActivitySchema>;
export type WorkoutSection = z.infer<typeof WorkoutSectionSchema>;
export type Intensity = z.infer<typeof IntensitySchema>;
//# sourceMappingURL=workoutStructure.d.ts.map