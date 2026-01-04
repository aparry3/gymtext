import { BaseRepository } from '@/server/repositories/baseRepository';
import { type FitnessPlan } from '@/server/models/fitnessPlan';
/**
 * Repository for fitness plan database operations
 *
 * Plans are now simple structured text - no more JSON mesocycles array
 */
export declare class FitnessPlanRepository extends BaseRepository {
    /**
     * Insert a new fitness plan
     */
    insertFitnessPlan(fitnessPlan: FitnessPlan): Promise<FitnessPlan>;
    /**
     * Get a fitness plan by ID
     */
    getFitnessPlan(id: string): Promise<FitnessPlan | null>;
    /**
     * Get the current (latest) fitness plan for a user
     */
    getCurrentPlan(userId: string): Promise<FitnessPlan | null>;
    /**
     * Get all fitness plans for a user (for history)
     * Returns plans ordered by creation date (newest first)
     */
    getPlanHistory(userId: string): Promise<FitnessPlan[]>;
    /**
     * Update a fitness plan
     */
    updateFitnessPlan(id: string, updates: Partial<Pick<FitnessPlan, 'description' | 'message' | 'structured'>>): Promise<FitnessPlan | null>;
    /**
     * Delete a fitness plan by ID
     */
    deleteFitnessPlan(id: string): Promise<boolean>;
}
//# sourceMappingURL=fitnessPlanRepository.d.ts.map