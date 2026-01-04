import type { ModifyWorkoutOutput, WorkoutGenerateOutput } from '@/server/services/agents/types/workouts';
/**
 * WorkoutModificationService
 *
 * Orchestration service for all workout-related modifications.
 *
 * Responsibilities:
 * - Coordinate weekly pattern modifications across microcycle and workout services
 * - Orchestrate single workout modifications (substitutions and replacements)
 * - Handle AI agent interactions for workout modifications
 * - Ensure proper sequencing and state updates across multiple entities
 *
 * This service follows the orchestration pattern (like OnboardingService, DailyMessageService)
 * and eliminates circular dependencies between MicrocycleService and WorkoutInstanceService.
 */
export interface ModifyWorkoutParams {
    userId: string;
    workoutDate: Date;
    changeRequest: string;
}
export interface ModifyWorkoutResult {
    success: boolean;
    workout?: ModifyWorkoutOutput;
    modifications?: string;
    messages: string[];
    error?: string;
}
export interface ModifyWeekParams {
    userId: string;
    targetDay: string;
    changeRequest: string;
}
export interface ModifyWeekResult {
    success: boolean;
    workout?: WorkoutGenerateOutput;
    modifiedDays?: number;
    modifications?: string;
    messages: string[];
    error?: string;
}
export declare class WorkoutModificationService {
    private static instance;
    private userService;
    private microcycleService;
    private workoutInstanceService;
    private progressService;
    private fitnessPlanService;
    private constructor();
    static getInstance(): WorkoutModificationService;
    /**
     * Modify an entire workout based on constraints
     */
    modifyWorkout(params: ModifyWorkoutParams): Promise<ModifyWorkoutResult>;
    /**
     * Modify the weekly pattern for remaining days and regenerate a single workout
     */
    modifyWeek(params: ModifyWeekParams): Promise<ModifyWeekResult>;
    /**
     * Map workout theme to session type for database storage
     */
    private mapThemeToSessionType;
}
export declare const workoutModificationService: WorkoutModificationService;
//# sourceMappingURL=workoutModificationService.d.ts.map