import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';
import type { WorkoutInstance } from '@/server/models/workout';
export type ChainOperation = 'full' | 'structured' | 'message';
export interface ChainRunResult<T> {
    success: boolean;
    data: T;
    executionTimeMs: number;
    operation: ChainOperation;
}
export interface ProfileRegenerationResult {
    success: boolean;
    profile: string;
    executionTimeMs: number;
}
/**
 * Chain Runner Service
 *
 * Enables running individual chain components (structured, formatted, message)
 * or full chains for fitness plans, microcycles, and workouts.
 *
 * Used for testing and iterative improvement of AI outputs.
 */
export declare class ChainRunnerService {
    private static instance;
    private fitnessPlanService;
    private microcycleService;
    private workoutService;
    private userService;
    private fitnessProfileService;
    private onboardingRepository;
    private constructor();
    static getInstance(): ChainRunnerService;
    /**
     * Regenerate a user's profile from their signup data
     * Creates a new profile from scratch using the ProfileUpdateAgent
     */
    runProfileRegeneration(userId: string): Promise<ProfileRegenerationResult>;
    /**
     * Run a chain operation for a fitness plan
     */
    runFitnessPlanChain(planId: string, operation: ChainOperation): Promise<ChainRunResult<FitnessPlan>>;
    private runFullFitnessPlanChain;
    private runFitnessPlanStructuredChain;
    private runFitnessPlanMessageChain;
    /**
     * Run a chain operation for a microcycle
     */
    runMicrocycleChain(microcycleId: string, operation: ChainOperation): Promise<ChainRunResult<Microcycle>>;
    private runFullMicrocycleChain;
    private runMicrocycleStructuredChain;
    private runMicrocycleMessageChain;
    /**
     * Run a chain operation for a workout
     */
    runWorkoutChain(workoutId: string, operation: ChainOperation): Promise<ChainRunResult<WorkoutInstance>>;
    private runFullWorkoutChain;
    private runWorkoutStructuredChain;
    private runWorkoutMessageChain;
}
//# sourceMappingURL=chainRunnerService.d.ts.map