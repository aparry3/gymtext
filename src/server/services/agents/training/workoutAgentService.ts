import { createAgent } from '@/server/agents';
import { WorkoutStructureSchema } from '@/server/models/workout';
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
import type { UserWithProfile } from '@/server/models/userModel';
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
  private contextService: ContextService;

  // Sub-agents as class properties (reused between generate/modify)
  private messageAgent = createAgent({
    name: 'workout-message',
    systemPrompt: WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
    userPrompt: (input: string) => workoutSmsUserPrompt(input),
  }, { model: 'gpt-5-nano' });

  private structuredAgent = createAgent({
    name: 'structured-workout',
    systemPrompt: STRUCTURED_WORKOUT_SYSTEM_PROMPT,
    userPrompt: (input: string) => structuredWorkoutUserPrompt(input),
    schema: WorkoutStructureSchema,
  }, { model: 'gpt-5-nano', maxTokens: 32000 });

  private constructor() {
    this.contextService = ContextService.getInstance();
  }

  public static getInstance(): WorkoutAgentService {
    if (!WorkoutAgentService.instance) {
      WorkoutAgentService.instance = new WorkoutAgentService();
    }
    return WorkoutAgentService.instance;
  }

  /**
   * Get the message sub-agent for standalone usage
   */
  public getMessageAgent() {
    return this.messageAgent;
  }

  /**
   * Get the structured sub-agent for standalone usage
   */
  public getStructuredAgent() {
    return this.structuredAgent;
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

    // Create main agent with context (using class property sub-agents)
    const agent = createAgent({
      name: 'workout-generate',
      systemPrompt: DAILY_WORKOUT_SYSTEM_PROMPT,
      context,
      subAgents: [{ message: this.messageAgent, structure: this.structuredAgent }],
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
    // Build context for modification - uses workout and change request
    const context = await this.contextService.getContext(
      user,
      [
        ContextType.USER_PROFILE,
        ContextType.CURRENT_WORKOUT,
        ContextType.CHANGE_REQUEST,
      ],
      {
        workout,
        changeRequest,
      }
    );

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

    const agent = createAgent({
      name: 'workout-modify',
      systemPrompt: MODIFY_WORKOUT_SYSTEM_PROMPT,
      context,
      schema: ModifyWorkoutGenerationOutputSchema,
      subAgents: [{
        message: { agent: this.messageAgent, transform: extractOverview },
        structure: { agent: this.structuredAgent, transform: extractOverview },
      }],
    }, { model: 'gpt-5-mini' });

    return agent.invoke(
      `Using the workout overview, fitness profile, and requested changes from the context, decide whether the workout needs to be modified.
- Follow the reasoning and modification rules from the system instructions.
- Preserve the original training intent and structure as much as possible.
- Apply substitutions or adjustments only when needed based on the user's request and profile.`
    ) as Promise<ModifyWorkoutOutput>;
  }
}

export const workoutAgentService = WorkoutAgentService.getInstance();
