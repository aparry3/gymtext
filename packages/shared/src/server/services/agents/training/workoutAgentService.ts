import { createAgent, PROMPT_IDS, type ConfigurableAgent } from '@/server/agents';
import { WorkoutStructureSchema, type WorkoutStructure } from '@/server/models/workout';
import { ModifyWorkoutGenerationOutputSchema } from '@/server/services/agents/schemas/workouts';
import type { WorkoutGenerateOutput, ModifyWorkoutOutput } from '@/server/services/agents/types/workouts';
import type { ContextService } from '@/server/services/context';
import { ContextType, SnippetType } from '@/server/services/context';
import type { UserWithProfile } from '@/server/models/user';
import type { WorkoutInstance } from '@/server/models/workout';
import type { ActivityType } from '@/shared/types/microcycle/schema';

/**
 * WorkoutAgentService - Handles all workout-related AI operations
 *
 * Responsibilities:
 * - Fetches context via ContextService (injected)
 * - Creates and invokes agents for workout generation/modification
 * - Returns structured results
 *
 * @example
 * ```typescript
 * const workoutAgentService = createWorkoutAgentService(contextService);
 * const result = await workoutAgentService.generateWorkout(user, dayOverview, isDeload);
 * const { response, message, structure } = result;
 * ```
 */
export class WorkoutAgentService {
  private contextService: ContextService;

  // Lazy-initialized sub-agents (promises cached after first creation)
  private messageAgentPromise: Promise<ConfigurableAgent<{ response: string }>> | null = null;
  private structuredAgentPromise: Promise<ConfigurableAgent<{ response: WorkoutStructure }>> | null = null;

  constructor(contextService: ContextService) {
    this.contextService = contextService;
  }

  /**
   * Get the message sub-agent (lazy-initialized for basic use, or with context)
   * Prompts fetched from DB based on agent name
   *
   * @param user - Optional user for context-aware agent (required when activityType is provided)
   * @param activityType - Optional activity type for day format context injection
   */
  public async getMessageAgent(
    user?: UserWithProfile,
    activityType?: ActivityType
  ): Promise<ConfigurableAgent<{ response: string }>> {
    // If activityType is provided, create a new agent with day format context
    if (activityType && user) {
      const dayFormatContext = await this.contextService.getContext(
        user,
        [ContextType.DAY_FORMAT],
        { activityType }
      );
      return createAgent({
        name: PROMPT_IDS.WORKOUT_MESSAGE,
        context: dayFormatContext,
      }, { model: 'gpt-5-nano' });
    }

    // Otherwise, use the cached singleton
    if (!this.messageAgentPromise) {
      this.messageAgentPromise = createAgent({
        name: PROMPT_IDS.WORKOUT_MESSAGE,
      }, { model: 'gpt-5-nano' });
    }
    return this.messageAgentPromise;
  }

  /**
   * Get the structured sub-agent
   * When user is provided, creates a context-aware agent with exercise catalog (not cached).
   * Without user, returns a cached singleton (for modification flows).
   *
   * @param user - Optional user for exercise context injection
   */
  public async getStructuredAgent(
    user?: UserWithProfile
  ): Promise<ConfigurableAgent<{ response: WorkoutStructure }>> {
    // If user provided, create agent with exercise context (not cached)
    if (user) {
      const exerciseContext = await this.contextService.getContext(
        user,
        [ContextType.AVAILABLE_EXERCISES],
        {}
      );
      return createAgent({
        name: PROMPT_IDS.WORKOUT_STRUCTURED,
        context: exerciseContext,
        schema: WorkoutStructureSchema,
      }, { model: 'gpt-5-nano', maxTokens: 32000 });
    }

    // Otherwise, use cached singleton (no exercise context)
    if (!this.structuredAgentPromise) {
      this.structuredAgentPromise = createAgent({
        name: PROMPT_IDS.WORKOUT_STRUCTURED,
        schema: WorkoutStructureSchema,
      }, { model: 'gpt-5-nano', maxTokens: 32000 });
    }
    return this.structuredAgentPromise;
  }

