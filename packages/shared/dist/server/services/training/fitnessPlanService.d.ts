import { FitnessPlan } from '../../models/fitnessPlan';
import { UserWithProfile } from '../../models/user';
/**
 * Simplified FitnessPlanService
 *
 * Creates and manages fitness plans. Plans are now simple structured text
 * that describe the training split, frequency, goals, and progression rules.
 * No more mesocycle generation - microcycles are generated directly from the plan.
 */
export declare class FitnessPlanService {
    private static instance;
    private fitnessPlanRepo;
    private constructor();
    static getInstance(): FitnessPlanService;
    /**
     * Create a new fitness plan for a user
     *
     * Uses the FitnessPlanAgent to generate a structured text plan
     * that contains split, frequency, goals, deload rules, and progression principles.
     */
    createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan>;
    /**
     * Get the current (latest) fitness plan for a user
     */
    getCurrentPlan(userId: string): Promise<FitnessPlan | null>;
    /**
     * Get a fitness plan by ID
     */
    getPlanById(planId: string): Promise<FitnessPlan | null>;
    /**
     * Get all fitness plans for a user (for history)
     */
    getPlanHistory(userId: string): Promise<FitnessPlan[]>;
    /**
     * Update a fitness plan's AI-generated fields
     */
    updateFitnessPlan(planId: string, updates: Partial<Pick<FitnessPlan, 'description' | 'message' | 'structured'>>): Promise<FitnessPlan | null>;
    /**
     * Delete a fitness plan by ID
     */
    deleteFitnessPlan(planId: string): Promise<boolean>;
}
export declare const fitnessPlanService: FitnessPlanService;
//# sourceMappingURL=fitnessPlanService.d.ts.map