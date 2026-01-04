import { type ConfigurableAgent } from '@/server/agents';
import { type MicrocycleStructure } from '@/server/models/microcycle';
import type { Microcycle } from '@/server/models/microcycle';
import type { UserWithProfile } from '@/server/models/user';
/**
 * MicrocycleAgentService - Handles all microcycle-related AI operations
 *
 * Responsibilities:
 * - Fetches context via ContextService
 * - Creates and invokes agents for microcycle generation
 * - Includes retry logic for validation
 * - Returns structured results
 *
 * @example
 * ```typescript
 * const result = await microcycleAgentService.generateMicrocycle(user, planText, absoluteWeek, isDeload);
 * const { days, description, isDeload, message, structure } = result;
 * ```
 */
export declare class MicrocycleAgentService {
    private static instance;
    private messageAgentPromise;
    private structuredAgentPromise;
    private constructor();
    /**
     * Lazy-load ContextService to avoid module-load-time initialization
     */
    private getContextService;
    static getInstance(): MicrocycleAgentService;
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
        response: MicrocycleStructure;
    }>>;
    /**
     * Generate a weekly microcycle training pattern
     *
     * Includes retry logic (MAX_RETRIES = 3) with validation to ensure all 7 days are generated.
     * The agent determines isDeload based on the plan's Progression Strategy and absolute week.
     * Fitness plan is automatically fetched by the context service.
     *
     * @param user - User with profile
     * @param absoluteWeek - Week number from plan start (1-indexed)
     * @returns Object with days, description, isDeload, message, and structure (matching legacy format)
     */
    generateMicrocycle(user: UserWithProfile, absoluteWeek: number): Promise<{
        days: string[];
        description: string;
        isDeload: boolean;
        message: string;
        structure?: MicrocycleStructure;
    }>;
    /**
     * Modify an existing microcycle based on user constraints/requests
     *
     * Includes retry logic (MAX_RETRIES = 3) with validation to ensure all 7 days are present.
     *
     * @param user - User with profile
     * @param currentMicrocycle - Current microcycle to modify
     * @param changeRequest - User's modification request (passed directly to invoke)
     * @returns Object with days, description, isDeload, message, structure, wasModified, modifications (matching legacy format)
     */
    modifyMicrocycle(user: UserWithProfile, currentMicrocycle: Microcycle, changeRequest: string): Promise<{
        days: string[];
        description: string;
        isDeload: boolean;
        message: string;
        structure?: MicrocycleStructure;
        wasModified: boolean;
        modifications: string;
    }>;
}
export declare const microcycleAgentService: MicrocycleAgentService;
//# sourceMappingURL=microcycleAgentService.d.ts.map