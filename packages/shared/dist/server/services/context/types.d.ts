import type { WorkoutInstance, Microcycle } from '@/server/models';
import type { ExperienceLevel, SnippetType } from './builders/experienceLevel';
/**
 * Context types that can be requested from the ContextService
 */
export declare enum ContextType {
    USER = "user",
    USER_PROFILE = "userProfile",
    FITNESS_PLAN = "fitnessPlan",
    DAY_OVERVIEW = "dayOverview",
    CURRENT_WORKOUT = "currentWorkout",
    DATE_CONTEXT = "dateContext",
    TRAINING_META = "trainingMeta",
    CURRENT_MICROCYCLE = "currentMicrocycle",
    EXPERIENCE_LEVEL = "experienceLevel",
    DAY_FORMAT = "dayFormat"
}
/**
 * Optional extras that callers can provide to supplement/override auto-fetched data
 */
export interface ContextExtras {
    dayOverview?: string;
    isDeload?: boolean;
    absoluteWeek?: number;
    currentWeek?: number;
    workout?: WorkoutInstance | null;
    microcycle?: Microcycle | null;
    planText?: string;
    date?: Date;
    experienceLevel?: ExperienceLevel;
    snippetType?: SnippetType;
    activityType?: 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST';
}
/**
 * Internal data structure built from user + extras + fetched data
 * Passed to individual builders
 */
export interface ResolvedContextData {
    userName?: string | null;
    userGender?: string | null;
    userAge?: number | null;
    profile?: string | null;
    planText?: string | null;
    dayOverview?: string;
    workout?: WorkoutInstance | null;
    microcycle?: Microcycle | null;
    timezone?: string;
    date?: Date;
    isDeload?: boolean;
    absoluteWeek?: number;
    currentWeek?: number;
    experienceLevel?: ExperienceLevel | null;
    snippetType?: SnippetType;
    activityType?: 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST';
    dayFormatTemplate?: string | null;
    experienceSnippet?: string | null;
}
//# sourceMappingURL=types.d.ts.map