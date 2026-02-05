import { z } from 'zod';
import { createAgent, PROMPT_IDS, resolveAgentConfig, type ConfigurableAgent, type ValidationResult, type AgentLoggingContext, type AgentServices } from '@/server/agents';
import type { WorkoutStructure } from '@/server/models/workout';
import { WorkoutStructureLLMSchema } from '@/shared/types/workout/workoutStructure';
import { ModifyWorkoutGenerationOutputSchema } from '@/server/services/agents/schemas/workouts';
import type { WorkoutGenerateOutput, ModifyWorkoutOutput } from '@/server/services/agents/types/workouts';
import type { ContextService } from '@/server/services/context';
import { ContextType, SnippetType } from '@/server/services/context';
import type { UserWithProfile } from '@/server/models/user';
import type { WorkoutInstance } from '@/server/models/workout';
import type { ActivityType } from '@/shared/types/microcycle/schema';
import { normalizeWhitespace } from '@/server/utils/formatters';
import type { EventLogRepository } from '@/server/repositories/eventLogRepository';

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
 * const workoutAgentService = createWorkoutAgentService(contextService, eventLogRepo, agentServices);
 * const result = await workoutAgentService.generateWorkout(user, dayOverview, isDeload);
 * const { response, message, structure } = result;
 * ```
 */
export class WorkoutAgentService {
  private contextService: ContextService;
  private eventLogRepo?: EventLogRepository;
  private agentServices: AgentServices;

  constructor(contextService: ContextService, eventLogRepo?: EventLogRepository, agentServices?: AgentServices) {
    this.contextService = contextService;
    this.eventLogRepo = eventLogRepo;
    if (!agentServices) {
      throw new Error('agentServices is required for WorkoutAgentService');
    }
    this.agentServices = agentServices;
  }

  /**
   * Get the message sub-agent with user context
   *
   * @param user - User for context-aware agent (required)
   * @param activityType - Optional activity type for day format context injection
   */
  public async getMessageAgent(
    user: UserWithProfile,
    activityType?: ActivityType
  ): Promise<ConfigurableAgent<{ response: string }>> {
    // Fetch config at service layer
    const { systemPrompt, userPrompt: dbUserPrompt, modelConfig } = await resolveAgentConfig(
      PROMPT_IDS.WORKOUT_MESSAGE,
      this.agentServices,
      { overrides: { model: 'gpt-5-nano' } }
    );

    // Create agent with day format context if activityType provided
    const dayFormatContext = activityType
      ? await this.contextService.getContext(user, [ContextType.DAY_FORMAT], { activityType })
      : [];

    return createAgent({
      name: PROMPT_IDS.WORKOUT_MESSAGE,
      systemPrompt,
      dbUserPrompt,
      context: dayFormatContext,
    }, modelConfig);
  }

  /**
   * Get the validation sub-agent for checking workout completeness
   *
   * This agent compares the generate agent's output (full workout intent) with
   * the structured agent's output (WorkoutStructure) to ensure nothing was lost.
   */
  public async getValidationAgent(): Promise<ConfigurableAgent<{ response: WorkoutValidationOutput }>> {
    // Fetch config at service layer
    const { systemPrompt, userPrompt: dbUserPrompt, modelConfig } = await resolveAgentConfig(
      PROMPT_IDS.WORKOUT_STRUCTURED_VALIDATE,
      this.agentServices,
      { overrides: { model: 'gpt-5-nano' } }
    );

    return createAgent({
      name: PROMPT_IDS.WORKOUT_STRUCTURED_VALIDATE,
      systemPrompt,
      dbUserPrompt,
      schema: WorkoutValidationOutputSchema,
    }, modelConfig);
  }

  /**
   * Get the structured sub-agent with exercise context and validation
   *
   * IMPORTANT: Uses WorkoutStructureLLMSchema which strips id, exerciseId, nameRaw,
   * and resolution fields to prevent LLM from hallucinating fake exercise IDs.
   * These fields are populated by the exercise resolution service post-generation.
   *
   * The structured agent includes:
   * 1. A validation sub-agent that checks completeness by comparing against the generate agent's output
   * 2. Built-in validation with retry logic - if validation fails, retries with error feedback
   *
   * @param user - User for exercise context injection (required)
   */
  public async getStructuredAgent(
    user: UserWithProfile
  ): Promise<ConfigurableAgent<{ response: WorkoutStructure; validation: WorkoutValidationOutput }>> {
    // Fetch config at service layer
    const { systemPrompt, userPrompt: dbUserPrompt, modelConfig } = await resolveAgentConfig(
      PROMPT_IDS.WORKOUT_STRUCTURED,
      this.agentServices,
      { overrides: { model: 'gpt-5-nano', maxTokens: 32000 } }
    );

    const exerciseContext = await this.contextService.getContext(
      user,
      [ContextType.AVAILABLE_EXERCISES],
      {}
    );

    console.log('[WorkoutAgentService] Exercise context for structured agent:',
      exerciseContext.length > 0 ? `${exerciseContext.length} items` : 'No exercises');

    const validationAgent = await this.getValidationAgent();

    // Build logging context for tracking validation failures
    const loggingContext = this.buildLoggingContext(user.id, 'workout:structured', 'gpt-5-nano');

    // Use LLM-safe schema that omits id, exerciseId, nameRaw, and resolution
    // These fields are populated by exercise resolution service after generation
    // Validation sub-agent receives both structured output and generate output for comparison
    // Validation + retry is now on the agent itself, with error feedback in message history
    return createAgent({
      name: PROMPT_IDS.WORKOUT_STRUCTURED,
      systemPrompt,
      dbUserPrompt,
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

      // Validation on the agent itself - handles retries with error feedback internally
      validate: (result): ValidationResult => {
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

        return {
          isValid,
          errors: typedResult.validation?.errors ?? [],
          failedOutput: typedResult.response,  // The structured workout that failed
        };
      },
      maxRetries: 3,
      loggingContext,
    }, modelConfig) as Promise<ConfigurableAgent<{ response: WorkoutStructure; validation: WorkoutValidationOutput }>>;
  }

  /**
   * Build logging context for agent validation tracking
   * Creates callbacks that log to the event_logs table
   */
  private buildLoggingContext(
    userId: string,
    entityId: string,
    model: string
  ): AgentLoggingContext | undefined {
    if (!this.eventLogRepo) {
      return undefined;
    }

    const chainId = crypto.randomUUID();
    const repo = this.eventLogRepo;

    return {
      userId,
      chainId,
      entityId,
      model,
      onValidationFailure: (entry) => {
        // Fire-and-forget - don't await
        repo.log({
          eventName: 'validation_failed',
          userId,
          entityId,
          chainId,
          data: {
            attempt: entry.attempt,
            errors: entry.errors,
            durationMs: entry.durationMs,
            model,
          },
        }).catch((e) => console.error('[WorkoutAgentService] Failed to log validation_failed:', e));
      },
      onChainFailure: (entry) => {
        // Fire-and-forget - don't await
        repo.log({
          eventName: 'chain_failed',
          userId,
          entityId,
          chainId,
          data: {
            attempt: entry.attempt,
            errors: entry.errors,
            durationMs: entry.durationMs,
            model,
            totalAttempts: entry.totalAttempts,
          },
        }).catch((e) => console.error('[WorkoutAgentService] Failed to log chain_failed:', e));
      },
    };
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
    // Fetch config at service layer
    const { systemPrompt, userPrompt: dbUserPrompt, modelConfig } = await resolveAgentConfig(
      PROMPT_IDS.WORKOUT_GENERATE,
      this.agentServices,
      { overrides: { model: 'gpt-5.1' } }
    );

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

    // Create main agent with explicit config
    // The structured agent has validation built-in with retry logic and error feedback
    // When structuredAgent.invoke() is called internally, it handles retries automatically
    const agent = await createAgent({
      name: PROMPT_IDS.WORKOUT_GENERATE,
      systemPrompt,
      dbUserPrompt,
      context,
      subAgents: [{
        message: messageAgent,
        structure: structuredAgent,  // Validation is now built into the agent itself
      }],
    }, modelConfig);

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
      message: normalizeWhitespace(typedResult.message),
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
    // Fetch config at service layer
    const { systemPrompt, userPrompt: dbUserPrompt, modelConfig } = await resolveAgentConfig(
      PROMPT_IDS.WORKOUT_MODIFY,
      this.agentServices,
      { overrides: { model: 'gpt-5-mini' } }
    );

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

    // Create main agent with explicit config
    const agent = await createAgent({
      name: PROMPT_IDS.WORKOUT_MODIFY,
      systemPrompt,
      dbUserPrompt,
      context,
      schema: ModifyWorkoutGenerationOutputSchema,
      subAgents: [{
        message: { agent: messageAgent, transform: extractOverview },
        structure: { agent: structuredAgent, transform: extractOverview },
      }],
    }, modelConfig);

    // Pass changeRequest directly as the message - it's the user's request, not context
    const result = await agent.invoke(changeRequest) as ModifyWorkoutOutput;
    return {
      ...result,
      message: normalizeWhitespace(result.message),
    };
  }
}

/**
 * Factory function to create a WorkoutAgentService instance
 *
 * @param contextService - ContextService for building agent context
 * @param eventLogRepo - Optional EventLogRepository for logging validation failures
 * @param agentServices - AgentServices for fetching agent configs
 * @returns A new WorkoutAgentService instance
 */
export function createWorkoutAgentService(
  contextService: ContextService,
  eventLogRepo?: EventLogRepository,
  agentServices?: AgentServices
): WorkoutAgentService {
  return new WorkoutAgentService(contextService, eventLogRepo, agentServices);
}
