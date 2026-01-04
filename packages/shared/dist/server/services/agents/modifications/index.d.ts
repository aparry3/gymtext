import type { ToolResult } from '../types/shared';
import type { Message } from '@/server/models/message';
/**
 * ModificationService - Orchestration service for modifications agent
 *
 * Handles workout, schedule, and plan modifications via the modifications agent.
 * Fetches its own context and delegates to specialized sub-services.
 *
 * This is an ORCHESTRATION service - it coordinates agent calls.
 * For specific modification operations, use WorkoutModificationService or PlanModificationService.
 */
export declare class ModificationService {
    /**
     * Process a modification request from a user message
     *
     * Fetches context via entity services, calls the modifications agent,
     * and returns a standardized ToolResult.
     *
     * @param userId - The user's ID
     * @param message - The user's modification request message
     * @param previousMessages - Optional conversation history for context
     * @returns ToolResult with response summary and optional messages
     */
    static makeModification(userId: string, message: string, previousMessages?: Message[]): Promise<ToolResult>;
}
export { WorkoutModificationService, workoutModificationService } from './workoutModificationService';
export type { ModifyWorkoutResult, ModifyWeekResult, ModifyWorkoutParams, ModifyWeekParams } from './workoutModificationService';
export { PlanModificationService, planModificationService } from './planModificationService';
export type { ModifyPlanResult, ModifyPlanParams } from './planModificationService';
export { createModificationTools } from './tools';
export type { ModificationToolContext, ModificationToolDeps } from './tools';
//# sourceMappingURL=index.d.ts.map