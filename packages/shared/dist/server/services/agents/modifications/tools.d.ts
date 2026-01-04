import { type StructuredToolInterface } from '@langchain/core/tools';
import type { ModifyWorkoutResult, ModifyWeekResult } from './workoutModificationService';
import type { ModifyPlanResult } from './planModificationService';
/**
 * Parameters for modifying a workout
 */
export interface ModifyWorkoutParams {
    userId: string;
    workoutDate: Date;
    changeRequest: string;
}
/**
 * Parameters for modifying the weekly pattern
 */
export interface ModifyWeekParams {
    userId: string;
    targetDay: string;
    changeRequest: string;
}
/**
 * Parameters for modifying the fitness plan
 */
export interface ModifyPlanParams {
    userId: string;
    changeRequest: string;
}
/**
 * Dependencies for modification tools (DI pattern)
 */
export interface ModificationToolDeps {
    modifyWorkout: (params: ModifyWorkoutParams) => Promise<ModifyWorkoutResult>;
    modifyWeek: (params: ModifyWeekParams) => Promise<ModifyWeekResult>;
    modifyPlan: (params: ModifyPlanParams) => Promise<ModifyPlanResult>;
}
/**
 * Context required for modification tools (pre-filled from chat context)
 */
export interface ModificationToolContext {
    userId: string;
    message: string;
    workoutDate: Date;
    targetDay: string;
}
/**
 * Factory function to create modification tools with injected dependencies (DI pattern)
 *
 * This allows services to be injected rather than directly imported,
 * breaking circular dependencies and improving testability.
 *
 * All tools return standardized ToolResult: { response: string, messages?: string[] }
 *
 * @param context - Context from chat (userId, message, workoutDate, targetDay)
 * @param deps - Dependencies including workout and microcycle services
 * @returns Array of LangChain tools configured with the provided services
 */
export declare const createModificationTools: (context: ModificationToolContext, deps: ModificationToolDeps) => StructuredToolInterface[];
//# sourceMappingURL=tools.d.ts.map