import type { UserWithProfile } from '@/server/models';
import type { FitnessPlanService } from '@/server/services/training/fitnessPlanService';
import type { WorkoutInstanceService } from '@/server/services/training/workoutInstanceService';
import type { MicrocycleService } from '@/server/services/training/microcycleService';
import type { ProfileRepository } from '@/server/repositories/profileRepository';
import { ContextType, type ContextExtras } from './types';
/**
 * Dependencies for ContextService
 */
export interface ContextServiceDeps {
    fitnessPlanService: FitnessPlanService;
    workoutInstanceService: WorkoutInstanceService;
    microcycleService: MicrocycleService;
    profileRepository: ProfileRepository;
}
/**
 * ContextService - Builds context arrays for createAgent
 *
 * Orchestrates fetching context data from domain services and formats
 * it into strings for the agent's context array.
 *
 * @example
 * ```typescript
 * const context = await contextService.getContext(
 *   user,
 *   [ContextType.USER_PROFILE, ContextType.DAY_OVERVIEW, ContextType.TRAINING_META],
 *   { dayOverview: input.dayOverview, isDeload: input.isDeload }
 * );
 *
 * const agent = createAgent({
 *   name: 'workout-generate',
 *   systemPrompt: SYSTEM_PROMPT,
 *   context,
 * }, config);
 * ```
 */
export declare class ContextService {
    private static instance;
    private deps;
    private constructor();
    /**
     * Initialize the singleton with dependencies
     * Must be called before getInstance()
     */
    static initialize(deps: ContextServiceDeps): ContextService;
    /**
     * Get the singleton instance
     * Throws if not initialized
     */
    static getInstance(): ContextService;
    /**
     * Build context array for createAgent
     *
     * Determines which services need to be called based on requested context types,
     * fetches data in parallel, and builds formatted context strings.
     *
     * @param user - User with profile
     * @param types - Array of context types to include
     * @param extras - Optional caller-provided data (supplements/overrides auto-fetched data)
     * @returns Array of formatted context strings ready for createAgent
     */
    getContext(user: UserWithProfile, types: ContextType[], extras?: ContextExtras): Promise<string[]>;
    /**
     * Build a single context string by type
     */
    private buildContextForType;
}
//# sourceMappingURL=contextService.d.ts.map