import { type ConfigurableAgent } from '@/server/agents';
import { type WorkoutStructure } from '@/server/models/workout';
import type { WorkoutGenerateOutput, ModifyWorkoutOutput } from '@/server/services/agents/types/workouts';
import type { UserWithProfile } from '@/server/models/user';
import type { WorkoutInstance } from '@/server/models/workout';
import type { ActivityType } from '@/shared/types/microcycle/schema';
/**
 * WorkoutAgentService - Handles all workout-related AI operations
 *
 * Responsibilities:
 * - Fetches context via ContextService
 * - Creates and invokes agents for workout generation/modification
 * - Returns structured results
 *
 * @example
 * ```typescript
 * const result = await workoutAgentService.generateWorkout(user, dayOverview, isDeload);
 * const { response, message, structure } = result;
 * ```
 */
export declare class WorkoutAgentService {
    private static instance;
    private messageAgentPromise;
    private structuredAgentPromise;
    private constructor();
    /**
     * Lazy-load ContextService to avoid module-load-time initialization
     */
    private getContextService;
    static getInstance(): WorkoutAgentService;
    /**
     * Get the message sub-agent (lazy-initialized for basic use, or with context)
     * Prompts fetched from DB based on agent name
     *
     * @param user - Optional user for context-aware agent (required when activityType is provided)
     * @param activityType - Optional activity type for day format context injection
     */
    getMessageAgent(user?: UserWithProfile, activityType?: ActivityType): Promise<ConfigurableAgent<{
        response: string;
    }>>;
    /**
     * Get the structured sub-agent (lazy-initialized)
     * Prompts fetched from DB based on agent name
     */
    getStructuredAgent(): Promise<ConfigurableAgent<{
        response: WorkoutStructure;
    }>>;
    /**
     * Generate a workout for a specific day
     *
     * @param user - User with profile
     * @param dayOverview - Day overview from microcycle (e.g., "Upper body push focus")
     * @param isDeload - Whether this is a deload week
     * @param activityType - Optional activity type for day format context (TRAINING, ACTIVE_RECOVERY, REST)
     * @returns WorkoutGenerateOutput with response, message, and structure
     */
    generateWorkout(user: UserWithProfile, dayOverview: string, isDeload?: boolean, activityType?: ActivityType): Promise<WorkoutGenerateOutput>;
    /**
     * Modify an existing workout based on user constraints/requests
     *
     * @param user - User with profile
     * @param workout - Current workout instance to modify
     * @param changeRequest - User's modification request (e.g., "I hurt my shoulder")
     * @returns ModifyWorkoutOutput with response, message, and structure
     */
    modifyWorkout(user: UserWithProfile, workout: WorkoutInstance, changeRequest: string): Promise<ModifyWorkoutOutput>;
}
export declare const workoutAgentService: WorkoutAgentService;
//# sourceMappingURL=workoutAgentService.d.ts.map