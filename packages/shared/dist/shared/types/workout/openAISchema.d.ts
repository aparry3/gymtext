import { z } from "zod";
export declare const _WorkoutBlockItemSchema: z.ZodObject<{
    type: z.ZodEnum<["prep", "compound", "secondary", "accessory", "core", "cardio", "cooldown"]>;
    exercise: z.ZodString;
    sets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    reps: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    durationSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    durationMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    RPE: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rir: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    percentageRM: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    restSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    restText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    equipment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    pattern: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tempo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cues: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    tags: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
    exercise: string;
    pattern?: string | null | undefined;
    notes?: string | null | undefined;
    tags?: string[] | null | undefined;
    equipment?: string | null | undefined;
    sets?: number | null | undefined;
    reps?: string | null | undefined;
    RPE?: number | null | undefined;
    tempo?: string | null | undefined;
    durationMin?: number | null | undefined;
    durationSec?: number | null | undefined;
    rir?: number | null | undefined;
    percentageRM?: number | null | undefined;
    restSec?: number | null | undefined;
    restText?: string | null | undefined;
    cues?: string[] | null | undefined;
}, {
    type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
    exercise: string;
    pattern?: string | null | undefined;
    notes?: string | null | undefined;
    tags?: string[] | null | undefined;
    equipment?: string | null | undefined;
    sets?: number | null | undefined;
    reps?: string | null | undefined;
    RPE?: number | null | undefined;
    tempo?: string | null | undefined;
    durationMin?: number | null | undefined;
    durationSec?: number | null | undefined;
    rir?: number | null | undefined;
    percentageRM?: number | null | undefined;
    restSec?: number | null | undefined;
    restText?: string | null | undefined;
    cues?: string[] | null | undefined;
}>;
export declare const _WorkoutWorkItemSchema: z.ZodObject<{
    structureType: z.ZodDefault<z.ZodEnum<["straight", "superset", "circuit"]>>;
    exercises: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["prep", "compound", "secondary", "accessory", "core", "cardio", "cooldown"]>;
        exercise: z.ZodString;
        sets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        reps: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        durationSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        durationMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        RPE: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rir: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        percentageRM: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        restSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        restText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        equipment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        pattern: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        tempo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        cues: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        tags: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strict", z.ZodTypeAny, {
        type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
        exercise: string;
        pattern?: string | null | undefined;
        notes?: string | null | undefined;
        tags?: string[] | null | undefined;
        equipment?: string | null | undefined;
        sets?: number | null | undefined;
        reps?: string | null | undefined;
        RPE?: number | null | undefined;
        tempo?: string | null | undefined;
        durationMin?: number | null | undefined;
        durationSec?: number | null | undefined;
        rir?: number | null | undefined;
        percentageRM?: number | null | undefined;
        restSec?: number | null | undefined;
        restText?: string | null | undefined;
        cues?: string[] | null | undefined;
    }, {
        type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
        exercise: string;
        pattern?: string | null | undefined;
        notes?: string | null | undefined;
        tags?: string[] | null | undefined;
        equipment?: string | null | undefined;
        sets?: number | null | undefined;
        reps?: string | null | undefined;
        RPE?: number | null | undefined;
        tempo?: string | null | undefined;
        durationMin?: number | null | undefined;
        durationSec?: number | null | undefined;
        rir?: number | null | undefined;
        percentageRM?: number | null | undefined;
        restSec?: number | null | undefined;
        restText?: string | null | undefined;
        cues?: string[] | null | undefined;
    }>, "many">;
    restBetweenExercisesSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    restAfterSetSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rounds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    exercises: {
        type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
        exercise: string;
        pattern?: string | null | undefined;
        notes?: string | null | undefined;
        tags?: string[] | null | undefined;
        equipment?: string | null | undefined;
        sets?: number | null | undefined;
        reps?: string | null | undefined;
        RPE?: number | null | undefined;
        tempo?: string | null | undefined;
        durationMin?: number | null | undefined;
        durationSec?: number | null | undefined;
        rir?: number | null | undefined;
        percentageRM?: number | null | undefined;
        restSec?: number | null | undefined;
        restText?: string | null | undefined;
        cues?: string[] | null | undefined;
    }[];
    structureType: "straight" | "superset" | "circuit";
    notes?: string | null | undefined;
    restBetweenExercisesSec?: number | null | undefined;
    restAfterSetSec?: number | null | undefined;
    rounds?: number | null | undefined;
}, {
    exercises: {
        type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
        exercise: string;
        pattern?: string | null | undefined;
        notes?: string | null | undefined;
        tags?: string[] | null | undefined;
        equipment?: string | null | undefined;
        sets?: number | null | undefined;
        reps?: string | null | undefined;
        RPE?: number | null | undefined;
        tempo?: string | null | undefined;
        durationMin?: number | null | undefined;
        durationSec?: number | null | undefined;
        rir?: number | null | undefined;
        percentageRM?: number | null | undefined;
        restSec?: number | null | undefined;
        restText?: string | null | undefined;
        cues?: string[] | null | undefined;
    }[];
    notes?: string | null | undefined;
    structureType?: "straight" | "superset" | "circuit" | undefined;
    restBetweenExercisesSec?: number | null | undefined;
    restAfterSetSec?: number | null | undefined;
    rounds?: number | null | undefined;
}>;
export declare const _WorkoutBlockSchema: z.ZodObject<{
    name: z.ZodString;
    goal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    durationMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    work: z.ZodArray<z.ZodObject<{
        structureType: z.ZodDefault<z.ZodEnum<["straight", "superset", "circuit"]>>;
        exercises: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["prep", "compound", "secondary", "accessory", "core", "cardio", "cooldown"]>;
            exercise: z.ZodString;
            sets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            reps: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            durationSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            durationMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            RPE: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rir: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            percentageRM: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            restSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            restText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            equipment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            pattern: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            tempo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            cues: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            tags: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strict", z.ZodTypeAny, {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            exercise: string;
            pattern?: string | null | undefined;
            notes?: string | null | undefined;
            tags?: string[] | null | undefined;
            equipment?: string | null | undefined;
            sets?: number | null | undefined;
            reps?: string | null | undefined;
            RPE?: number | null | undefined;
            tempo?: string | null | undefined;
            durationMin?: number | null | undefined;
            durationSec?: number | null | undefined;
            rir?: number | null | undefined;
            percentageRM?: number | null | undefined;
            restSec?: number | null | undefined;
            restText?: string | null | undefined;
            cues?: string[] | null | undefined;
        }, {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            exercise: string;
            pattern?: string | null | undefined;
            notes?: string | null | undefined;
            tags?: string[] | null | undefined;
            equipment?: string | null | undefined;
            sets?: number | null | undefined;
            reps?: string | null | undefined;
            RPE?: number | null | undefined;
            tempo?: string | null | undefined;
            durationMin?: number | null | undefined;
            durationSec?: number | null | undefined;
            rir?: number | null | undefined;
            percentageRM?: number | null | undefined;
            restSec?: number | null | undefined;
            restText?: string | null | undefined;
            cues?: string[] | null | undefined;
        }>, "many">;
        restBetweenExercisesSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        restAfterSetSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rounds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strict", z.ZodTypeAny, {
        exercises: {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            exercise: string;
            pattern?: string | null | undefined;
            notes?: string | null | undefined;
            tags?: string[] | null | undefined;
            equipment?: string | null | undefined;
            sets?: number | null | undefined;
            reps?: string | null | undefined;
            RPE?: number | null | undefined;
            tempo?: string | null | undefined;
            durationMin?: number | null | undefined;
            durationSec?: number | null | undefined;
            rir?: number | null | undefined;
            percentageRM?: number | null | undefined;
            restSec?: number | null | undefined;
            restText?: string | null | undefined;
            cues?: string[] | null | undefined;
        }[];
        structureType: "straight" | "superset" | "circuit";
        notes?: string | null | undefined;
        restBetweenExercisesSec?: number | null | undefined;
        restAfterSetSec?: number | null | undefined;
        rounds?: number | null | undefined;
    }, {
        exercises: {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            exercise: string;
            pattern?: string | null | undefined;
            notes?: string | null | undefined;
            tags?: string[] | null | undefined;
            equipment?: string | null | undefined;
            sets?: number | null | undefined;
            reps?: string | null | undefined;
            RPE?: number | null | undefined;
            tempo?: string | null | undefined;
            durationMin?: number | null | undefined;
            durationSec?: number | null | undefined;
            rir?: number | null | undefined;
            percentageRM?: number | null | undefined;
            restSec?: number | null | undefined;
            restText?: string | null | undefined;
            cues?: string[] | null | undefined;
        }[];
        notes?: string | null | undefined;
        structureType?: "straight" | "superset" | "circuit" | undefined;
        restBetweenExercisesSec?: number | null | undefined;
        restAfterSetSec?: number | null | undefined;
        rounds?: number | null | undefined;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    name: string;
    work: {
        exercises: {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            exercise: string;
            pattern?: string | null | undefined;
            notes?: string | null | undefined;
            tags?: string[] | null | undefined;
            equipment?: string | null | undefined;
            sets?: number | null | undefined;
            reps?: string | null | undefined;
            RPE?: number | null | undefined;
            tempo?: string | null | undefined;
            durationMin?: number | null | undefined;
            durationSec?: number | null | undefined;
            rir?: number | null | undefined;
            percentageRM?: number | null | undefined;
            restSec?: number | null | undefined;
            restText?: string | null | undefined;
            cues?: string[] | null | undefined;
        }[];
        structureType: "straight" | "superset" | "circuit";
        notes?: string | null | undefined;
        restBetweenExercisesSec?: number | null | undefined;
        restAfterSetSec?: number | null | undefined;
        rounds?: number | null | undefined;
    }[];
    goal?: string | null | undefined;
    notes?: string | null | undefined;
    durationMin?: number | null | undefined;
}, {
    name: string;
    work: {
        exercises: {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            exercise: string;
            pattern?: string | null | undefined;
            notes?: string | null | undefined;
            tags?: string[] | null | undefined;
            equipment?: string | null | undefined;
            sets?: number | null | undefined;
            reps?: string | null | undefined;
            RPE?: number | null | undefined;
            tempo?: string | null | undefined;
            durationMin?: number | null | undefined;
            durationSec?: number | null | undefined;
            rir?: number | null | undefined;
            percentageRM?: number | null | undefined;
            restSec?: number | null | undefined;
            restText?: string | null | undefined;
            cues?: string[] | null | undefined;
        }[];
        notes?: string | null | undefined;
        structureType?: "straight" | "superset" | "circuit" | undefined;
        restBetweenExercisesSec?: number | null | undefined;
        restAfterSetSec?: number | null | undefined;
        rounds?: number | null | undefined;
    }[];
    goal?: string | null | undefined;
    notes?: string | null | undefined;
    durationMin?: number | null | undefined;
}>;
export declare const _WorkoutModificationSchema: z.ZodObject<{
    condition: z.ZodString;
    replace: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        exercise: z.ZodString;
        with: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        with: string;
        exercise: string;
    }, {
        with: string;
        exercise: string;
    }>>>;
    adjustment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    note: z.ZodString;
}, "strict", z.ZodTypeAny, {
    condition: string;
    note: string;
    replace?: {
        with: string;
        exercise: string;
    } | null | undefined;
    adjustment?: string | null | undefined;
}, {
    condition: string;
    note: string;
    replace?: {
        with: string;
        exercise: string;
    } | null | undefined;
    adjustment?: string | null | undefined;
}>;
export declare const _WorkoutSessionContextSchema: z.ZodOptional<z.ZodNullable<z.ZodObject<{
    phaseName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    weekNumber: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    dayIndex: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    goal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    durationEstimateMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    environment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    clientConstraints: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        timeAvailable: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        equipmentAvailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        injuries: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        preferences: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        equipmentAvailable?: string[] | null | undefined;
        preferences?: string[] | null | undefined;
        injuries?: string[] | null | undefined;
        timeAvailable?: number | null | undefined;
    }, {
        equipmentAvailable?: string[] | null | undefined;
        preferences?: string[] | null | undefined;
        injuries?: string[] | null | undefined;
        timeAvailable?: number | null | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    goal?: string | null | undefined;
    weekNumber?: number | null | undefined;
    environment?: string | null | undefined;
    phaseName?: string | null | undefined;
    dayIndex?: number | null | undefined;
    durationEstimateMin?: number | null | undefined;
    clientConstraints?: {
        equipmentAvailable?: string[] | null | undefined;
        preferences?: string[] | null | undefined;
        injuries?: string[] | null | undefined;
        timeAvailable?: number | null | undefined;
    } | null | undefined;
}, {
    goal?: string | null | undefined;
    weekNumber?: number | null | undefined;
    environment?: string | null | undefined;
    phaseName?: string | null | undefined;
    dayIndex?: number | null | undefined;
    durationEstimateMin?: number | null | undefined;
    clientConstraints?: {
        equipmentAvailable?: string[] | null | undefined;
        preferences?: string[] | null | undefined;
        injuries?: string[] | null | undefined;
        timeAvailable?: number | null | undefined;
    } | null | undefined;
}>>>;
export declare const _WorkoutTargetMetricsSchema: z.ZodOptional<z.ZodNullable<z.ZodObject<{
    totalVolume: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    totalReps: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    totalSets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    totalDuration: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    averageRPE: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    averageIntensity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    totalVolume?: number | null | undefined;
    totalReps?: number | null | undefined;
    totalSets?: number | null | undefined;
    totalDuration?: number | null | undefined;
    averageRPE?: number | null | undefined;
    averageIntensity?: number | null | undefined;
}, {
    totalVolume?: number | null | undefined;
    totalReps?: number | null | undefined;
    totalSets?: number | null | undefined;
    totalDuration?: number | null | undefined;
    averageRPE?: number | null | undefined;
    averageIntensity?: number | null | undefined;
}>>>;
export declare const _WorkoutSummarySchema: z.ZodOptional<z.ZodNullable<z.ZodObject<{
    adaptations: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    coachingNotes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    progressionNotes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    recoveryFocus: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    adaptations?: string[] | null | undefined;
    coachingNotes?: string | null | undefined;
    progressionNotes?: string | null | undefined;
    recoveryFocus?: string | null | undefined;
}, {
    adaptations?: string[] | null | undefined;
    coachingNotes?: string | null | undefined;
    progressionNotes?: string | null | undefined;
    recoveryFocus?: string | null | undefined;
}>>>;
export declare const _EnhancedWorkoutInstanceSchema: z.ZodObject<{
    theme: z.ZodString;
    sessionContext: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        phaseName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        weekNumber: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        dayIndex: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        goal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        durationEstimateMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        environment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        clientConstraints: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            timeAvailable: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            equipmentAvailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            injuries: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            preferences: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        }, {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        goal?: string | null | undefined;
        weekNumber?: number | null | undefined;
        environment?: string | null | undefined;
        phaseName?: string | null | undefined;
        dayIndex?: number | null | undefined;
        durationEstimateMin?: number | null | undefined;
        clientConstraints?: {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        } | null | undefined;
    }, {
        goal?: string | null | undefined;
        weekNumber?: number | null | undefined;
        environment?: string | null | undefined;
        phaseName?: string | null | undefined;
        dayIndex?: number | null | undefined;
        durationEstimateMin?: number | null | undefined;
        clientConstraints?: {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        } | null | undefined;
    }>>>;
    blocks: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        goal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        durationMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        work: z.ZodArray<z.ZodObject<{
            structureType: z.ZodDefault<z.ZodEnum<["straight", "superset", "circuit"]>>;
            exercises: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["prep", "compound", "secondary", "accessory", "core", "cardio", "cooldown"]>;
                exercise: z.ZodString;
                sets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                reps: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                durationSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                durationMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                RPE: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                rir: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                percentageRM: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                restSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                restText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                equipment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                pattern: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                tempo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                cues: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
                tags: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
                notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, "strict", z.ZodTypeAny, {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }, {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }>, "many">;
            restBetweenExercisesSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            restAfterSetSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rounds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strict", z.ZodTypeAny, {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            structureType: "straight" | "superset" | "circuit";
            notes?: string | null | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }, {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            notes?: string | null | undefined;
            structureType?: "straight" | "superset" | "circuit" | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }>, "many">;
    }, "strict", z.ZodTypeAny, {
        name: string;
        work: {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            structureType: "straight" | "superset" | "circuit";
            notes?: string | null | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }[];
        goal?: string | null | undefined;
        notes?: string | null | undefined;
        durationMin?: number | null | undefined;
    }, {
        name: string;
        work: {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            notes?: string | null | undefined;
            structureType?: "straight" | "superset" | "circuit" | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }[];
        goal?: string | null | undefined;
        notes?: string | null | undefined;
        durationMin?: number | null | undefined;
    }>, "many">;
    modifications: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        condition: z.ZodString;
        replace: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            exercise: z.ZodString;
            with: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            with: string;
            exercise: string;
        }, {
            with: string;
            exercise: string;
        }>>>;
        adjustment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        note: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        condition: string;
        note: string;
        replace?: {
            with: string;
            exercise: string;
        } | null | undefined;
        adjustment?: string | null | undefined;
    }, {
        condition: string;
        note: string;
        replace?: {
            with: string;
            exercise: string;
        } | null | undefined;
        adjustment?: string | null | undefined;
    }>, "many">>>;
    targetMetrics: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        totalVolume: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        totalReps: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        totalSets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        totalDuration: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        averageRPE: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        averageIntensity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        totalVolume?: number | null | undefined;
        totalReps?: number | null | undefined;
        totalSets?: number | null | undefined;
        totalDuration?: number | null | undefined;
        averageRPE?: number | null | undefined;
        averageIntensity?: number | null | undefined;
    }, {
        totalVolume?: number | null | undefined;
        totalReps?: number | null | undefined;
        totalSets?: number | null | undefined;
        totalDuration?: number | null | undefined;
        averageRPE?: number | null | undefined;
        averageIntensity?: number | null | undefined;
    }>>>;
    summary: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        adaptations: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        coachingNotes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        progressionNotes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        recoveryFocus: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        adaptations?: string[] | null | undefined;
        coachingNotes?: string | null | undefined;
        progressionNotes?: string | null | undefined;
        recoveryFocus?: string | null | undefined;
    }, {
        adaptations?: string[] | null | undefined;
        coachingNotes?: string | null | undefined;
        progressionNotes?: string | null | undefined;
        recoveryFocus?: string | null | undefined;
    }>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    theme: string;
    blocks: {
        name: string;
        work: {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            structureType: "straight" | "superset" | "circuit";
            notes?: string | null | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }[];
        goal?: string | null | undefined;
        notes?: string | null | undefined;
        durationMin?: number | null | undefined;
    }[];
    notes?: string | null | undefined;
    summary?: {
        adaptations?: string[] | null | undefined;
        coachingNotes?: string | null | undefined;
        progressionNotes?: string | null | undefined;
        recoveryFocus?: string | null | undefined;
    } | null | undefined;
    modifications?: {
        condition: string;
        note: string;
        replace?: {
            with: string;
            exercise: string;
        } | null | undefined;
        adjustment?: string | null | undefined;
    }[] | null | undefined;
    sessionContext?: {
        goal?: string | null | undefined;
        weekNumber?: number | null | undefined;
        environment?: string | null | undefined;
        phaseName?: string | null | undefined;
        dayIndex?: number | null | undefined;
        durationEstimateMin?: number | null | undefined;
        clientConstraints?: {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        } | null | undefined;
    } | null | undefined;
    targetMetrics?: {
        totalVolume?: number | null | undefined;
        totalReps?: number | null | undefined;
        totalSets?: number | null | undefined;
        totalDuration?: number | null | undefined;
        averageRPE?: number | null | undefined;
        averageIntensity?: number | null | undefined;
    } | null | undefined;
}, {
    theme: string;
    blocks: {
        name: string;
        work: {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            notes?: string | null | undefined;
            structureType?: "straight" | "superset" | "circuit" | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }[];
        goal?: string | null | undefined;
        notes?: string | null | undefined;
        durationMin?: number | null | undefined;
    }[];
    notes?: string | null | undefined;
    summary?: {
        adaptations?: string[] | null | undefined;
        coachingNotes?: string | null | undefined;
        progressionNotes?: string | null | undefined;
        recoveryFocus?: string | null | undefined;
    } | null | undefined;
    modifications?: {
        condition: string;
        note: string;
        replace?: {
            with: string;
            exercise: string;
        } | null | undefined;
        adjustment?: string | null | undefined;
    }[] | null | undefined;
    sessionContext?: {
        goal?: string | null | undefined;
        weekNumber?: number | null | undefined;
        environment?: string | null | undefined;
        phaseName?: string | null | undefined;
        dayIndex?: number | null | undefined;
        durationEstimateMin?: number | null | undefined;
        clientConstraints?: {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        } | null | undefined;
    } | null | undefined;
    targetMetrics?: {
        totalVolume?: number | null | undefined;
        totalReps?: number | null | undefined;
        totalSets?: number | null | undefined;
        totalDuration?: number | null | undefined;
        averageRPE?: number | null | undefined;
        averageIntensity?: number | null | undefined;
    } | null | undefined;
}>;
export declare const _UpdatedWorkoutInstanceSchema: z.ZodObject<{
    theme: z.ZodString;
    sessionContext: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        phaseName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        weekNumber: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        dayIndex: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        goal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        durationEstimateMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        environment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        clientConstraints: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            timeAvailable: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            equipmentAvailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            injuries: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            preferences: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        }, {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        goal?: string | null | undefined;
        weekNumber?: number | null | undefined;
        environment?: string | null | undefined;
        phaseName?: string | null | undefined;
        dayIndex?: number | null | undefined;
        durationEstimateMin?: number | null | undefined;
        clientConstraints?: {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        } | null | undefined;
    }, {
        goal?: string | null | undefined;
        weekNumber?: number | null | undefined;
        environment?: string | null | undefined;
        phaseName?: string | null | undefined;
        dayIndex?: number | null | undefined;
        durationEstimateMin?: number | null | undefined;
        clientConstraints?: {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        } | null | undefined;
    }>>>;
    blocks: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        goal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        durationMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        work: z.ZodArray<z.ZodObject<{
            structureType: z.ZodDefault<z.ZodEnum<["straight", "superset", "circuit"]>>;
            exercises: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["prep", "compound", "secondary", "accessory", "core", "cardio", "cooldown"]>;
                exercise: z.ZodString;
                sets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                reps: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                durationSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                durationMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                RPE: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                rir: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                percentageRM: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                restSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                restText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                equipment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                pattern: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                tempo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                cues: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
                tags: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
                notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, "strict", z.ZodTypeAny, {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }, {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }>, "many">;
            restBetweenExercisesSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            restAfterSetSec: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rounds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strict", z.ZodTypeAny, {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            structureType: "straight" | "superset" | "circuit";
            notes?: string | null | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }, {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            notes?: string | null | undefined;
            structureType?: "straight" | "superset" | "circuit" | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }>, "many">;
    }, "strict", z.ZodTypeAny, {
        name: string;
        work: {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            structureType: "straight" | "superset" | "circuit";
            notes?: string | null | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }[];
        goal?: string | null | undefined;
        notes?: string | null | undefined;
        durationMin?: number | null | undefined;
    }, {
        name: string;
        work: {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            notes?: string | null | undefined;
            structureType?: "straight" | "superset" | "circuit" | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }[];
        goal?: string | null | undefined;
        notes?: string | null | undefined;
        durationMin?: number | null | undefined;
    }>, "many">;
    modifications: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        condition: z.ZodString;
        replace: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            exercise: z.ZodString;
            with: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            with: string;
            exercise: string;
        }, {
            with: string;
            exercise: string;
        }>>>;
        adjustment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        note: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        condition: string;
        note: string;
        replace?: {
            with: string;
            exercise: string;
        } | null | undefined;
        adjustment?: string | null | undefined;
    }, {
        condition: string;
        note: string;
        replace?: {
            with: string;
            exercise: string;
        } | null | undefined;
        adjustment?: string | null | undefined;
    }>, "many">>>;
    targetMetrics: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        totalVolume: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        totalReps: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        totalSets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        totalDuration: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        averageRPE: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        averageIntensity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        totalVolume?: number | null | undefined;
        totalReps?: number | null | undefined;
        totalSets?: number | null | undefined;
        totalDuration?: number | null | undefined;
        averageRPE?: number | null | undefined;
        averageIntensity?: number | null | undefined;
    }, {
        totalVolume?: number | null | undefined;
        totalReps?: number | null | undefined;
        totalSets?: number | null | undefined;
        totalDuration?: number | null | undefined;
        averageRPE?: number | null | undefined;
        averageIntensity?: number | null | undefined;
    }>>>;
    summary: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        adaptations: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        coachingNotes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        progressionNotes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        recoveryFocus: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        adaptations?: string[] | null | undefined;
        coachingNotes?: string | null | undefined;
        progressionNotes?: string | null | undefined;
        recoveryFocus?: string | null | undefined;
    }, {
        adaptations?: string[] | null | undefined;
        coachingNotes?: string | null | undefined;
        progressionNotes?: string | null | undefined;
        recoveryFocus?: string | null | undefined;
    }>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
} & {
    modificationsApplied: z.ZodArray<z.ZodString, "many">;
}, "strict", z.ZodTypeAny, {
    theme: string;
    blocks: {
        name: string;
        work: {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            structureType: "straight" | "superset" | "circuit";
            notes?: string | null | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }[];
        goal?: string | null | undefined;
        notes?: string | null | undefined;
        durationMin?: number | null | undefined;
    }[];
    modificationsApplied: string[];
    notes?: string | null | undefined;
    summary?: {
        adaptations?: string[] | null | undefined;
        coachingNotes?: string | null | undefined;
        progressionNotes?: string | null | undefined;
        recoveryFocus?: string | null | undefined;
    } | null | undefined;
    modifications?: {
        condition: string;
        note: string;
        replace?: {
            with: string;
            exercise: string;
        } | null | undefined;
        adjustment?: string | null | undefined;
    }[] | null | undefined;
    sessionContext?: {
        goal?: string | null | undefined;
        weekNumber?: number | null | undefined;
        environment?: string | null | undefined;
        phaseName?: string | null | undefined;
        dayIndex?: number | null | undefined;
        durationEstimateMin?: number | null | undefined;
        clientConstraints?: {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        } | null | undefined;
    } | null | undefined;
    targetMetrics?: {
        totalVolume?: number | null | undefined;
        totalReps?: number | null | undefined;
        totalSets?: number | null | undefined;
        totalDuration?: number | null | undefined;
        averageRPE?: number | null | undefined;
        averageIntensity?: number | null | undefined;
    } | null | undefined;
}, {
    theme: string;
    blocks: {
        name: string;
        work: {
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                exercise: string;
                pattern?: string | null | undefined;
                notes?: string | null | undefined;
                tags?: string[] | null | undefined;
                equipment?: string | null | undefined;
                sets?: number | null | undefined;
                reps?: string | null | undefined;
                RPE?: number | null | undefined;
                tempo?: string | null | undefined;
                durationMin?: number | null | undefined;
                durationSec?: number | null | undefined;
                rir?: number | null | undefined;
                percentageRM?: number | null | undefined;
                restSec?: number | null | undefined;
                restText?: string | null | undefined;
                cues?: string[] | null | undefined;
            }[];
            notes?: string | null | undefined;
            structureType?: "straight" | "superset" | "circuit" | undefined;
            restBetweenExercisesSec?: number | null | undefined;
            restAfterSetSec?: number | null | undefined;
            rounds?: number | null | undefined;
        }[];
        goal?: string | null | undefined;
        notes?: string | null | undefined;
        durationMin?: number | null | undefined;
    }[];
    modificationsApplied: string[];
    notes?: string | null | undefined;
    summary?: {
        adaptations?: string[] | null | undefined;
        coachingNotes?: string | null | undefined;
        progressionNotes?: string | null | undefined;
        recoveryFocus?: string | null | undefined;
    } | null | undefined;
    modifications?: {
        condition: string;
        note: string;
        replace?: {
            with: string;
            exercise: string;
        } | null | undefined;
        adjustment?: string | null | undefined;
    }[] | null | undefined;
    sessionContext?: {
        goal?: string | null | undefined;
        weekNumber?: number | null | undefined;
        environment?: string | null | undefined;
        phaseName?: string | null | undefined;
        dayIndex?: number | null | undefined;
        durationEstimateMin?: number | null | undefined;
        clientConstraints?: {
            equipmentAvailable?: string[] | null | undefined;
            preferences?: string[] | null | undefined;
            injuries?: string[] | null | undefined;
            timeAvailable?: number | null | undefined;
        } | null | undefined;
    } | null | undefined;
    targetMetrics?: {
        totalVolume?: number | null | undefined;
        totalReps?: number | null | undefined;
        totalSets?: number | null | undefined;
        totalDuration?: number | null | undefined;
        averageRPE?: number | null | undefined;
        averageIntensity?: number | null | undefined;
    } | null | undefined;
}>;
export declare const _WorkoutInstanceSchema: z.ZodObject<{
    sessionType: z.ZodEnum<["run", "lift", "metcon", "mobility", "rest", "other"]>;
    details: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        activities: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        activities: string[];
        label: string;
    }, {
        activities: string[];
        label: string;
    }>, "many">;
    targets: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        value: number;
        key: string;
    }, {
        value: number;
        key: string;
    }>, "many">>>;
}, "strict", z.ZodTypeAny, {
    details: {
        activities: string[];
        label: string;
    }[];
    sessionType: "run" | "mobility" | "rest" | "metcon" | "lift" | "other";
    targets?: {
        value: number;
        key: string;
    }[] | null | undefined;
}, {
    details: {
        activities: string[];
        label: string;
    }[];
    sessionType: "run" | "mobility" | "rest" | "metcon" | "lift" | "other";
    targets?: {
        value: number;
        key: string;
    }[] | null | undefined;
}>;
export type WorkoutBlockItem = z.infer<typeof _WorkoutBlockItemSchema>;
export type WorkoutBlock = z.infer<typeof _WorkoutBlockSchema>;
export type WorkoutModification = z.infer<typeof _WorkoutModificationSchema>;
export type EnhancedWorkoutInstance = z.infer<typeof _EnhancedWorkoutInstanceSchema> & {
    date: Date;
};
export type UpdatedWorkoutInstance = z.infer<typeof _UpdatedWorkoutInstanceSchema> & {
    date: Date;
};
//# sourceMappingURL=openAISchema.d.ts.map