import { Microcycle } from '@/server/models/microcycle';
import { FitnessPlan } from '@/server/models/fitnessPlan';
import type { ProgressInfo } from './progressService';
/**
 * Simplified MicrocycleService
 *
 * Creates and manages microcycles. Now works directly with fitness plan text
 * instead of mesocycle overviews. Uses absoluteWeek and days array.
 */
export declare class MicrocycleService {
    private static instance;
    private microcycleRepo;
    private userService;
    private constructor();
    static getInstance(): MicrocycleService;
    /**
     * Get the active microcycle for a client (the one flagged as active in DB)
     */
    getActiveMicrocycle(clientId: string): Promise<Microcycle | null>;
    /**
     * Check if the active microcycle encompasses the current week in the client's timezone
     */
    isActiveMicrocycleCurrent(clientId: string, timezone?: string): Promise<boolean>;
    /**
     * Get all microcycles for a client
     */
    getAllMicrocycles(clientId: string): Promise<Microcycle[]>;
    /**
     * Get microcycle by absolute week number
     * Queries by clientId + absoluteWeek only (not fitnessPlanId)
     */
    getMicrocycleByAbsoluteWeek(clientId: string, absoluteWeek: number): Promise<Microcycle | null>;
    /**
     * Get microcycle for a specific date
     * Used for date-based progress tracking - finds the microcycle that contains the target date
     * Queries by clientId + date range only (not fitnessPlanId)
     */
    getMicrocycleByDate(clientId: string, targetDate: Date): Promise<Microcycle | null>;
    /**
     * Get a microcycle by ID
     */
    getMicrocycleById(microcycleId: string): Promise<Microcycle | null>;
    /**
     * Update a microcycle's days array
     */
    updateMicrocycleDays(microcycleId: string, days: string[]): Promise<Microcycle | null>;
    /**
     * Update a microcycle
     */
    updateMicrocycle(microcycleId: string, microcycle: Partial<Microcycle>): Promise<Microcycle | null>;
    /**
     * Create a new microcycle from progress information
     * Uses fitness plan text and user profile to generate the week
     */
    createMicrocycleFromProgress(clientId: string, plan: FitnessPlan, progress: ProgressInfo): Promise<Microcycle>;
    /**
     * Generate a microcycle using AI agent service
     * Fitness plan is auto-fetched by context service
     * The agent determines isDeload based on the plan's Progression Strategy
     */
    private generateMicrocycle;
    /**
     * Calculate week dates in a specific timezone
     */
    private calculateWeekDates;
    /**
     * Delete a microcycle and all associated workouts
     * Returns the count of deleted workouts along with success status
     */
    deleteMicrocycleWithWorkouts(microcycleId: string): Promise<{
        deleted: boolean;
        deletedWorkoutsCount: number;
    }>;
}
export declare const microcycleService: MicrocycleService;
//# sourceMappingURL=microcycleService.d.ts.map