import { FitnessPlan } from '../../models/fitnessPlan';
import { Microcycle } from '../../models/microcycle';
/**
 * Simplified ProgressInfo without mesocycle layer
 */
export interface ProgressInfo {
    fitnessPlan: FitnessPlan;
    microcycle: Microcycle | null;
    absoluteWeek: number;
    dayOfWeek: number;
    weekStartDate: Date;
    weekEndDate: Date;
}
/**
 * Simplified ProgressService
 *
 * Calculates progress based on plan start date and absolute week number.
 * No mesocycle layer - deload logic is derived from plan description.
 */
export declare class ProgressService {
    private static instance;
    private microcycleService;
    private constructor();
    static getInstance(): ProgressService;
    /**
     * Calculate progress for a specific date based on the fitness plan
     * Uses absolute week number from plan start - no mesocycle lookup needed
     */
    getProgressForDate(plan: FitnessPlan, targetDate: Date, timezone?: string): Promise<ProgressInfo | null>;
    /**
     * Get progress for the current date in the user's timezone
     */
    getCurrentProgress(plan: FitnessPlan, timezone?: string): Promise<ProgressInfo | null>;
    /**
     * Get or create microcycle for a specific date
     * This is the main entry point for ensuring a user has a microcycle for any given week
     *
     * @param forceCreate - When true, always creates new microcycle (for re-onboarding)
     */
    getOrCreateMicrocycleForDate(userId: string, plan: FitnessPlan, targetDate: Date, timezone?: string, forceCreate?: boolean): Promise<{
        microcycle: Microcycle;
        progress: ProgressInfo;
        wasCreated: boolean;
    }>;
}
export declare const progressService: ProgressService;
//# sourceMappingURL=progressService.d.ts.map