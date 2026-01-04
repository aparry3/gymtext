import { type ConfigurableAgent } from '@/server/agents';
import { type PlanStructure } from '@/server/models/fitnessPlan';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
/**
 * FitnessPlanAgentService - Handles all fitness plan-related AI operations
 *
 * Responsibilities:
 * - Creates and invokes agents for fitness plan generation
 * - Uses ContextService to build context from user profile
 * - Returns structured results in legacy format
 *
 * @example
 * ```typescript
 * const result = await fitnessPlanAgentService.generateFitnessPlan(user);
 * const { description, message, structure } = result;
 * ```
 */
export declare class FitnessPlanAgentService {
    private static instance;
    private messageAgentPromise;
    private structuredAgentPromise;
    private getContextService;
    private constructor();
    static getInstance(): FitnessPlanAgentService;
    /**
     * Get the message sub-agent (lazy-initialized)
     * System prompt fetched from DB, userPrompt transforms JSON data
     */
    getMessageAgent(): Promise<ConfigurableAgent<{
        response: string;
    }>>;
    /**
     * Get the structured sub-agent (lazy-initialized)
     * System prompt fetched from DB, userPrompt transforms JSON data
     */
    getStructuredAgent(): Promise<ConfigurableAgent<{
        response: PlanStructure;
    }>>;
    /**
     * Generate a fitness plan for a user
     *
     * @param user - User with profile containing goals, preferences, etc.
     * @returns Object with description, message, and structure (matching legacy format)
     */
    generateFitnessPlan(user: UserWithProfile): Promise<{
        description: string;
        message: string;
        structure: PlanStructure;
    }>;
    /**
     * Modify an existing fitness plan based on user constraints/requests
     *
     * @param user - User with profile
     * @param currentPlan - Current fitness plan to modify
     * @param changeRequest - User's modification request
     * @returns Object with description, wasModified, modifications, structure (matching legacy format)
     */
    modifyFitnessPlan(user: UserWithProfile, currentPlan: FitnessPlan, changeRequest: string): Promise<{
        description: string;
        wasModified: boolean;
        modifications: string;
        structure: PlanStructure;
    }>;
}
export declare const fitnessPlanAgentService: FitnessPlanAgentService;
//# sourceMappingURL=fitnessPlanAgentService.d.ts.map