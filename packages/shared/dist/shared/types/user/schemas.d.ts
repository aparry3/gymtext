import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodNullable<z.ZodString>;
    phoneNumber: z.ZodEffects<z.ZodEffects<z.ZodString, string | null, string>, string | null, string>;
    age: z.ZodNullable<z.ZodNumber>;
    gender: z.ZodNullable<z.ZodString>;
    stripeCustomerId: z.ZodNullable<z.ZodString>;
    preferredSendHour: z.ZodNumber;
    timezone: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    createdAt: Date;
    age: number | null;
    email: string | null;
    gender: string | null;
    phoneNumber: string | null;
    preferredSendHour: number;
    stripeCustomerId: string | null;
    timezone: string;
    updatedAt: Date;
}, {
    name: string;
    id: string;
    createdAt: Date;
    age: number | null;
    email: string | null;
    gender: string | null;
    phoneNumber: string;
    preferredSendHour: number;
    stripeCustomerId: string | null;
    timezone: string;
    updatedAt: Date;
}>;
export declare const AvailabilitySchema: z.ZodObject<{
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    daysPerWeek: z.ZodNumber;
    minutesPerSession: z.ZodNumber;
    preferredTimes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodEnum<["morning", "afternoon", "evening"]>, "many">>>;
    schedule: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    daysPerWeek: number;
    minutesPerSession: number;
    summary?: string | null | undefined;
    preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
    schedule?: string | null | undefined;
}, {
    daysPerWeek: number;
    minutesPerSession: number;
    summary?: string | null | undefined;
    preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
    schedule?: string | null | undefined;
}>;
export declare const TemporaryEnvironmentChangeSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    equipmentAvailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    equipmentUnavailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    startDate: string;
    endDate?: string | null | undefined;
    location?: string | null | undefined;
    equipmentAvailable?: string[] | null | undefined;
    equipmentUnavailable?: string[] | null | undefined;
}, {
    id: string;
    description: string;
    startDate: string;
    endDate?: string | null | undefined;
    location?: string | null | undefined;
    equipmentAvailable?: string[] | null | undefined;
    equipmentUnavailable?: string[] | null | undefined;
}>;
export declare const EquipmentAccessSchema: z.ZodObject<{
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    gymAccess: z.ZodBoolean;
    gymType: z.ZodOptional<z.ZodNullable<z.ZodEnum<["commercial", "home", "community", "none"]>>>;
    homeEquipment: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    limitations: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    temporaryChanges: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        equipmentAvailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        equipmentUnavailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        startDate: string;
        endDate?: string | null | undefined;
        location?: string | null | undefined;
        equipmentAvailable?: string[] | null | undefined;
        equipmentUnavailable?: string[] | null | undefined;
    }, {
        id: string;
        description: string;
        startDate: string;
        endDate?: string | null | undefined;
        location?: string | null | undefined;
        equipmentAvailable?: string[] | null | undefined;
        equipmentUnavailable?: string[] | null | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    gymAccess: boolean;
    summary?: string | null | undefined;
    gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
    homeEquipment?: string[] | null | undefined;
    limitations?: string[] | null | undefined;
    temporaryChanges?: {
        id: string;
        description: string;
        startDate: string;
        endDate?: string | null | undefined;
        location?: string | null | undefined;
        equipmentAvailable?: string[] | null | undefined;
        equipmentUnavailable?: string[] | null | undefined;
    }[] | null | undefined;
}, {
    gymAccess: boolean;
    summary?: string | null | undefined;
    gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
    homeEquipment?: string[] | null | undefined;
    limitations?: string[] | null | undefined;
    temporaryChanges?: {
        id: string;
        description: string;
        startDate: string;
        endDate?: string | null | undefined;
        location?: string | null | undefined;
        equipmentAvailable?: string[] | null | undefined;
        equipmentUnavailable?: string[] | null | undefined;
    }[] | null | undefined;
}>;
export declare const WeightSchema: z.ZodObject<{
    value: z.ZodNumber;
    unit: z.ZodEnum<["lbs", "kg"]>;
    date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    value: number;
    unit: "lbs" | "kg";
    date?: string | null | undefined;
}, {
    value: number;
    unit: "lbs" | "kg";
    date?: string | null | undefined;
}>;
export declare const UserMetricsSchema: z.ZodObject<{
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodEnum<["lbs", "kg"]>;
        date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: "lbs" | "kg";
        date?: string | null | undefined;
    }, {
        value: number;
        unit: "lbs" | "kg";
        date?: string | null | undefined;
    }>>>;
    bodyComposition: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    fitnessLevel: z.ZodOptional<z.ZodNullable<z.ZodEnum<["sedentary", "lightly_active", "moderately_active", "very_active"]>>>;
}, "strip", z.ZodTypeAny, {
    summary?: string | null | undefined;
    height?: number | null | undefined;
    weight?: {
        value: number;
        unit: "lbs" | "kg";
        date?: string | null | undefined;
    } | null | undefined;
    bodyComposition?: number | null | undefined;
    fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
}, {
    summary?: string | null | undefined;
    height?: number | null | undefined;
    weight?: {
        value: number;
        unit: "lbs" | "kg";
        date?: string | null | undefined;
    } | null | undefined;
    bodyComposition?: number | null | undefined;
    fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
}>;
export declare const ConstraintSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["injury", "mobility", "medical", "preference"]>;
    description: z.ZodString;
    severity: z.ZodOptional<z.ZodNullable<z.ZodEnum<["mild", "moderate", "severe"]>>>;
    affectedMovements: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    status: z.ZodEnum<["active", "resolved"]>;
    startDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isTemporary: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "injury" | "mobility" | "medical" | "preference";
    status: "active" | "resolved";
    id: string;
    description: string;
    isTemporary: boolean;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
    severity?: "mild" | "moderate" | "severe" | null | undefined;
    affectedMovements?: string[] | null | undefined;
}, {
    type: "injury" | "mobility" | "medical" | "preference";
    status: "active" | "resolved";
    id: string;
    description: string;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
    severity?: "mild" | "moderate" | "severe" | null | undefined;
    affectedMovements?: string[] | null | undefined;
    isTemporary?: boolean | undefined;
}>;
export declare const StrengthDataSchema: z.ZodObject<{
    type: z.ZodLiteral<"strength">;
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    currentProgram: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    keyLifts: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
    preferences: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        workoutStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        likedExercises: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        dislikedExercises: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        workoutStyle?: string | null | undefined;
        likedExercises?: string[] | null | undefined;
        dislikedExercises?: string[] | null | undefined;
    }, {
        workoutStyle?: string | null | undefined;
        likedExercises?: string[] | null | undefined;
        dislikedExercises?: string[] | null | undefined;
    }>>>;
    trainingFrequency: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "strength";
    experience: "beginner" | "intermediate" | "advanced";
    trainingFrequency: number;
    summary?: string | null | undefined;
    currentProgram?: string | null | undefined;
    keyLifts?: Record<string, number> | null | undefined;
    preferences?: {
        workoutStyle?: string | null | undefined;
        likedExercises?: string[] | null | undefined;
        dislikedExercises?: string[] | null | undefined;
    } | null | undefined;
}, {
    type: "strength";
    experience: "beginner" | "intermediate" | "advanced";
    trainingFrequency: number;
    summary?: string | null | undefined;
    currentProgram?: string | null | undefined;
    keyLifts?: Record<string, number> | null | undefined;
    preferences?: {
        workoutStyle?: string | null | undefined;
        likedExercises?: string[] | null | undefined;
        dislikedExercises?: string[] | null | undefined;
    } | null | undefined;
}>;
export declare const CardioDataSchema: z.ZodObject<{
    type: z.ZodLiteral<"cardio">;
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    primaryActivities: z.ZodArray<z.ZodString, "many">;
    keyMetrics: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        weeklyDistance: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        longestSession: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        averagePace: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        preferredIntensity: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "moderate", "high"]>>>;
    }, "strip", z.ZodTypeAny, {
        weeklyDistance?: number | null | undefined;
        longestSession?: number | null | undefined;
        averagePace?: string | null | undefined;
        preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
    }, {
        weeklyDistance?: number | null | undefined;
        longestSession?: number | null | undefined;
        averagePace?: string | null | undefined;
        preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
    }>>>;
    preferences: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        indoor: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        outdoor: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        groupVsIndividual: z.ZodOptional<z.ZodNullable<z.ZodEnum<["group", "individual", "both"]>>>;
        timeOfDay: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        indoor?: boolean | null | undefined;
        outdoor?: boolean | null | undefined;
        groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
        timeOfDay?: string[] | null | undefined;
    }, {
        indoor?: boolean | null | undefined;
        outdoor?: boolean | null | undefined;
        groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
        timeOfDay?: string[] | null | undefined;
    }>>>;
    frequency: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    type: "cardio";
    experience: "beginner" | "intermediate" | "advanced";
    primaryActivities: string[];
    summary?: string | null | undefined;
    preferences?: {
        indoor?: boolean | null | undefined;
        outdoor?: boolean | null | undefined;
        groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
        timeOfDay?: string[] | null | undefined;
    } | null | undefined;
    keyMetrics?: {
        weeklyDistance?: number | null | undefined;
        longestSession?: number | null | undefined;
        averagePace?: string | null | undefined;
        preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
    } | null | undefined;
    frequency?: number | null | undefined;
}, {
    type: "cardio";
    experience: "beginner" | "intermediate" | "advanced";
    primaryActivities: string[];
    summary?: string | null | undefined;
    preferences?: {
        indoor?: boolean | null | undefined;
        outdoor?: boolean | null | undefined;
        groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
        timeOfDay?: string[] | null | undefined;
    } | null | undefined;
    keyMetrics?: {
        weeklyDistance?: number | null | undefined;
        longestSession?: number | null | undefined;
        averagePace?: string | null | undefined;
        preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
    } | null | undefined;
    frequency?: number | null | undefined;
}>;
export declare const ActivityDataSchema: z.ZodArray<z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"strength">;
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    currentProgram: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    keyLifts: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
    preferences: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        workoutStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        likedExercises: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        dislikedExercises: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        workoutStyle?: string | null | undefined;
        likedExercises?: string[] | null | undefined;
        dislikedExercises?: string[] | null | undefined;
    }, {
        workoutStyle?: string | null | undefined;
        likedExercises?: string[] | null | undefined;
        dislikedExercises?: string[] | null | undefined;
    }>>>;
    trainingFrequency: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "strength";
    experience: "beginner" | "intermediate" | "advanced";
    trainingFrequency: number;
    summary?: string | null | undefined;
    currentProgram?: string | null | undefined;
    keyLifts?: Record<string, number> | null | undefined;
    preferences?: {
        workoutStyle?: string | null | undefined;
        likedExercises?: string[] | null | undefined;
        dislikedExercises?: string[] | null | undefined;
    } | null | undefined;
}, {
    type: "strength";
    experience: "beginner" | "intermediate" | "advanced";
    trainingFrequency: number;
    summary?: string | null | undefined;
    currentProgram?: string | null | undefined;
    keyLifts?: Record<string, number> | null | undefined;
    preferences?: {
        workoutStyle?: string | null | undefined;
        likedExercises?: string[] | null | undefined;
        dislikedExercises?: string[] | null | undefined;
    } | null | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"cardio">;
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    primaryActivities: z.ZodArray<z.ZodString, "many">;
    keyMetrics: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        weeklyDistance: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        longestSession: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        averagePace: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        preferredIntensity: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "moderate", "high"]>>>;
    }, "strip", z.ZodTypeAny, {
        weeklyDistance?: number | null | undefined;
        longestSession?: number | null | undefined;
        averagePace?: string | null | undefined;
        preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
    }, {
        weeklyDistance?: number | null | undefined;
        longestSession?: number | null | undefined;
        averagePace?: string | null | undefined;
        preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
    }>>>;
    preferences: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        indoor: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        outdoor: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        groupVsIndividual: z.ZodOptional<z.ZodNullable<z.ZodEnum<["group", "individual", "both"]>>>;
        timeOfDay: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        indoor?: boolean | null | undefined;
        outdoor?: boolean | null | undefined;
        groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
        timeOfDay?: string[] | null | undefined;
    }, {
        indoor?: boolean | null | undefined;
        outdoor?: boolean | null | undefined;
        groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
        timeOfDay?: string[] | null | undefined;
    }>>>;
    frequency: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    type: "cardio";
    experience: "beginner" | "intermediate" | "advanced";
    primaryActivities: string[];
    summary?: string | null | undefined;
    preferences?: {
        indoor?: boolean | null | undefined;
        outdoor?: boolean | null | undefined;
        groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
        timeOfDay?: string[] | null | undefined;
    } | null | undefined;
    keyMetrics?: {
        weeklyDistance?: number | null | undefined;
        longestSession?: number | null | undefined;
        averagePace?: string | null | undefined;
        preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
    } | null | undefined;
    frequency?: number | null | undefined;
}, {
    type: "cardio";
    experience: "beginner" | "intermediate" | "advanced";
    primaryActivities: string[];
    summary?: string | null | undefined;
    preferences?: {
        indoor?: boolean | null | undefined;
        outdoor?: boolean | null | undefined;
        groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
        timeOfDay?: string[] | null | undefined;
    } | null | undefined;
    keyMetrics?: {
        weeklyDistance?: number | null | undefined;
        longestSession?: number | null | undefined;
        averagePace?: string | null | undefined;
        preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
    } | null | undefined;
    frequency?: number | null | undefined;
}>]>, "many">;
export declare const GoalsSchema: z.ZodObject<{
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    primary: z.ZodString;
    timeline: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    specific: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    motivation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    primary: string;
    summary?: string | null | undefined;
    timeline?: number | null | undefined;
    specific?: string | null | undefined;
    motivation?: string | null | undefined;
}, {
    primary: string;
    summary?: string | null | undefined;
    timeline?: number | null | undefined;
    specific?: string | null | undefined;
    motivation?: string | null | undefined;
}>;
export declare const FitnessProfileSchema: z.ZodObject<{
    goals: z.ZodObject<{
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        primary: z.ZodString;
        timeline: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        specific: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        motivation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        primary: string;
        summary?: string | null | undefined;
        timeline?: number | null | undefined;
        specific?: string | null | undefined;
        motivation?: string | null | undefined;
    }, {
        primary: string;
        summary?: string | null | undefined;
        timeline?: number | null | undefined;
        specific?: string | null | undefined;
        motivation?: string | null | undefined;
    }>;
    experienceLevel: z.ZodOptional<z.ZodNullable<z.ZodEnum<["beginner", "intermediate", "advanced"]>>>;
    equipmentAccess: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        gymAccess: z.ZodBoolean;
        gymType: z.ZodOptional<z.ZodNullable<z.ZodEnum<["commercial", "home", "community", "none"]>>>;
        homeEquipment: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        limitations: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        temporaryChanges: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
            startDate: z.ZodString;
            endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            equipmentAvailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            equipmentUnavailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }, {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        gymAccess: boolean;
        summary?: string | null | undefined;
        gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
        homeEquipment?: string[] | null | undefined;
        limitations?: string[] | null | undefined;
        temporaryChanges?: {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }[] | null | undefined;
    }, {
        gymAccess: boolean;
        summary?: string | null | undefined;
        gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
        homeEquipment?: string[] | null | undefined;
        limitations?: string[] | null | undefined;
        temporaryChanges?: {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }[] | null | undefined;
    }>>>;
    availability: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        daysPerWeek: z.ZodNumber;
        minutesPerSession: z.ZodNumber;
        preferredTimes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodEnum<["morning", "afternoon", "evening"]>, "many">>>;
        schedule: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        daysPerWeek: number;
        minutesPerSession: number;
        summary?: string | null | undefined;
        preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
        schedule?: string | null | undefined;
    }, {
        daysPerWeek: number;
        minutesPerSession: number;
        summary?: string | null | undefined;
        preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
        schedule?: string | null | undefined;
    }>>>;
    constraints: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["injury", "mobility", "medical", "preference"]>;
        description: z.ZodString;
        severity: z.ZodOptional<z.ZodNullable<z.ZodEnum<["mild", "moderate", "severe"]>>>;
        affectedMovements: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        status: z.ZodEnum<["active", "resolved"]>;
        startDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        isTemporary: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "injury" | "mobility" | "medical" | "preference";
        status: "active" | "resolved";
        id: string;
        description: string;
        isTemporary: boolean;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        severity?: "mild" | "moderate" | "severe" | null | undefined;
        affectedMovements?: string[] | null | undefined;
    }, {
        type: "injury" | "mobility" | "medical" | "preference";
        status: "active" | "resolved";
        id: string;
        description: string;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        severity?: "mild" | "moderate" | "severe" | null | undefined;
        affectedMovements?: string[] | null | undefined;
        isTemporary?: boolean | undefined;
    }>, "many">>>;
    metrics: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        weight: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodEnum<["lbs", "kg"]>;
            date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        }, {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        }>>>;
        bodyComposition: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        fitnessLevel: z.ZodOptional<z.ZodNullable<z.ZodEnum<["sedentary", "lightly_active", "moderately_active", "very_active"]>>>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | null | undefined;
        height?: number | null | undefined;
        weight?: {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        } | null | undefined;
        bodyComposition?: number | null | undefined;
        fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
    }, {
        summary?: string | null | undefined;
        height?: number | null | undefined;
        weight?: {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        } | null | undefined;
        bodyComposition?: number | null | undefined;
        fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
    }>>>;
    activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"strength">;
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
        currentProgram: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        keyLifts: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
        preferences: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            workoutStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            likedExercises: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            dislikedExercises: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        }, {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        }>>>;
        trainingFrequency: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "strength";
        experience: "beginner" | "intermediate" | "advanced";
        trainingFrequency: number;
        summary?: string | null | undefined;
        currentProgram?: string | null | undefined;
        keyLifts?: Record<string, number> | null | undefined;
        preferences?: {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        } | null | undefined;
    }, {
        type: "strength";
        experience: "beginner" | "intermediate" | "advanced";
        trainingFrequency: number;
        summary?: string | null | undefined;
        currentProgram?: string | null | undefined;
        keyLifts?: Record<string, number> | null | undefined;
        preferences?: {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        } | null | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"cardio">;
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
        primaryActivities: z.ZodArray<z.ZodString, "many">;
        keyMetrics: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            weeklyDistance: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            longestSession: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            averagePace: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            preferredIntensity: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "moderate", "high"]>>>;
        }, "strip", z.ZodTypeAny, {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        }, {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        }>>>;
        preferences: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            indoor: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            outdoor: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            groupVsIndividual: z.ZodOptional<z.ZodNullable<z.ZodEnum<["group", "individual", "both"]>>>;
            timeOfDay: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        }, {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        }>>>;
        frequency: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        type: "cardio";
        experience: "beginner" | "intermediate" | "advanced";
        primaryActivities: string[];
        summary?: string | null | undefined;
        preferences?: {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        } | null | undefined;
        keyMetrics?: {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        } | null | undefined;
        frequency?: number | null | undefined;
    }, {
        type: "cardio";
        experience: "beginner" | "intermediate" | "advanced";
        primaryActivities: string[];
        summary?: string | null | undefined;
        preferences?: {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        } | null | undefined;
        keyMetrics?: {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        } | null | undefined;
        frequency?: number | null | undefined;
    }>]>, "many">>>;
}, "strip", z.ZodTypeAny, {
    goals: {
        primary: string;
        summary?: string | null | undefined;
        timeline?: number | null | undefined;
        specific?: string | null | undefined;
        motivation?: string | null | undefined;
    };
    experienceLevel?: "beginner" | "intermediate" | "advanced" | null | undefined;
    equipmentAccess?: {
        gymAccess: boolean;
        summary?: string | null | undefined;
        gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
        homeEquipment?: string[] | null | undefined;
        limitations?: string[] | null | undefined;
        temporaryChanges?: {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }[] | null | undefined;
    } | null | undefined;
    availability?: {
        daysPerWeek: number;
        minutesPerSession: number;
        summary?: string | null | undefined;
        preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
        schedule?: string | null | undefined;
    } | null | undefined;
    constraints?: {
        type: "injury" | "mobility" | "medical" | "preference";
        status: "active" | "resolved";
        id: string;
        description: string;
        isTemporary: boolean;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        severity?: "mild" | "moderate" | "severe" | null | undefined;
        affectedMovements?: string[] | null | undefined;
    }[] | null | undefined;
    metrics?: {
        summary?: string | null | undefined;
        height?: number | null | undefined;
        weight?: {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        } | null | undefined;
        bodyComposition?: number | null | undefined;
        fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
    } | null | undefined;
    activities?: ({
        type: "strength";
        experience: "beginner" | "intermediate" | "advanced";
        trainingFrequency: number;
        summary?: string | null | undefined;
        currentProgram?: string | null | undefined;
        keyLifts?: Record<string, number> | null | undefined;
        preferences?: {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        } | null | undefined;
    } | {
        type: "cardio";
        experience: "beginner" | "intermediate" | "advanced";
        primaryActivities: string[];
        summary?: string | null | undefined;
        preferences?: {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        } | null | undefined;
        keyMetrics?: {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        } | null | undefined;
        frequency?: number | null | undefined;
    })[] | null | undefined;
}, {
    goals: {
        primary: string;
        summary?: string | null | undefined;
        timeline?: number | null | undefined;
        specific?: string | null | undefined;
        motivation?: string | null | undefined;
    };
    experienceLevel?: "beginner" | "intermediate" | "advanced" | null | undefined;
    equipmentAccess?: {
        gymAccess: boolean;
        summary?: string | null | undefined;
        gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
        homeEquipment?: string[] | null | undefined;
        limitations?: string[] | null | undefined;
        temporaryChanges?: {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }[] | null | undefined;
    } | null | undefined;
    availability?: {
        daysPerWeek: number;
        minutesPerSession: number;
        summary?: string | null | undefined;
        preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
        schedule?: string | null | undefined;
    } | null | undefined;
    constraints?: {
        type: "injury" | "mobility" | "medical" | "preference";
        status: "active" | "resolved";
        id: string;
        description: string;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        severity?: "mild" | "moderate" | "severe" | null | undefined;
        affectedMovements?: string[] | null | undefined;
        isTemporary?: boolean | undefined;
    }[] | null | undefined;
    metrics?: {
        summary?: string | null | undefined;
        height?: number | null | undefined;
        weight?: {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        } | null | undefined;
        bodyComposition?: number | null | undefined;
        fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
    } | null | undefined;
    activities?: ({
        type: "strength";
        experience: "beginner" | "intermediate" | "advanced";
        trainingFrequency: number;
        summary?: string | null | undefined;
        currentProgram?: string | null | undefined;
        keyLifts?: Record<string, number> | null | undefined;
        preferences?: {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        } | null | undefined;
    } | {
        type: "cardio";
        experience: "beginner" | "intermediate" | "advanced";
        primaryActivities: string[];
        summary?: string | null | undefined;
        preferences?: {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        } | null | undefined;
        keyMetrics?: {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        } | null | undefined;
        frequency?: number | null | undefined;
    })[] | null | undefined;
}>;
export declare const CreateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    phoneNumber: z.ZodEffects<z.ZodEffects<z.ZodString, string | null, string>, string | null, string>;
    age: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    gender: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>;
    isAdmin: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>;
    stripeCustomerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    preferredSendHour: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    timezone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    phoneNumber: string | null;
    isActive: boolean | null;
    isAdmin: boolean | null;
    name?: string | null | undefined;
    age?: number | null | undefined;
    email?: string | null | undefined;
    gender?: string | null | undefined;
    preferredSendHour?: number | null | undefined;
    stripeCustomerId?: string | null | undefined;
    timezone?: string | null | undefined;
}, {
    phoneNumber: string;
    name?: string | null | undefined;
    age?: number | null | undefined;
    email?: string | null | undefined;
    gender?: string | null | undefined;
    preferredSendHour?: number | null | undefined;
    stripeCustomerId?: string | null | undefined;
    timezone?: string | null | undefined;
    isActive?: boolean | null | undefined;
    isAdmin?: boolean | null | undefined;
}>;
export declare const UpdateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    email: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    phoneNumber: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string | null, string>, string | null, string>>;
    age: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    gender: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>>;
    isAdmin: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>>;
    stripeCustomerId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    preferredSendHour: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    timezone: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | null | undefined;
    age?: number | null | undefined;
    email?: string | null | undefined;
    gender?: string | null | undefined;
    phoneNumber?: string | null | undefined;
    preferredSendHour?: number | null | undefined;
    stripeCustomerId?: string | null | undefined;
    timezone?: string | null | undefined;
    isActive?: boolean | null | undefined;
    isAdmin?: boolean | null | undefined;
}, {
    name?: string | null | undefined;
    age?: number | null | undefined;
    email?: string | null | undefined;
    gender?: string | null | undefined;
    phoneNumber?: string | undefined;
    preferredSendHour?: number | null | undefined;
    stripeCustomerId?: string | null | undefined;
    timezone?: string | null | undefined;
    isActive?: boolean | null | undefined;
    isAdmin?: boolean | null | undefined;
}>;
export declare const CreateFitnessProfileSchema: z.ZodObject<{
    goals: z.ZodOptional<z.ZodObject<{
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        primary: z.ZodString;
        timeline: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        specific: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        motivation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        primary: string;
        summary?: string | null | undefined;
        timeline?: number | null | undefined;
        specific?: string | null | undefined;
        motivation?: string | null | undefined;
    }, {
        primary: string;
        summary?: string | null | undefined;
        timeline?: number | null | undefined;
        specific?: string | null | undefined;
        motivation?: string | null | undefined;
    }>>;
    experienceLevel: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodEnum<["beginner", "intermediate", "advanced"]>>>>;
    equipmentAccess: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        gymAccess: z.ZodBoolean;
        gymType: z.ZodOptional<z.ZodNullable<z.ZodEnum<["commercial", "home", "community", "none"]>>>;
        homeEquipment: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        limitations: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        temporaryChanges: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            description: z.ZodString;
            startDate: z.ZodString;
            endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            equipmentAvailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            equipmentUnavailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }, {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        gymAccess: boolean;
        summary?: string | null | undefined;
        gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
        homeEquipment?: string[] | null | undefined;
        limitations?: string[] | null | undefined;
        temporaryChanges?: {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }[] | null | undefined;
    }, {
        gymAccess: boolean;
        summary?: string | null | undefined;
        gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
        homeEquipment?: string[] | null | undefined;
        limitations?: string[] | null | undefined;
        temporaryChanges?: {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }[] | null | undefined;
    }>>>>;
    availability: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        daysPerWeek: z.ZodNumber;
        minutesPerSession: z.ZodNumber;
        preferredTimes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodEnum<["morning", "afternoon", "evening"]>, "many">>>;
        schedule: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        daysPerWeek: number;
        minutesPerSession: number;
        summary?: string | null | undefined;
        preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
        schedule?: string | null | undefined;
    }, {
        daysPerWeek: number;
        minutesPerSession: number;
        summary?: string | null | undefined;
        preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
        schedule?: string | null | undefined;
    }>>>>;
    constraints: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["injury", "mobility", "medical", "preference"]>;
        description: z.ZodString;
        severity: z.ZodOptional<z.ZodNullable<z.ZodEnum<["mild", "moderate", "severe"]>>>;
        affectedMovements: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        status: z.ZodEnum<["active", "resolved"]>;
        startDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        isTemporary: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "injury" | "mobility" | "medical" | "preference";
        status: "active" | "resolved";
        id: string;
        description: string;
        isTemporary: boolean;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        severity?: "mild" | "moderate" | "severe" | null | undefined;
        affectedMovements?: string[] | null | undefined;
    }, {
        type: "injury" | "mobility" | "medical" | "preference";
        status: "active" | "resolved";
        id: string;
        description: string;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        severity?: "mild" | "moderate" | "severe" | null | undefined;
        affectedMovements?: string[] | null | undefined;
        isTemporary?: boolean | undefined;
    }>, "many">>>>;
    metrics: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        weight: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            value: z.ZodNumber;
            unit: z.ZodEnum<["lbs", "kg"]>;
            date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        }, {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        }>>>;
        bodyComposition: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        fitnessLevel: z.ZodOptional<z.ZodNullable<z.ZodEnum<["sedentary", "lightly_active", "moderately_active", "very_active"]>>>;
    }, "strip", z.ZodTypeAny, {
        summary?: string | null | undefined;
        height?: number | null | undefined;
        weight?: {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        } | null | undefined;
        bodyComposition?: number | null | undefined;
        fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
    }, {
        summary?: string | null | undefined;
        height?: number | null | undefined;
        weight?: {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        } | null | undefined;
        bodyComposition?: number | null | undefined;
        fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
    }>>>>;
    activities: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"strength">;
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
        currentProgram: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        keyLifts: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
        preferences: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            workoutStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            likedExercises: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            dislikedExercises: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        }, {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        }>>>;
        trainingFrequency: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "strength";
        experience: "beginner" | "intermediate" | "advanced";
        trainingFrequency: number;
        summary?: string | null | undefined;
        currentProgram?: string | null | undefined;
        keyLifts?: Record<string, number> | null | undefined;
        preferences?: {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        } | null | undefined;
    }, {
        type: "strength";
        experience: "beginner" | "intermediate" | "advanced";
        trainingFrequency: number;
        summary?: string | null | undefined;
        currentProgram?: string | null | undefined;
        keyLifts?: Record<string, number> | null | undefined;
        preferences?: {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        } | null | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"cardio">;
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
        primaryActivities: z.ZodArray<z.ZodString, "many">;
        keyMetrics: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            weeklyDistance: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            longestSession: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            averagePace: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            preferredIntensity: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "moderate", "high"]>>>;
        }, "strip", z.ZodTypeAny, {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        }, {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        }>>>;
        preferences: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            indoor: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            outdoor: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            groupVsIndividual: z.ZodOptional<z.ZodNullable<z.ZodEnum<["group", "individual", "both"]>>>;
            timeOfDay: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        }, {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        }>>>;
        frequency: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        type: "cardio";
        experience: "beginner" | "intermediate" | "advanced";
        primaryActivities: string[];
        summary?: string | null | undefined;
        preferences?: {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        } | null | undefined;
        keyMetrics?: {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        } | null | undefined;
        frequency?: number | null | undefined;
    }, {
        type: "cardio";
        experience: "beginner" | "intermediate" | "advanced";
        primaryActivities: string[];
        summary?: string | null | undefined;
        preferences?: {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        } | null | undefined;
        keyMetrics?: {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        } | null | undefined;
        frequency?: number | null | undefined;
    }>]>, "many">>>>;
}, "strip", z.ZodTypeAny, {
    goals?: {
        primary: string;
        summary?: string | null | undefined;
        timeline?: number | null | undefined;
        specific?: string | null | undefined;
        motivation?: string | null | undefined;
    } | undefined;
    experienceLevel?: "beginner" | "intermediate" | "advanced" | null | undefined;
    equipmentAccess?: {
        gymAccess: boolean;
        summary?: string | null | undefined;
        gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
        homeEquipment?: string[] | null | undefined;
        limitations?: string[] | null | undefined;
        temporaryChanges?: {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }[] | null | undefined;
    } | null | undefined;
    availability?: {
        daysPerWeek: number;
        minutesPerSession: number;
        summary?: string | null | undefined;
        preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
        schedule?: string | null | undefined;
    } | null | undefined;
    constraints?: {
        type: "injury" | "mobility" | "medical" | "preference";
        status: "active" | "resolved";
        id: string;
        description: string;
        isTemporary: boolean;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        severity?: "mild" | "moderate" | "severe" | null | undefined;
        affectedMovements?: string[] | null | undefined;
    }[] | null | undefined;
    metrics?: {
        summary?: string | null | undefined;
        height?: number | null | undefined;
        weight?: {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        } | null | undefined;
        bodyComposition?: number | null | undefined;
        fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
    } | null | undefined;
    activities?: ({
        type: "strength";
        experience: "beginner" | "intermediate" | "advanced";
        trainingFrequency: number;
        summary?: string | null | undefined;
        currentProgram?: string | null | undefined;
        keyLifts?: Record<string, number> | null | undefined;
        preferences?: {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        } | null | undefined;
    } | {
        type: "cardio";
        experience: "beginner" | "intermediate" | "advanced";
        primaryActivities: string[];
        summary?: string | null | undefined;
        preferences?: {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        } | null | undefined;
        keyMetrics?: {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        } | null | undefined;
        frequency?: number | null | undefined;
    })[] | null | undefined;
}, {
    goals?: {
        primary: string;
        summary?: string | null | undefined;
        timeline?: number | null | undefined;
        specific?: string | null | undefined;
        motivation?: string | null | undefined;
    } | undefined;
    experienceLevel?: "beginner" | "intermediate" | "advanced" | null | undefined;
    equipmentAccess?: {
        gymAccess: boolean;
        summary?: string | null | undefined;
        gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
        homeEquipment?: string[] | null | undefined;
        limitations?: string[] | null | undefined;
        temporaryChanges?: {
            id: string;
            description: string;
            startDate: string;
            endDate?: string | null | undefined;
            location?: string | null | undefined;
            equipmentAvailable?: string[] | null | undefined;
            equipmentUnavailable?: string[] | null | undefined;
        }[] | null | undefined;
    } | null | undefined;
    availability?: {
        daysPerWeek: number;
        minutesPerSession: number;
        summary?: string | null | undefined;
        preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
        schedule?: string | null | undefined;
    } | null | undefined;
    constraints?: {
        type: "injury" | "mobility" | "medical" | "preference";
        status: "active" | "resolved";
        id: string;
        description: string;
        startDate?: string | null | undefined;
        endDate?: string | null | undefined;
        severity?: "mild" | "moderate" | "severe" | null | undefined;
        affectedMovements?: string[] | null | undefined;
        isTemporary?: boolean | undefined;
    }[] | null | undefined;
    metrics?: {
        summary?: string | null | undefined;
        height?: number | null | undefined;
        weight?: {
            value: number;
            unit: "lbs" | "kg";
            date?: string | null | undefined;
        } | null | undefined;
        bodyComposition?: number | null | undefined;
        fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
    } | null | undefined;
    activities?: ({
        type: "strength";
        experience: "beginner" | "intermediate" | "advanced";
        trainingFrequency: number;
        summary?: string | null | undefined;
        currentProgram?: string | null | undefined;
        keyLifts?: Record<string, number> | null | undefined;
        preferences?: {
            workoutStyle?: string | null | undefined;
            likedExercises?: string[] | null | undefined;
            dislikedExercises?: string[] | null | undefined;
        } | null | undefined;
    } | {
        type: "cardio";
        experience: "beginner" | "intermediate" | "advanced";
        primaryActivities: string[];
        summary?: string | null | undefined;
        preferences?: {
            indoor?: boolean | null | undefined;
            outdoor?: boolean | null | undefined;
            groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
            timeOfDay?: string[] | null | undefined;
        } | null | undefined;
        keyMetrics?: {
            weeklyDistance?: number | null | undefined;
            longestSession?: number | null | undefined;
            averagePace?: string | null | undefined;
            preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
        } | null | undefined;
        frequency?: number | null | undefined;
    })[] | null | undefined;
}>;
export declare const ProfileUpdatePatchSchema: z.ZodObject<{
    field: z.ZodString;
    oldValue: z.ZodNullable<z.ZodUnknown>;
    newValue: z.ZodNullable<z.ZodUnknown>;
    timestamp: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    timestamp: Date;
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
}, {
    timestamp: Date;
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
}>;
export declare const ProfileUpdateRequestSchema: z.ZodObject<{
    updates: z.ZodObject<{
        goals: z.ZodOptional<z.ZodObject<{
            summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            primary: z.ZodString;
            timeline: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            specific: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            motivation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            primary: string;
            summary?: string | null | undefined;
            timeline?: number | null | undefined;
            specific?: string | null | undefined;
            motivation?: string | null | undefined;
        }, {
            primary: string;
            summary?: string | null | undefined;
            timeline?: number | null | undefined;
            specific?: string | null | undefined;
            motivation?: string | null | undefined;
        }>>;
        experienceLevel: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodEnum<["beginner", "intermediate", "advanced"]>>>>;
        equipmentAccess: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
            summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            gymAccess: z.ZodBoolean;
            gymType: z.ZodOptional<z.ZodNullable<z.ZodEnum<["commercial", "home", "community", "none"]>>>;
            homeEquipment: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            limitations: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            temporaryChanges: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                description: z.ZodString;
                startDate: z.ZodString;
                endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                equipmentAvailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
                equipmentUnavailable: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                description: string;
                startDate: string;
                endDate?: string | null | undefined;
                location?: string | null | undefined;
                equipmentAvailable?: string[] | null | undefined;
                equipmentUnavailable?: string[] | null | undefined;
            }, {
                id: string;
                description: string;
                startDate: string;
                endDate?: string | null | undefined;
                location?: string | null | undefined;
                equipmentAvailable?: string[] | null | undefined;
                equipmentUnavailable?: string[] | null | undefined;
            }>, "many">>>;
        }, "strip", z.ZodTypeAny, {
            gymAccess: boolean;
            summary?: string | null | undefined;
            gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
            homeEquipment?: string[] | null | undefined;
            limitations?: string[] | null | undefined;
            temporaryChanges?: {
                id: string;
                description: string;
                startDate: string;
                endDate?: string | null | undefined;
                location?: string | null | undefined;
                equipmentAvailable?: string[] | null | undefined;
                equipmentUnavailable?: string[] | null | undefined;
            }[] | null | undefined;
        }, {
            gymAccess: boolean;
            summary?: string | null | undefined;
            gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
            homeEquipment?: string[] | null | undefined;
            limitations?: string[] | null | undefined;
            temporaryChanges?: {
                id: string;
                description: string;
                startDate: string;
                endDate?: string | null | undefined;
                location?: string | null | undefined;
                equipmentAvailable?: string[] | null | undefined;
                equipmentUnavailable?: string[] | null | undefined;
            }[] | null | undefined;
        }>>>>;
        availability: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
            summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            daysPerWeek: z.ZodNumber;
            minutesPerSession: z.ZodNumber;
            preferredTimes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodEnum<["morning", "afternoon", "evening"]>, "many">>>;
            schedule: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            daysPerWeek: number;
            minutesPerSession: number;
            summary?: string | null | undefined;
            preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
            schedule?: string | null | undefined;
        }, {
            daysPerWeek: number;
            minutesPerSession: number;
            summary?: string | null | undefined;
            preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
            schedule?: string | null | undefined;
        }>>>>;
        constraints: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["injury", "mobility", "medical", "preference"]>;
            description: z.ZodString;
            severity: z.ZodOptional<z.ZodNullable<z.ZodEnum<["mild", "moderate", "severe"]>>>;
            affectedMovements: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            status: z.ZodEnum<["active", "resolved"]>;
            startDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            isTemporary: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            type: "injury" | "mobility" | "medical" | "preference";
            status: "active" | "resolved";
            id: string;
            description: string;
            isTemporary: boolean;
            startDate?: string | null | undefined;
            endDate?: string | null | undefined;
            severity?: "mild" | "moderate" | "severe" | null | undefined;
            affectedMovements?: string[] | null | undefined;
        }, {
            type: "injury" | "mobility" | "medical" | "preference";
            status: "active" | "resolved";
            id: string;
            description: string;
            startDate?: string | null | undefined;
            endDate?: string | null | undefined;
            severity?: "mild" | "moderate" | "severe" | null | undefined;
            affectedMovements?: string[] | null | undefined;
            isTemporary?: boolean | undefined;
        }>, "many">>>>;
        metrics: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
            summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            weight: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                value: z.ZodNumber;
                unit: z.ZodEnum<["lbs", "kg"]>;
                date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: "lbs" | "kg";
                date?: string | null | undefined;
            }, {
                value: number;
                unit: "lbs" | "kg";
                date?: string | null | undefined;
            }>>>;
            bodyComposition: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            fitnessLevel: z.ZodOptional<z.ZodNullable<z.ZodEnum<["sedentary", "lightly_active", "moderately_active", "very_active"]>>>;
        }, "strip", z.ZodTypeAny, {
            summary?: string | null | undefined;
            height?: number | null | undefined;
            weight?: {
                value: number;
                unit: "lbs" | "kg";
                date?: string | null | undefined;
            } | null | undefined;
            bodyComposition?: number | null | undefined;
            fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
        }, {
            summary?: string | null | undefined;
            height?: number | null | undefined;
            weight?: {
                value: number;
                unit: "lbs" | "kg";
                date?: string | null | undefined;
            } | null | undefined;
            bodyComposition?: number | null | undefined;
            fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
        }>>>>;
        activities: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"strength">;
            summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
            currentProgram: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            keyLifts: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodNumber>>>;
            preferences: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                workoutStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                likedExercises: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
                dislikedExercises: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            }, "strip", z.ZodTypeAny, {
                workoutStyle?: string | null | undefined;
                likedExercises?: string[] | null | undefined;
                dislikedExercises?: string[] | null | undefined;
            }, {
                workoutStyle?: string | null | undefined;
                likedExercises?: string[] | null | undefined;
                dislikedExercises?: string[] | null | undefined;
            }>>>;
            trainingFrequency: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: "strength";
            experience: "beginner" | "intermediate" | "advanced";
            trainingFrequency: number;
            summary?: string | null | undefined;
            currentProgram?: string | null | undefined;
            keyLifts?: Record<string, number> | null | undefined;
            preferences?: {
                workoutStyle?: string | null | undefined;
                likedExercises?: string[] | null | undefined;
                dislikedExercises?: string[] | null | undefined;
            } | null | undefined;
        }, {
            type: "strength";
            experience: "beginner" | "intermediate" | "advanced";
            trainingFrequency: number;
            summary?: string | null | undefined;
            currentProgram?: string | null | undefined;
            keyLifts?: Record<string, number> | null | undefined;
            preferences?: {
                workoutStyle?: string | null | undefined;
                likedExercises?: string[] | null | undefined;
                dislikedExercises?: string[] | null | undefined;
            } | null | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"cardio">;
            summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            experience: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
            primaryActivities: z.ZodArray<z.ZodString, "many">;
            keyMetrics: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                weeklyDistance: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                longestSession: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                averagePace: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                preferredIntensity: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "moderate", "high"]>>>;
            }, "strip", z.ZodTypeAny, {
                weeklyDistance?: number | null | undefined;
                longestSession?: number | null | undefined;
                averagePace?: string | null | undefined;
                preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
            }, {
                weeklyDistance?: number | null | undefined;
                longestSession?: number | null | undefined;
                averagePace?: string | null | undefined;
                preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
            }>>>;
            preferences: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                indoor: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                outdoor: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                groupVsIndividual: z.ZodOptional<z.ZodNullable<z.ZodEnum<["group", "individual", "both"]>>>;
                timeOfDay: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            }, "strip", z.ZodTypeAny, {
                indoor?: boolean | null | undefined;
                outdoor?: boolean | null | undefined;
                groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
                timeOfDay?: string[] | null | undefined;
            }, {
                indoor?: boolean | null | undefined;
                outdoor?: boolean | null | undefined;
                groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
                timeOfDay?: string[] | null | undefined;
            }>>>;
            frequency: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            type: "cardio";
            experience: "beginner" | "intermediate" | "advanced";
            primaryActivities: string[];
            summary?: string | null | undefined;
            preferences?: {
                indoor?: boolean | null | undefined;
                outdoor?: boolean | null | undefined;
                groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
                timeOfDay?: string[] | null | undefined;
            } | null | undefined;
            keyMetrics?: {
                weeklyDistance?: number | null | undefined;
                longestSession?: number | null | undefined;
                averagePace?: string | null | undefined;
                preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
            } | null | undefined;
            frequency?: number | null | undefined;
        }, {
            type: "cardio";
            experience: "beginner" | "intermediate" | "advanced";
            primaryActivities: string[];
            summary?: string | null | undefined;
            preferences?: {
                indoor?: boolean | null | undefined;
                outdoor?: boolean | null | undefined;
                groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
                timeOfDay?: string[] | null | undefined;
            } | null | undefined;
            keyMetrics?: {
                weeklyDistance?: number | null | undefined;
                longestSession?: number | null | undefined;
                averagePace?: string | null | undefined;
                preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
            } | null | undefined;
            frequency?: number | null | undefined;
        }>]>, "many">>>>;
    }, "strip", z.ZodTypeAny, {
        goals?: {
            primary: string;
            summary?: string | null | undefined;
            timeline?: number | null | undefined;
            specific?: string | null | undefined;
            motivation?: string | null | undefined;
        } | undefined;
        experienceLevel?: "beginner" | "intermediate" | "advanced" | null | undefined;
        equipmentAccess?: {
            gymAccess: boolean;
            summary?: string | null | undefined;
            gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
            homeEquipment?: string[] | null | undefined;
            limitations?: string[] | null | undefined;
            temporaryChanges?: {
                id: string;
                description: string;
                startDate: string;
                endDate?: string | null | undefined;
                location?: string | null | undefined;
                equipmentAvailable?: string[] | null | undefined;
                equipmentUnavailable?: string[] | null | undefined;
            }[] | null | undefined;
        } | null | undefined;
        availability?: {
            daysPerWeek: number;
            minutesPerSession: number;
            summary?: string | null | undefined;
            preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
            schedule?: string | null | undefined;
        } | null | undefined;
        constraints?: {
            type: "injury" | "mobility" | "medical" | "preference";
            status: "active" | "resolved";
            id: string;
            description: string;
            isTemporary: boolean;
            startDate?: string | null | undefined;
            endDate?: string | null | undefined;
            severity?: "mild" | "moderate" | "severe" | null | undefined;
            affectedMovements?: string[] | null | undefined;
        }[] | null | undefined;
        metrics?: {
            summary?: string | null | undefined;
            height?: number | null | undefined;
            weight?: {
                value: number;
                unit: "lbs" | "kg";
                date?: string | null | undefined;
            } | null | undefined;
            bodyComposition?: number | null | undefined;
            fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
        } | null | undefined;
        activities?: ({
            type: "strength";
            experience: "beginner" | "intermediate" | "advanced";
            trainingFrequency: number;
            summary?: string | null | undefined;
            currentProgram?: string | null | undefined;
            keyLifts?: Record<string, number> | null | undefined;
            preferences?: {
                workoutStyle?: string | null | undefined;
                likedExercises?: string[] | null | undefined;
                dislikedExercises?: string[] | null | undefined;
            } | null | undefined;
        } | {
            type: "cardio";
            experience: "beginner" | "intermediate" | "advanced";
            primaryActivities: string[];
            summary?: string | null | undefined;
            preferences?: {
                indoor?: boolean | null | undefined;
                outdoor?: boolean | null | undefined;
                groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
                timeOfDay?: string[] | null | undefined;
            } | null | undefined;
            keyMetrics?: {
                weeklyDistance?: number | null | undefined;
                longestSession?: number | null | undefined;
                averagePace?: string | null | undefined;
                preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
            } | null | undefined;
            frequency?: number | null | undefined;
        })[] | null | undefined;
    }, {
        goals?: {
            primary: string;
            summary?: string | null | undefined;
            timeline?: number | null | undefined;
            specific?: string | null | undefined;
            motivation?: string | null | undefined;
        } | undefined;
        experienceLevel?: "beginner" | "intermediate" | "advanced" | null | undefined;
        equipmentAccess?: {
            gymAccess: boolean;
            summary?: string | null | undefined;
            gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
            homeEquipment?: string[] | null | undefined;
            limitations?: string[] | null | undefined;
            temporaryChanges?: {
                id: string;
                description: string;
                startDate: string;
                endDate?: string | null | undefined;
                location?: string | null | undefined;
                equipmentAvailable?: string[] | null | undefined;
                equipmentUnavailable?: string[] | null | undefined;
            }[] | null | undefined;
        } | null | undefined;
        availability?: {
            daysPerWeek: number;
            minutesPerSession: number;
            summary?: string | null | undefined;
            preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
            schedule?: string | null | undefined;
        } | null | undefined;
        constraints?: {
            type: "injury" | "mobility" | "medical" | "preference";
            status: "active" | "resolved";
            id: string;
            description: string;
            startDate?: string | null | undefined;
            endDate?: string | null | undefined;
            severity?: "mild" | "moderate" | "severe" | null | undefined;
            affectedMovements?: string[] | null | undefined;
            isTemporary?: boolean | undefined;
        }[] | null | undefined;
        metrics?: {
            summary?: string | null | undefined;
            height?: number | null | undefined;
            weight?: {
                value: number;
                unit: "lbs" | "kg";
                date?: string | null | undefined;
            } | null | undefined;
            bodyComposition?: number | null | undefined;
            fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
        } | null | undefined;
        activities?: ({
            type: "strength";
            experience: "beginner" | "intermediate" | "advanced";
            trainingFrequency: number;
            summary?: string | null | undefined;
            currentProgram?: string | null | undefined;
            keyLifts?: Record<string, number> | null | undefined;
            preferences?: {
                workoutStyle?: string | null | undefined;
                likedExercises?: string[] | null | undefined;
                dislikedExercises?: string[] | null | undefined;
            } | null | undefined;
        } | {
            type: "cardio";
            experience: "beginner" | "intermediate" | "advanced";
            primaryActivities: string[];
            summary?: string | null | undefined;
            preferences?: {
                indoor?: boolean | null | undefined;
                outdoor?: boolean | null | undefined;
                groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
                timeOfDay?: string[] | null | undefined;
            } | null | undefined;
            keyMetrics?: {
                weeklyDistance?: number | null | undefined;
                longestSession?: number | null | undefined;
                averagePace?: string | null | undefined;
                preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
            } | null | undefined;
            frequency?: number | null | undefined;
        })[] | null | undefined;
    }>;
    source: z.ZodEnum<["chat", "form", "admin", "api", "system"]>;
    reason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    source: "system" | "chat" | "admin" | "form" | "api";
    updates: {
        goals?: {
            primary: string;
            summary?: string | null | undefined;
            timeline?: number | null | undefined;
            specific?: string | null | undefined;
            motivation?: string | null | undefined;
        } | undefined;
        experienceLevel?: "beginner" | "intermediate" | "advanced" | null | undefined;
        equipmentAccess?: {
            gymAccess: boolean;
            summary?: string | null | undefined;
            gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
            homeEquipment?: string[] | null | undefined;
            limitations?: string[] | null | undefined;
            temporaryChanges?: {
                id: string;
                description: string;
                startDate: string;
                endDate?: string | null | undefined;
                location?: string | null | undefined;
                equipmentAvailable?: string[] | null | undefined;
                equipmentUnavailable?: string[] | null | undefined;
            }[] | null | undefined;
        } | null | undefined;
        availability?: {
            daysPerWeek: number;
            minutesPerSession: number;
            summary?: string | null | undefined;
            preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
            schedule?: string | null | undefined;
        } | null | undefined;
        constraints?: {
            type: "injury" | "mobility" | "medical" | "preference";
            status: "active" | "resolved";
            id: string;
            description: string;
            isTemporary: boolean;
            startDate?: string | null | undefined;
            endDate?: string | null | undefined;
            severity?: "mild" | "moderate" | "severe" | null | undefined;
            affectedMovements?: string[] | null | undefined;
        }[] | null | undefined;
        metrics?: {
            summary?: string | null | undefined;
            height?: number | null | undefined;
            weight?: {
                value: number;
                unit: "lbs" | "kg";
                date?: string | null | undefined;
            } | null | undefined;
            bodyComposition?: number | null | undefined;
            fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
        } | null | undefined;
        activities?: ({
            type: "strength";
            experience: "beginner" | "intermediate" | "advanced";
            trainingFrequency: number;
            summary?: string | null | undefined;
            currentProgram?: string | null | undefined;
            keyLifts?: Record<string, number> | null | undefined;
            preferences?: {
                workoutStyle?: string | null | undefined;
                likedExercises?: string[] | null | undefined;
                dislikedExercises?: string[] | null | undefined;
            } | null | undefined;
        } | {
            type: "cardio";
            experience: "beginner" | "intermediate" | "advanced";
            primaryActivities: string[];
            summary?: string | null | undefined;
            preferences?: {
                indoor?: boolean | null | undefined;
                outdoor?: boolean | null | undefined;
                groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
                timeOfDay?: string[] | null | undefined;
            } | null | undefined;
            keyMetrics?: {
                weeklyDistance?: number | null | undefined;
                longestSession?: number | null | undefined;
                averagePace?: string | null | undefined;
                preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
            } | null | undefined;
            frequency?: number | null | undefined;
        })[] | null | undefined;
    };
    reason?: string | null | undefined;
}, {
    source: "system" | "chat" | "admin" | "form" | "api";
    updates: {
        goals?: {
            primary: string;
            summary?: string | null | undefined;
            timeline?: number | null | undefined;
            specific?: string | null | undefined;
            motivation?: string | null | undefined;
        } | undefined;
        experienceLevel?: "beginner" | "intermediate" | "advanced" | null | undefined;
        equipmentAccess?: {
            gymAccess: boolean;
            summary?: string | null | undefined;
            gymType?: "none" | "commercial" | "home" | "community" | null | undefined;
            homeEquipment?: string[] | null | undefined;
            limitations?: string[] | null | undefined;
            temporaryChanges?: {
                id: string;
                description: string;
                startDate: string;
                endDate?: string | null | undefined;
                location?: string | null | undefined;
                equipmentAvailable?: string[] | null | undefined;
                equipmentUnavailable?: string[] | null | undefined;
            }[] | null | undefined;
        } | null | undefined;
        availability?: {
            daysPerWeek: number;
            minutesPerSession: number;
            summary?: string | null | undefined;
            preferredTimes?: ("morning" | "afternoon" | "evening")[] | null | undefined;
            schedule?: string | null | undefined;
        } | null | undefined;
        constraints?: {
            type: "injury" | "mobility" | "medical" | "preference";
            status: "active" | "resolved";
            id: string;
            description: string;
            startDate?: string | null | undefined;
            endDate?: string | null | undefined;
            severity?: "mild" | "moderate" | "severe" | null | undefined;
            affectedMovements?: string[] | null | undefined;
            isTemporary?: boolean | undefined;
        }[] | null | undefined;
        metrics?: {
            summary?: string | null | undefined;
            height?: number | null | undefined;
            weight?: {
                value: number;
                unit: "lbs" | "kg";
                date?: string | null | undefined;
            } | null | undefined;
            bodyComposition?: number | null | undefined;
            fitnessLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | null | undefined;
        } | null | undefined;
        activities?: ({
            type: "strength";
            experience: "beginner" | "intermediate" | "advanced";
            trainingFrequency: number;
            summary?: string | null | undefined;
            currentProgram?: string | null | undefined;
            keyLifts?: Record<string, number> | null | undefined;
            preferences?: {
                workoutStyle?: string | null | undefined;
                likedExercises?: string[] | null | undefined;
                dislikedExercises?: string[] | null | undefined;
            } | null | undefined;
        } | {
            type: "cardio";
            experience: "beginner" | "intermediate" | "advanced";
            primaryActivities: string[];
            summary?: string | null | undefined;
            preferences?: {
                indoor?: boolean | null | undefined;
                outdoor?: boolean | null | undefined;
                groupVsIndividual?: "group" | "individual" | "both" | null | undefined;
                timeOfDay?: string[] | null | undefined;
            } | null | undefined;
            keyMetrics?: {
                weeklyDistance?: number | null | undefined;
                longestSession?: number | null | undefined;
                averagePace?: string | null | undefined;
                preferredIntensity?: "low" | "high" | "moderate" | null | undefined;
            } | null | undefined;
            frequency?: number | null | undefined;
        })[] | null | undefined;
    };
    reason?: string | null | undefined;
}>;
export type FitnessProfile = z.infer<typeof FitnessProfileSchema>;
export type ActivityData = z.infer<typeof ActivityDataSchema>;
export type StrengthData = z.infer<typeof StrengthDataSchema>;
export type CardioData = z.infer<typeof CardioDataSchema>;
export type EquipmentAccess = z.infer<typeof EquipmentAccessSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type Goals = z.infer<typeof GoalsSchema>;
export type UserMetrics = z.infer<typeof UserMetricsSchema>;
export type Constraint = z.infer<typeof ConstraintSchema>;
export type TemporaryEnvironmentChange = z.infer<typeof TemporaryEnvironmentChangeSchema>;
//# sourceMappingURL=schemas.d.ts.map