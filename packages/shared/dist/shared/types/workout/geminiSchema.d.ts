import { z } from "zod";
/**
 * Gemini-compatible workout schemas
 *
 * Gemini's structured output doesn't support union types (e.g., string | null)
 * or .nullable().optional() combinations. This schema uses sentinel values instead:
 * - Empty string "" for unset string values
 * - -1 for unset numeric values (sets, reps, duration, RPE, percentageRM, etc.)
 * - Empty arrays [] for unset array values
 *
 * Post-processing will convert these sentinel values back to null for compatibility.
 */
export declare const GeminiWorkoutBlockItemSchema: z.ZodObject<{
    type: z.ZodEnum<["prep", "compound", "secondary", "accessory", "core", "cardio", "cooldown"]>;
    exercise: z.ZodString;
    sets: z.ZodNumber;
    reps: z.ZodString;
    durationSec: z.ZodNumber;
    durationMin: z.ZodNumber;
    RPE: z.ZodNumber;
    rir: z.ZodNumber;
    percentageRM: z.ZodNumber;
    restSec: z.ZodNumber;
    restText: z.ZodString;
    equipment: z.ZodString;
    pattern: z.ZodString;
    tempo: z.ZodString;
    cues: z.ZodArray<z.ZodString, "many">;
    tags: z.ZodArray<z.ZodString, "many">;
    notes: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
    pattern: string;
    notes: string;
    tags: string[];
    equipment: string;
    sets: number;
    reps: string;
    RPE: number;
    tempo: string;
    durationMin: number;
    exercise: string;
    durationSec: number;
    rir: number;
    percentageRM: number;
    restSec: number;
    restText: string;
    cues: string[];
}, {
    type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
    pattern: string;
    notes: string;
    tags: string[];
    equipment: string;
    sets: number;
    reps: string;
    RPE: number;
    tempo: string;
    durationMin: number;
    exercise: string;
    durationSec: number;
    rir: number;
    percentageRM: number;
    restSec: number;
    restText: string;
    cues: string[];
}>;
export declare const GeminiWorkoutWorkItemSchema: z.ZodObject<{
    structureType: z.ZodEnum<["straight", "superset", "circuit"]>;
    exercises: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["prep", "compound", "secondary", "accessory", "core", "cardio", "cooldown"]>;
        exercise: z.ZodString;
        sets: z.ZodNumber;
        reps: z.ZodString;
        durationSec: z.ZodNumber;
        durationMin: z.ZodNumber;
        RPE: z.ZodNumber;
        rir: z.ZodNumber;
        percentageRM: z.ZodNumber;
        restSec: z.ZodNumber;
        restText: z.ZodString;
        equipment: z.ZodString;
        pattern: z.ZodString;
        tempo: z.ZodString;
        cues: z.ZodArray<z.ZodString, "many">;
        tags: z.ZodArray<z.ZodString, "many">;
        notes: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
        pattern: string;
        notes: string;
        tags: string[];
        equipment: string;
        sets: number;
        reps: string;
        RPE: number;
        tempo: string;
        durationMin: number;
        exercise: string;
        durationSec: number;
        rir: number;
        percentageRM: number;
        restSec: number;
        restText: string;
        cues: string[];
    }, {
        type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
        pattern: string;
        notes: string;
        tags: string[];
        equipment: string;
        sets: number;
        reps: string;
        RPE: number;
        tempo: string;
        durationMin: number;
        exercise: string;
        durationSec: number;
        rir: number;
        percentageRM: number;
        restSec: number;
        restText: string;
        cues: string[];
    }>, "many">;
    restBetweenExercisesSec: z.ZodNumber;
    restAfterSetSec: z.ZodNumber;
    rounds: z.ZodNumber;
    notes: z.ZodString;
}, "strict", z.ZodTypeAny, {
    notes: string;
    exercises: {
        type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
        pattern: string;
        notes: string;
        tags: string[];
        equipment: string;
        sets: number;
        reps: string;
        RPE: number;
        tempo: string;
        durationMin: number;
        exercise: string;
        durationSec: number;
        rir: number;
        percentageRM: number;
        restSec: number;
        restText: string;
        cues: string[];
    }[];
    structureType: "straight" | "superset" | "circuit";
    restBetweenExercisesSec: number;
    restAfterSetSec: number;
    rounds: number;
}, {
    notes: string;
    exercises: {
        type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
        pattern: string;
        notes: string;
        tags: string[];
        equipment: string;
        sets: number;
        reps: string;
        RPE: number;
        tempo: string;
        durationMin: number;
        exercise: string;
        durationSec: number;
        rir: number;
        percentageRM: number;
        restSec: number;
        restText: string;
        cues: string[];
    }[];
    structureType: "straight" | "superset" | "circuit";
    restBetweenExercisesSec: number;
    restAfterSetSec: number;
    rounds: number;
}>;
export declare const GeminiWorkoutBlockSchema: z.ZodObject<{
    name: z.ZodString;
    goal: z.ZodString;
    durationMin: z.ZodNumber;
    notes: z.ZodString;
    work: z.ZodArray<z.ZodObject<{
        structureType: z.ZodEnum<["straight", "superset", "circuit"]>;
        exercises: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["prep", "compound", "secondary", "accessory", "core", "cardio", "cooldown"]>;
            exercise: z.ZodString;
            sets: z.ZodNumber;
            reps: z.ZodString;
            durationSec: z.ZodNumber;
            durationMin: z.ZodNumber;
            RPE: z.ZodNumber;
            rir: z.ZodNumber;
            percentageRM: z.ZodNumber;
            restSec: z.ZodNumber;
            restText: z.ZodString;
            equipment: z.ZodString;
            pattern: z.ZodString;
            tempo: z.ZodString;
            cues: z.ZodArray<z.ZodString, "many">;
            tags: z.ZodArray<z.ZodString, "many">;
            notes: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            pattern: string;
            notes: string;
            tags: string[];
            equipment: string;
            sets: number;
            reps: string;
            RPE: number;
            tempo: string;
            durationMin: number;
            exercise: string;
            durationSec: number;
            rir: number;
            percentageRM: number;
            restSec: number;
            restText: string;
            cues: string[];
        }, {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            pattern: string;
            notes: string;
            tags: string[];
            equipment: string;
            sets: number;
            reps: string;
            RPE: number;
            tempo: string;
            durationMin: number;
            exercise: string;
            durationSec: number;
            rir: number;
            percentageRM: number;
            restSec: number;
            restText: string;
            cues: string[];
        }>, "many">;
        restBetweenExercisesSec: z.ZodNumber;
        restAfterSetSec: z.ZodNumber;
        rounds: z.ZodNumber;
        notes: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        notes: string;
        exercises: {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            pattern: string;
            notes: string;
            tags: string[];
            equipment: string;
            sets: number;
            reps: string;
            RPE: number;
            tempo: string;
            durationMin: number;
            exercise: string;
            durationSec: number;
            rir: number;
            percentageRM: number;
            restSec: number;
            restText: string;
            cues: string[];
        }[];
        structureType: "straight" | "superset" | "circuit";
        restBetweenExercisesSec: number;
        restAfterSetSec: number;
        rounds: number;
    }, {
        notes: string;
        exercises: {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            pattern: string;
            notes: string;
            tags: string[];
            equipment: string;
            sets: number;
            reps: string;
            RPE: number;
            tempo: string;
            durationMin: number;
            exercise: string;
            durationSec: number;
            rir: number;
            percentageRM: number;
            restSec: number;
            restText: string;
            cues: string[];
        }[];
        structureType: "straight" | "superset" | "circuit";
        restBetweenExercisesSec: number;
        restAfterSetSec: number;
        rounds: number;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    name: string;
    goal: string;
    notes: string;
    durationMin: number;
    work: {
        notes: string;
        exercises: {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            pattern: string;
            notes: string;
            tags: string[];
            equipment: string;
            sets: number;
            reps: string;
            RPE: number;
            tempo: string;
            durationMin: number;
            exercise: string;
            durationSec: number;
            rir: number;
            percentageRM: number;
            restSec: number;
            restText: string;
            cues: string[];
        }[];
        structureType: "straight" | "superset" | "circuit";
        restBetweenExercisesSec: number;
        restAfterSetSec: number;
        rounds: number;
    }[];
}, {
    name: string;
    goal: string;
    notes: string;
    durationMin: number;
    work: {
        notes: string;
        exercises: {
            type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
            pattern: string;
            notes: string;
            tags: string[];
            equipment: string;
            sets: number;
            reps: string;
            RPE: number;
            tempo: string;
            durationMin: number;
            exercise: string;
            durationSec: number;
            rir: number;
            percentageRM: number;
            restSec: number;
            restText: string;
            cues: string[];
        }[];
        structureType: "straight" | "superset" | "circuit";
        restBetweenExercisesSec: number;
        restAfterSetSec: number;
        rounds: number;
    }[];
}>;
export declare const GeminiWorkoutModificationSchema: z.ZodObject<{
    condition: z.ZodString;
    replace: z.ZodObject<{
        exercise: z.ZodString;
        with: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        with: string;
        exercise: string;
    }, {
        with: string;
        exercise: string;
    }>;
    adjustment: z.ZodString;
    note: z.ZodString;
}, "strict", z.ZodTypeAny, {
    replace: {
        with: string;
        exercise: string;
    };
    condition: string;
    adjustment: string;
    note: string;
}, {
    replace: {
        with: string;
        exercise: string;
    };
    condition: string;
    adjustment: string;
    note: string;
}>;
export declare const GeminiWorkoutSessionContextSchema: z.ZodObject<{
    phaseName: z.ZodString;
    weekNumber: z.ZodNumber;
    dayIndex: z.ZodNumber;
    goal: z.ZodString;
    durationEstimateMin: z.ZodNumber;
    environment: z.ZodString;
    clientConstraints: z.ZodObject<{
        timeAvailable: z.ZodNumber;
        equipmentAvailable: z.ZodArray<z.ZodString, "many">;
        injuries: z.ZodArray<z.ZodString, "many">;
        preferences: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        equipmentAvailable: string[];
        preferences: string[];
        injuries: string[];
        timeAvailable: number;
    }, {
        equipmentAvailable: string[];
        preferences: string[];
        injuries: string[];
        timeAvailable: number;
    }>;
}, "strict", z.ZodTypeAny, {
    goal: string;
    weekNumber: number;
    environment: string;
    phaseName: string;
    dayIndex: number;
    durationEstimateMin: number;
    clientConstraints: {
        equipmentAvailable: string[];
        preferences: string[];
        injuries: string[];
        timeAvailable: number;
    };
}, {
    goal: string;
    weekNumber: number;
    environment: string;
    phaseName: string;
    dayIndex: number;
    durationEstimateMin: number;
    clientConstraints: {
        equipmentAvailable: string[];
        preferences: string[];
        injuries: string[];
        timeAvailable: number;
    };
}>;
export declare const GeminiWorkoutTargetMetricsSchema: z.ZodObject<{
    totalVolume: z.ZodNumber;
    totalReps: z.ZodNumber;
    totalSets: z.ZodNumber;
    totalDistance: z.ZodNumber;
    totalDuration: z.ZodNumber;
    averageRPE: z.ZodNumber;
    averageIntensity: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    totalVolume: number;
    totalReps: number;
    totalSets: number;
    totalDuration: number;
    averageRPE: number;
    averageIntensity: number;
    totalDistance: number;
}, {
    totalVolume: number;
    totalReps: number;
    totalSets: number;
    totalDuration: number;
    averageRPE: number;
    averageIntensity: number;
    totalDistance: number;
}>;
export declare const GeminiWorkoutSummarySchema: z.ZodObject<{
    adaptations: z.ZodArray<z.ZodString, "many">;
    coachingNotes: z.ZodString;
    progressionNotes: z.ZodString;
    recoveryFocus: z.ZodString;
}, "strict", z.ZodTypeAny, {
    adaptations: string[];
    coachingNotes: string;
    progressionNotes: string;
    recoveryFocus: string;
}, {
    adaptations: string[];
    coachingNotes: string;
    progressionNotes: string;
    recoveryFocus: string;
}>;
export declare const GeminiEnhancedWorkoutInstanceSchema: z.ZodObject<{
    theme: z.ZodString;
    sessionContext: z.ZodObject<{
        phaseName: z.ZodString;
        weekNumber: z.ZodNumber;
        dayIndex: z.ZodNumber;
        goal: z.ZodString;
        durationEstimateMin: z.ZodNumber;
        environment: z.ZodString;
        clientConstraints: z.ZodObject<{
            timeAvailable: z.ZodNumber;
            equipmentAvailable: z.ZodArray<z.ZodString, "many">;
            injuries: z.ZodArray<z.ZodString, "many">;
            preferences: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        }, {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        }>;
    }, "strict", z.ZodTypeAny, {
        goal: string;
        weekNumber: number;
        environment: string;
        phaseName: string;
        dayIndex: number;
        durationEstimateMin: number;
        clientConstraints: {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        };
    }, {
        goal: string;
        weekNumber: number;
        environment: string;
        phaseName: string;
        dayIndex: number;
        durationEstimateMin: number;
        clientConstraints: {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        };
    }>;
    blocks: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        goal: z.ZodString;
        durationMin: z.ZodNumber;
        notes: z.ZodString;
        work: z.ZodArray<z.ZodObject<{
            structureType: z.ZodEnum<["straight", "superset", "circuit"]>;
            exercises: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["prep", "compound", "secondary", "accessory", "core", "cardio", "cooldown"]>;
                exercise: z.ZodString;
                sets: z.ZodNumber;
                reps: z.ZodString;
                durationSec: z.ZodNumber;
                durationMin: z.ZodNumber;
                RPE: z.ZodNumber;
                rir: z.ZodNumber;
                percentageRM: z.ZodNumber;
                restSec: z.ZodNumber;
                restText: z.ZodString;
                equipment: z.ZodString;
                pattern: z.ZodString;
                tempo: z.ZodString;
                cues: z.ZodArray<z.ZodString, "many">;
                tags: z.ZodArray<z.ZodString, "many">;
                notes: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }, {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }>, "many">;
            restBetweenExercisesSec: z.ZodNumber;
            restAfterSetSec: z.ZodNumber;
            rounds: z.ZodNumber;
            notes: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }, {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }>, "many">;
    }, "strict", z.ZodTypeAny, {
        name: string;
        goal: string;
        notes: string;
        durationMin: number;
        work: {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }[];
    }, {
        name: string;
        goal: string;
        notes: string;
        durationMin: number;
        work: {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }[];
    }>, "many">;
    modifications: z.ZodArray<z.ZodObject<{
        condition: z.ZodString;
        replace: z.ZodObject<{
            exercise: z.ZodString;
            with: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            with: string;
            exercise: string;
        }, {
            with: string;
            exercise: string;
        }>;
        adjustment: z.ZodString;
        note: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        replace: {
            with: string;
            exercise: string;
        };
        condition: string;
        adjustment: string;
        note: string;
    }, {
        replace: {
            with: string;
            exercise: string;
        };
        condition: string;
        adjustment: string;
        note: string;
    }>, "many">;
    targetMetrics: z.ZodObject<{
        totalVolume: z.ZodNumber;
        totalReps: z.ZodNumber;
        totalSets: z.ZodNumber;
        totalDistance: z.ZodNumber;
        totalDuration: z.ZodNumber;
        averageRPE: z.ZodNumber;
        averageIntensity: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        totalVolume: number;
        totalReps: number;
        totalSets: number;
        totalDuration: number;
        averageRPE: number;
        averageIntensity: number;
        totalDistance: number;
    }, {
        totalVolume: number;
        totalReps: number;
        totalSets: number;
        totalDuration: number;
        averageRPE: number;
        averageIntensity: number;
        totalDistance: number;
    }>;
    summary: z.ZodObject<{
        adaptations: z.ZodArray<z.ZodString, "many">;
        coachingNotes: z.ZodString;
        progressionNotes: z.ZodString;
        recoveryFocus: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        adaptations: string[];
        coachingNotes: string;
        progressionNotes: string;
        recoveryFocus: string;
    }, {
        adaptations: string[];
        coachingNotes: string;
        progressionNotes: string;
        recoveryFocus: string;
    }>;
    notes: z.ZodString;
}, "strict", z.ZodTypeAny, {
    notes: string;
    summary: {
        adaptations: string[];
        coachingNotes: string;
        progressionNotes: string;
        recoveryFocus: string;
    };
    modifications: {
        replace: {
            with: string;
            exercise: string;
        };
        condition: string;
        adjustment: string;
        note: string;
    }[];
    theme: string;
    sessionContext: {
        goal: string;
        weekNumber: number;
        environment: string;
        phaseName: string;
        dayIndex: number;
        durationEstimateMin: number;
        clientConstraints: {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        };
    };
    blocks: {
        name: string;
        goal: string;
        notes: string;
        durationMin: number;
        work: {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }[];
    }[];
    targetMetrics: {
        totalVolume: number;
        totalReps: number;
        totalSets: number;
        totalDuration: number;
        averageRPE: number;
        averageIntensity: number;
        totalDistance: number;
    };
}, {
    notes: string;
    summary: {
        adaptations: string[];
        coachingNotes: string;
        progressionNotes: string;
        recoveryFocus: string;
    };
    modifications: {
        replace: {
            with: string;
            exercise: string;
        };
        condition: string;
        adjustment: string;
        note: string;
    }[];
    theme: string;
    sessionContext: {
        goal: string;
        weekNumber: number;
        environment: string;
        phaseName: string;
        dayIndex: number;
        durationEstimateMin: number;
        clientConstraints: {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        };
    };
    blocks: {
        name: string;
        goal: string;
        notes: string;
        durationMin: number;
        work: {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }[];
    }[];
    targetMetrics: {
        totalVolume: number;
        totalReps: number;
        totalSets: number;
        totalDuration: number;
        averageRPE: number;
        averageIntensity: number;
        totalDistance: number;
    };
}>;
export declare const GeminiUpdatedWorkoutInstanceSchema: z.ZodObject<{
    theme: z.ZodString;
    sessionContext: z.ZodObject<{
        phaseName: z.ZodString;
        weekNumber: z.ZodNumber;
        dayIndex: z.ZodNumber;
        goal: z.ZodString;
        durationEstimateMin: z.ZodNumber;
        environment: z.ZodString;
        clientConstraints: z.ZodObject<{
            timeAvailable: z.ZodNumber;
            equipmentAvailable: z.ZodArray<z.ZodString, "many">;
            injuries: z.ZodArray<z.ZodString, "many">;
            preferences: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        }, {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        }>;
    }, "strict", z.ZodTypeAny, {
        goal: string;
        weekNumber: number;
        environment: string;
        phaseName: string;
        dayIndex: number;
        durationEstimateMin: number;
        clientConstraints: {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        };
    }, {
        goal: string;
        weekNumber: number;
        environment: string;
        phaseName: string;
        dayIndex: number;
        durationEstimateMin: number;
        clientConstraints: {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        };
    }>;
    blocks: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        goal: z.ZodString;
        durationMin: z.ZodNumber;
        notes: z.ZodString;
        work: z.ZodArray<z.ZodObject<{
            structureType: z.ZodEnum<["straight", "superset", "circuit"]>;
            exercises: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["prep", "compound", "secondary", "accessory", "core", "cardio", "cooldown"]>;
                exercise: z.ZodString;
                sets: z.ZodNumber;
                reps: z.ZodString;
                durationSec: z.ZodNumber;
                durationMin: z.ZodNumber;
                RPE: z.ZodNumber;
                rir: z.ZodNumber;
                percentageRM: z.ZodNumber;
                restSec: z.ZodNumber;
                restText: z.ZodString;
                equipment: z.ZodString;
                pattern: z.ZodString;
                tempo: z.ZodString;
                cues: z.ZodArray<z.ZodString, "many">;
                tags: z.ZodArray<z.ZodString, "many">;
                notes: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }, {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }>, "many">;
            restBetweenExercisesSec: z.ZodNumber;
            restAfterSetSec: z.ZodNumber;
            rounds: z.ZodNumber;
            notes: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }, {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }>, "many">;
    }, "strict", z.ZodTypeAny, {
        name: string;
        goal: string;
        notes: string;
        durationMin: number;
        work: {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }[];
    }, {
        name: string;
        goal: string;
        notes: string;
        durationMin: number;
        work: {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }[];
    }>, "many">;
    modifications: z.ZodArray<z.ZodObject<{
        condition: z.ZodString;
        replace: z.ZodObject<{
            exercise: z.ZodString;
            with: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            with: string;
            exercise: string;
        }, {
            with: string;
            exercise: string;
        }>;
        adjustment: z.ZodString;
        note: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        replace: {
            with: string;
            exercise: string;
        };
        condition: string;
        adjustment: string;
        note: string;
    }, {
        replace: {
            with: string;
            exercise: string;
        };
        condition: string;
        adjustment: string;
        note: string;
    }>, "many">;
    targetMetrics: z.ZodObject<{
        totalVolume: z.ZodNumber;
        totalReps: z.ZodNumber;
        totalSets: z.ZodNumber;
        totalDistance: z.ZodNumber;
        totalDuration: z.ZodNumber;
        averageRPE: z.ZodNumber;
        averageIntensity: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        totalVolume: number;
        totalReps: number;
        totalSets: number;
        totalDuration: number;
        averageRPE: number;
        averageIntensity: number;
        totalDistance: number;
    }, {
        totalVolume: number;
        totalReps: number;
        totalSets: number;
        totalDuration: number;
        averageRPE: number;
        averageIntensity: number;
        totalDistance: number;
    }>;
    summary: z.ZodObject<{
        adaptations: z.ZodArray<z.ZodString, "many">;
        coachingNotes: z.ZodString;
        progressionNotes: z.ZodString;
        recoveryFocus: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        adaptations: string[];
        coachingNotes: string;
        progressionNotes: string;
        recoveryFocus: string;
    }, {
        adaptations: string[];
        coachingNotes: string;
        progressionNotes: string;
        recoveryFocus: string;
    }>;
    notes: z.ZodString;
} & {
    modificationsApplied: z.ZodArray<z.ZodString, "many">;
}, "strict", z.ZodTypeAny, {
    notes: string;
    summary: {
        adaptations: string[];
        coachingNotes: string;
        progressionNotes: string;
        recoveryFocus: string;
    };
    modifications: {
        replace: {
            with: string;
            exercise: string;
        };
        condition: string;
        adjustment: string;
        note: string;
    }[];
    theme: string;
    sessionContext: {
        goal: string;
        weekNumber: number;
        environment: string;
        phaseName: string;
        dayIndex: number;
        durationEstimateMin: number;
        clientConstraints: {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        };
    };
    blocks: {
        name: string;
        goal: string;
        notes: string;
        durationMin: number;
        work: {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }[];
    }[];
    targetMetrics: {
        totalVolume: number;
        totalReps: number;
        totalSets: number;
        totalDuration: number;
        averageRPE: number;
        averageIntensity: number;
        totalDistance: number;
    };
    modificationsApplied: string[];
}, {
    notes: string;
    summary: {
        adaptations: string[];
        coachingNotes: string;
        progressionNotes: string;
        recoveryFocus: string;
    };
    modifications: {
        replace: {
            with: string;
            exercise: string;
        };
        condition: string;
        adjustment: string;
        note: string;
    }[];
    theme: string;
    sessionContext: {
        goal: string;
        weekNumber: number;
        environment: string;
        phaseName: string;
        dayIndex: number;
        durationEstimateMin: number;
        clientConstraints: {
            equipmentAvailable: string[];
            preferences: string[];
            injuries: string[];
            timeAvailable: number;
        };
    };
    blocks: {
        name: string;
        goal: string;
        notes: string;
        durationMin: number;
        work: {
            notes: string;
            exercises: {
                type: "cardio" | "prep" | "compound" | "secondary" | "accessory" | "core" | "cooldown";
                pattern: string;
                notes: string;
                tags: string[];
                equipment: string;
                sets: number;
                reps: string;
                RPE: number;
                tempo: string;
                durationMin: number;
                exercise: string;
                durationSec: number;
                rir: number;
                percentageRM: number;
                restSec: number;
                restText: string;
                cues: string[];
            }[];
            structureType: "straight" | "superset" | "circuit";
            restBetweenExercisesSec: number;
            restAfterSetSec: number;
            rounds: number;
        }[];
    }[];
    targetMetrics: {
        totalVolume: number;
        totalReps: number;
        totalSets: number;
        totalDuration: number;
        averageRPE: number;
        averageIntensity: number;
        totalDistance: number;
    };
    modificationsApplied: string[];
}>;
export type GeminiWorkoutBlockItem = z.infer<typeof GeminiWorkoutBlockItemSchema>;
export type GeminiWorkoutWorkItem = z.infer<typeof GeminiWorkoutWorkItemSchema>;
export type GeminiWorkoutBlock = z.infer<typeof GeminiWorkoutBlockSchema>;
export type GeminiWorkoutModification = z.infer<typeof GeminiWorkoutModificationSchema>;
export type GeminiWorkoutSessionContext = z.infer<typeof GeminiWorkoutSessionContextSchema>;
export type GeminiWorkoutTargetMetrics = z.infer<typeof GeminiWorkoutTargetMetricsSchema>;
export type GeminiWorkoutSummary = z.infer<typeof GeminiWorkoutSummarySchema>;
export type GeminiEnhancedWorkoutInstance = z.infer<typeof GeminiEnhancedWorkoutInstanceSchema>;
export type GeminiUpdatedWorkoutInstance = z.infer<typeof GeminiUpdatedWorkoutInstanceSchema>;
/**
 * Converts Gemini sentinel values to null for compatibility with existing types
 * - Empty strings → null
 * - -1 values → null (for optional numeric fields)
 * - Empty arrays → null (for optional array fields)
 * - Empty replace objects → null
 * - Invalid numeric ranges → null (e.g., RPE > 10, percentageRM > 100)
 */
export declare function convertGeminiToStandard<T extends Record<string, any>>(geminiOutput: T): any;
//# sourceMappingURL=geminiSchema.d.ts.map