  /**
   * Generate a workout for a specific day
   *
   * @param user - User with profile
   * @param dayOverview - Day overview from microcycle (e.g., "Upper body push focus")
   * @param isDeload - Whether this is a deload week
   * @param activityType - Optional activity type for day format context (TRAINING, ACTIVE_RECOVERY, REST)
   * @returns WorkoutGenerateOutput with response, message, and structure
   */
  async generateWorkout(
    user: UserWithProfile,
    dayOverview: string,
    isDeload: boolean = false,
    activityType?: ActivityType
  ): Promise<WorkoutGenerateOutput> {
    // Build context using ContextService
    const context = await this.contextService.getContext(
      user,
      [
        ContextType.USER_PROFILE,
        ContextType.EXPERIENCE_LEVEL,
        ContextType.DAY_OVERVIEW,
        ContextType.TRAINING_META,
      ],
      {
        dayOverview,
        isDeload,
        snippetType: SnippetType.WORKOUT,
      }
    );

    // Get sub-agents (message agent with day format context if activityType provided)
    const [messageAgent, structuredAgent] = await Promise.all([
      this.getMessageAgent(user, activityType),
      this.getStructuredAgent(user),
    ]);

    // Create main agent with context (prompts fetched from DB)
    const agent = await createAgent({
      name: PROMPT_IDS.WORKOUT_GENERATE,
      context,
      subAgents: [{ message: messageAgent, structure: structuredAgent }],
    }, { model: 'gpt-5.1' });

    // Empty input - DB user prompt provides the instructions
    return agent.invoke('') as Promise<WorkoutGenerateOutput>;
  }

  /**
   * Modify an existing workout based on user constraints/requests
   *
   * @param user - User with profile
   * @param workout - Current workout instance to modify
   * @param changeRequest - User's modification request (e.g., "I hurt my shoulder")
   * @returns ModifyWorkoutOutput with response, message, and structure
   */
  async modifyWorkout(
    user: UserWithProfile,
    workout: WorkoutInstance,
    changeRequest: string
  ): Promise<ModifyWorkoutOutput> {
    // Build context for modification - uses workout
    const context = await this.contextService.getContext(
      user,
      [
        ContextType.USER_PROFILE,
        ContextType.CURRENT_WORKOUT,
      ],
      { workout }
    );

    // Get sub-agents (lazy-initialized)
    const [messageAgent, structuredAgent] = await Promise.all([
      this.getMessageAgent(),
      this.getStructuredAgent(),
    ]);

    // Transform to extract overview from JSON response for sub-agents
    const extractOverview = (mainResult: unknown): string => {
      const jsonString = typeof mainResult === 'string' ? mainResult : JSON.stringify(mainResult);
      try {
        const parsed = JSON.parse(jsonString);
        return parsed.overview || jsonString;
      } catch {
        return jsonString;
      }
    };

    // Prompts fetched from DB based on agent name
    const agent = await createAgent({
      name: PROMPT_IDS.WORKOUT_MODIFY,
      context,
      schema: ModifyWorkoutGenerationOutputSchema,
      subAgents: [{
        message: { agent: messageAgent, transform: extractOverview },
        structure: { agent: structuredAgent, transform: extractOverview },
      }],
    }, { model: 'gpt-5-mini' });

    // Pass changeRequest directly as the message - it's the user's request, not context
    return agent.invoke(changeRequest) as Promise<ModifyWorkoutOutput>;
  }
}

/**
 * Factory function to create a WorkoutAgentService instance
 *
 * @param contextService - ContextService for building agent context
 * @returns A new WorkoutAgentService instance
 */
export function createWorkoutAgentService(contextService: ContextService): WorkoutAgentService {
  return new WorkoutAgentService(contextService);
}
