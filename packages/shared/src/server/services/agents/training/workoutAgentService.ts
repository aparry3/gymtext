import { createAgent, PROMPT_IDS, type ConfigurableAgent } from '@/server/agents';
import type { WorkoutStructure } from '@/server/models/workout';
import { WorkoutStructureLLMSchema } from '@/shared/types/workout/workoutStructure';
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

  constructor(contextService: ContextService) {
    this.contextService = contextService;
  }

  /**
   * Get the message sub-agent with user context
   * Prompts fetched from DB based on agent name
   *
   * @param user - User for context-aware agent (required)
   * @param activityType - Optional activity type for day format context injection
   */
  public async getMessageAgent(
    user: UserWithProfile,
    activityType?: ActivityType
  ): Promise<ConfigurableAgent<{ response: string }>> {
    // Create agent with day format context if activityType provided
    const dayFormatContext = activityType
      ? await this.contextService.getContext(user, [ContextType.DAY_FORMAT], { activityType })
      : [];

    return createAgent({
      name: PROMPT_IDS.WORKOUT_MESSAGE,
      context: dayFormatContext,
    }, { model: 'gpt-5-nano' });
  }

  /**
   * Get the structured sub-agent with exercise context
   *
   * IMPORTANT: Uses WorkoutStructureLLMSchema which strips id, exerciseId, nameRaw,
   * and resolution fields to prevent LLM from hallucinating fake exercise IDs.
   * These fields are populated by the exercise resolution service post-generation.
   *
   * @param user - User for exercise context injection (required)
   */
  public async getStructuredAgent(
    user: UserWithProfile
  ): Promise<ConfigurableAgent<{ response: WorkoutStructure }>> {
    const exerciseContext = await this.contextService.getContext(
      user,
      [ContextType.AVAILABLE_EXERCISES],
      {}
    );

    console.log('[WorkoutAgentService] Exercise context for structured agent:',
      exerciseContext.length > 0 ? `${exerciseContext.length} items` : 'No exercises');

    // Use LLM-safe schema that omits id, exerciseId, nameRaw, and resolution
    // These fields are populated by exercise resolution service after generation
    return createAgent({
      name: PROMPT_IDS.WORKOUT_STRUCTURED,
      context: exerciseContext,
      schema: WorkoutStructureLLMSchema,
    }, { model: 'gpt-5-nano', maxTokens: 32000 }) as Promise<ConfigurableAgent<{ response: WorkoutStructure }>>;
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

    // Get sub-agents with user context
    const [messageAgent, structuredAgent] = await Promise.all([
      this.getMessageAgent(user),
      this.getStructuredAgent(user),
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
