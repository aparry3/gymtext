import { createAgent, type ConfigurableAgent } from '@/server/agents';
import { WorkoutStructureSchema, type WorkoutStructure } from '@/server/models/workout';
import {
  DAILY_WORKOUT_SYSTEM_PROMPT,
  MODIFY_WORKOUT_SYSTEM_PROMPT,
  ModifyWorkoutGenerationOutputSchema,
  WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
  workoutSmsUserPrompt,
  STRUCTURED_WORKOUT_SYSTEM_PROMPT,
  structuredWorkoutUserPrompt,
} from '@/server/services/agents/prompts/workouts';
import type { WorkoutGenerateOutput, ModifyWorkoutOutput } from '@/server/services/agents/types/workouts';
import { ContextService, ContextType, SnippetType } from '@/server/services/context';
import type { UserWithProfile } from '@/server/models/user';
import type { WorkoutInstance } from '@/server/models/workout';

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
export class WorkoutAgentService {
  private static instance: WorkoutAgentService;

  // Lazy-initialized sub-agents (promises cached after first creation)
  private messageAgentPromise: Promise<ConfigurableAgent<{ response: string }>> | null = null;
  private structuredAgentPromise: Promise<ConfigurableAgent<{ response: WorkoutStructure }>> | null = null;

  private constructor() {}

  /**
   * Lazy-load ContextService to avoid module-load-time initialization
   */
  private getContextService(): ContextService {
    return ContextService.getInstance();
  }

  public static getInstance(): WorkoutAgentService {
    if (!WorkoutAgentService.instance) {
      WorkoutAgentService.instance = new WorkoutAgentService();
    }
    return WorkoutAgentService.instance;
  }

  /**
   * Get the message sub-agent (lazy-initialized)
   */
  public async getMessageAgent(): Promise<ConfigurableAgent<{ response: string }>> {
    if (!this.messageAgentPromise) {
      this.messageAgentPromise = createAgent({
        name: 'workout-message',
        systemPrompt: WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
        userPrompt: (input: string) => workoutSmsUserPrompt(input),
      }, { model: 'gpt-5-nano' });
    }
    return this.messageAgentPromise;
  }

  /**
   * Get the structured sub-agent (lazy-initialized)
   */
  public async getStructuredAgent(): Promise<ConfigurableAgent<{ response: WorkoutStructure }>> {
    if (!this.structuredAgentPromise) {
      this.structuredAgentPromise = createAgent({
        name: 'structured-workout',
        systemPrompt: STRUCTURED_WORKOUT_SYSTEM_PROMPT,
        userPrompt: (input: string) => structuredWorkoutUserPrompt(input),
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
   * @returns WorkoutGenerateOutput with response, message, and structure
   */
  async generateWorkout(
    user: UserWithProfile,
    dayOverview: string,
    isDeload: boolean = false
  ): Promise<WorkoutGenerateOutput> {
    // Build context using ContextService
    const context = await this.getContextService().getContext(
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

    // Get sub-agents (lazy-initialized)
    const [messageAgent, structuredAgent] = await Promise.all([
      this.getMessageAgent(),
      this.getStructuredAgent(),
    ]);

    // Create main agent with context
    const agent = await createAgent({
      name: 'workout-generate',
      systemPrompt: DAILY_WORKOUT_SYSTEM_PROMPT,
      context,
      subAgents: [{ message: messageAgent, structure: structuredAgent }],
    }, { model: 'gpt-5.1' });

    return agent.invoke('Generate the detailed workout for this day.') as Promise<WorkoutGenerateOutput>;
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
    const context = await this.getContextService().getContext(
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

    const agent = await createAgent({
      name: 'workout-modify',
      systemPrompt: MODIFY_WORKOUT_SYSTEM_PROMPT,
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

export const workoutAgentService = WorkoutAgentService.getInstance();
