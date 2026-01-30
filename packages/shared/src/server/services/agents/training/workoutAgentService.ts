import { z } from 'zod';
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
 * Schema for workout validation agent output
 */
const WorkoutValidationOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the structured workout is valid and complete'),
  errors: z.array(z.string()).describe('List of validation errors if invalid'),
});

type WorkoutValidationOutput = z.infer<typeof WorkoutValidationOutputSchema>;

/**
 * Safe JSON parse helper - returns parsed object or original string
 */
function safeJsonParse(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

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
   * Get the validation sub-agent for checking workout completeness
   *
   * This agent compares the generate agent's output (full workout intent) with
   * the structured agent's output (WorkoutStructure) to ensure nothing was lost.
   */
  public async getValidationAgent(): Promise<ConfigurableAgent<{ response: WorkoutValidationOutput }>> {
    return createAgent({
      name: PROMPT_IDS.WORKOUT_STRUCTURED_VALIDATE,
      schema: WorkoutValidationOutputSchema,
    }, { model: 'gpt-5-nano' });
  }

  /**
   * Get the structured sub-agent with exercise context and validation
   *
   * IMPORTANT: Uses WorkoutStructureLLMSchema which strips id, exerciseId, nameRaw,
   * and resolution fields to prevent LLM from hallucinating fake exercise IDs.
   * These fields are populated by the exercise resolution service post-generation.
   *
   * The structured agent includes a validation sub-agent that checks completeness
   * by comparing against the generate agent's output.
   *
   * @param user - User for exercise context injection (required)
   */
  public async getStructuredAgent(
    user: UserWithProfile
  ): Promise<ConfigurableAgent<{ response: WorkoutStructure; validation: WorkoutValidationOutput }>> {
    const exerciseContext = await this.contextService.getContext(
      user,
      [ContextType.AVAILABLE_EXERCISES],
      {}
    );

    console.log('[WorkoutAgentService] Exercise context for structured agent:',
      exerciseContext.length > 0 ? `${exerciseContext.length} items` : 'No exercises');

    const validationAgent = await this.getValidationAgent();

    // Use LLM-safe schema that omits id, exerciseId, nameRaw, and resolution
    // These fields are populated by exercise resolution service after generation
    // Validation sub-agent receives both structured output and generate output for comparison
    return createAgent({
      name: PROMPT_IDS.WORKOUT_STRUCTURED,
      context: exerciseContext,
      schema: WorkoutStructureLLMSchema,
      subAgents: [{
        validation: {
          agent: validationAgent,
          // Transform uses BOTH params: mainResult (structured output) + parentInput (generate output)
          transform: (mainResult, parentInput) => {
            const parsedInput = parentInput ? safeJsonParse(parentInput) : {};
            const validationPayload = {
              // mainResult = the structured agent's output (WorkoutStructure)
              // parentInput = the generate agent's output (full workout description)
              input: parsedInput,
              output: mainResult,
            };

            // Log inputs to validation agent for debugging
            console.log('\n========== VALIDATION AGENT INPUT ==========');
            console.log('[Validation] Generate agent output (input):');
            console.log(JSON.stringify(parsedInput, null, 2));
            console.log('\n[Validation] Structured agent output (output):');
            console.log(JSON.stringify(mainResult, null, 2));
            console.log('=============================================\n');

            return JSON.stringify(validationPayload);
          },
        },
      }],
    }, { model: 'gpt-5-nano', maxTokens: 32000 }) as Promise<ConfigurableAgent<{ response: WorkoutStructure; validation: WorkoutValidationOutput }>>;
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
    // The structured agent has validation built-in via sub-agent
    // We configure validate + maxRetries here to retry on validation failure
    const agent = await createAgent({
      name: PROMPT_IDS.WORKOUT_GENERATE,
      context,
      subAgents: [{
        message: messageAgent,
        structure: {
          agent: structuredAgent,
          // Validate checks the validation sub-agent's result
          validate: (result) => {
            const typedResult = result as { response: WorkoutStructure; validation: WorkoutValidationOutput };
            const isValid = typedResult.validation?.isValid === true;

            // Log validation result for debugging
            console.log('\n========== VALIDATION RESULT ==========');
            console.log('[Validation] isValid:', isValid);
            console.log('[Validation] Full validation response:', JSON.stringify(typedResult.validation, null, 2));
            if (!isValid && typedResult.validation?.errors) {
              console.log('[Validation] Errors:', typedResult.validation.errors);
            }
            console.log('========================================\n');

            return isValid;
          },
          maxRetries: 3,
        },
      }],
    }, { model: 'gpt-5.1' });

    // Empty input - DB user prompt provides the instructions
    const result = await agent.invoke('');

    // Extract the structure from the nested result (strip validation metadata)
    const typedResult = result as {
      response: string;
      message: string;
      structure: { response: WorkoutStructure; validation: WorkoutValidationOutput };
    };

    return {
      response: typedResult.response,
      message: typedResult.message,
      structure: typedResult.structure.response,
    };
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
