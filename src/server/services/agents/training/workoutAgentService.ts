import { createAgent, type SubAgentBatch } from '@/server/agents/configurable';
import { WorkoutStructureSchema } from '@/server/agents/training/schemas';
import {
  DAILY_WORKOUT_SYSTEM_PROMPT,
  MODIFY_WORKOUT_SYSTEM_PROMPT,
  ModifyWorkoutGenerationOutputSchema,
  WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
  workoutSmsUserPrompt,
  STRUCTURED_WORKOUT_SYSTEM_PROMPT,
  structuredWorkoutUserPrompt,
} from '@/server/agents/training/workouts/prompts';
import type {
  WorkoutGenerateOutput,
  ModifyWorkoutOutput,
} from '@/server/agents/training/workouts/types';
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

    // Create subAgents for message formatting and structure extraction
    const subAgents: SubAgentBatch[] = [
      {
        message: createAgent({
          name: 'workout-message-generate',
          systemPrompt: WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
          userPrompt: (input: string) => workoutSmsUserPrompt(input),
        }, { model: 'gpt-5-nano' }),
        structure: createAgent({
          name: 'structured-workout-generate',
          systemPrompt: STRUCTURED_WORKOUT_SYSTEM_PROMPT,
          userPrompt: (input: string) => structuredWorkoutUserPrompt(input),
          schema: WorkoutStructureSchema,
        }, { model: 'gpt-5-nano', maxTokens: 32000 }),
      },
    ];

    // Create main agent with context
    const agent = createAgent({
      name: 'workout-generate',
      systemPrompt: DAILY_WORKOUT_SYSTEM_PROMPT,
      context,
      subAgents,
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

    // Helper to extract overview from modify response JSON
    const extractOverview = (jsonString: string): string => {
      try {
        const parsed = JSON.parse(jsonString);
        return parsed.overview || jsonString;
      } catch {
        return jsonString;
      }
    };

    // SubAgents that extract overview from structured JSON response
    const subAgents: SubAgentBatch[] = [
      {
        message: createAgent({
          name: 'workout-message-modify',
          systemPrompt: WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
          userPrompt: (jsonInput: string) => workoutSmsUserPrompt(extractOverview(jsonInput)),
        }, { model: 'gpt-5-nano' }),
        structure: createAgent({
          name: 'structured-workout-modify',
          systemPrompt: STRUCTURED_WORKOUT_SYSTEM_PROMPT,
          userPrompt: (jsonInput: string) => structuredWorkoutUserPrompt(extractOverview(jsonInput)),
          schema: WorkoutStructureSchema,
        }, { model: 'gpt-5-nano', maxTokens: 32000 }),
      },
    ];

    const agent = createAgent({
      name: 'workout-modify',
      systemPrompt: MODIFY_WORKOUT_SYSTEM_PROMPT,
      context,
      schema: ModifyWorkoutGenerationOutputSchema,
      subAgents,
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
