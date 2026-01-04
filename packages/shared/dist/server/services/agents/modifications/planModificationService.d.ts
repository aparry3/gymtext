/**
 * PlanModificationService
 *
 * Orchestration service for fitness plan modifications.
 *
 * Responsibilities:
 * - Modify fitness plans based on user change requests
 * - Delegate week/microcycle/workout modifications to WorkoutModificationService
 * - Handle AI agent interactions for plan modifications
 * - Run plan and week modifications in parallel for faster response
 *
 * This service follows the orchestration pattern and coordinates with
 * WorkoutModificationService for microcycle and workout updates.
 */
export interface ModifyPlanParams {
    userId: string;
    changeRequest: string;
}
export interface ModifyPlanResult {
    success: boolean;
    wasModified?: boolean;
    modifications?: string;
    messages: string[];
    error?: string;
}
export declare class PlanModificationService {
    private static instance;
    private userService;
    private fitnessPlanService;
    private fitnessPlanRepo;
    private workoutModificationService;
    private constructor();
    static getInstance(): PlanModificationService;
    /**
     * Modify a user's fitness plan based on their change request
     * Modifies (not regenerates) the current microcycle to preserve completed workouts
     * Runs plan and microcycle modifications in parallel for faster response
     */
    modifyPlan(params: ModifyPlanParams): Promise<ModifyPlanResult>;
}
export declare const planModificationService: PlanModificationService;
//# sourceMappingURL=planModificationService.d.ts.map