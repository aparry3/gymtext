import { createAgent, PROMPT_IDS, type ConfigurableAgent } from '@/server/agents';
import { MicrocycleStructureSchema, type MicrocycleStructure } from '@/server/models/microcycle';
import {
  MicrocycleGenerationOutputSchema,
  ModifyMicrocycleOutputSchema,
  type MicrocycleGenerationOutput,
} from '@/server/services/agents/schemas/microcycles';
import {
  microcycleMessageUserPrompt,
  structuredMicrocycleUserPrompt,
} from '@/server/services/agents/prompts/microcycles';
import type { MicrocycleGenerateOutput, ModifyMicrocycleOutput } from '@/server/services/agents/types/microcycles';
import type { Microcycle } from '@/server/models/microcycle';
import type { ContextService } from '@/server/services/context';
import { ContextType, SnippetType } from '@/server/services/context';
import { DAY_NAMES } from '@/shared/utils/date';
import type { UserWithProfile } from '@/server/models/user';

const MAX_RETRIES = 3;

/**
 * Validates that all 7 day strings are non-empty
 */
const validateDays = (days: string[]): boolean => {
  return days.length === 7 && days.every(day => day && day.trim().length > 0);
};

/**
 * MicrocycleAgentService - Handles all microcycle-related AI operations
 *
 * Responsibilities:
 * - Fetches context via ContextService (injected)
 * - Creates and invokes agents for microcycle generation
 * - Includes retry logic for validation
 * - Returns structured results
 *
 * @example
 * ```typescript
 * const microcycleAgentService = createMicrocycleAgentService(contextService);
 * const result = await microcycleAgentService.generateMicrocycle(user, absoluteWeek);
 * const { days, description, isDeload, message, structure } = result;
 * ```
 */
export class MicrocycleAgentService {
  private contextService: ContextService;

  // Lazy-initialized sub-agents (promises cached after first creation)
  private messageAgentPromise: Promise<ConfigurableAgent<{ response: string }>> | null = null;
  private structuredAgentPromise: Promise<ConfigurableAgent<{ response: MicrocycleStructure }>> | null = null;

  constructor(contextService: ContextService) {
    this.contextService = contextService;
  }

  /**
   * Get the message sub-agent (lazy-initialized)
   * System prompt and user prompt fetched from DB
   * Transform in sub-agent config provides the formatted microcycle data
   */
  public async getMessageAgent(): Promise<ConfigurableAgent<{ response: string }>> {
    if (!this.messageAgentPromise) {
      this.messageAgentPromise = createAgent({
        name: PROMPT_IDS.MICROCYCLE_MESSAGE,
        // No userPrompt - DB user prompt provides static instructions
        // Transform in sub-agent config provides formatted microcycle data
      }, { model: 'gpt-5-nano' });
    }
    return this.messageAgentPromise;
  }

  /**
   * Get the structured sub-agent (lazy-initialized)
   * System prompt and user prompt fetched from DB
   * Transform in sub-agent config provides the formatted microcycle data
   */
  public async getStructuredAgent(): Promise<ConfigurableAgent<{ response: MicrocycleStructure }>> {
    if (!this.structuredAgentPromise) {
      this.structuredAgentPromise = createAgent({
        name: PROMPT_IDS.MICROCYCLE_STRUCTURED,
        // No userPrompt - DB user prompt provides static instructions
        // Transform in sub-agent config provides formatted microcycle data
        schema: MicrocycleStructureSchema,
      }, { model: 'gpt-5-nano', maxTokens: 32000 });
    }
    return this.structuredAgentPromise;
  }

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
  async generateMicrocycle(
    user: UserWithProfile,
    absoluteWeek: number
  ): Promise<{
    days: string[];
    description: string;
    isDeload: boolean;
    message: string;
    structure?: MicrocycleStructure;
  }> {
    // Build context using ContextService
    // FITNESS_PLAN is auto-fetched by context service
    // isDeload is determined by agent from plan's Progression Strategy
    const context = await this.contextService.getContext(
      user,
      [
        ContextType.FITNESS_PLAN,
        ContextType.USER_PROFILE,
        ContextType.EXPERIENCE_LEVEL,
        ContextType.TRAINING_META,
      ],
      {
        absoluteWeek,
        snippetType: SnippetType.MICROCYCLE,
      }
    );

    // Get sub-agents (lazy-initialized)
    const [messageAgent, structuredAgent] = await Promise.all([
      this.getMessageAgent(),
      this.getStructuredAgent(),
    ]);

    // Create main agent with context (prompts fetched from DB)
    // Sub-agents use transform to format main agent output → sub-agent input
    const agent = await createAgent({
      name: PROMPT_IDS.MICROCYCLE_GENERATE,
      context,
      schema: MicrocycleGenerationOutputSchema,
      subAgents: [{
        message: {
          agent: messageAgent,
          transform: (mainResult) => microcycleMessageUserPrompt(mainResult as MicrocycleGenerationOutput),
        },
        structure: {
          agent: structuredAgent,
          transform: (mainResult) => {
            const data = mainResult as MicrocycleGenerationOutput;
            return structuredMicrocycleUserPrompt(data.overview, data.days, absoluteWeek, data.isDeload);
          },
        },
      }],
    }, { model: 'gpt-5.1' });

    // Execute with retry logic
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[microcycle-generate] Retry attempt ${attempt}/${MAX_RETRIES} for week ${absoluteWeek}`);
        }

        // Pass just the dynamic data - DB user prompt provides instructions
        const result = await agent.invoke(
          `Absolute Week: ${absoluteWeek}`
        ) as MicrocycleGenerateOutput;

        // Validate that all 7 days are present and non-empty
        if (!validateDays(result.response.days)) {
          const emptyDayIndices = result.response.days
            .map((day, index) => (!day || day.trim().length === 0) ? index : -1)
            .filter(index => index !== -1);

          const missingDays = emptyDayIndices.map(index => DAY_NAMES[index]);

          throw new Error(
            `Microcycle generate validation failed: Missing or empty days for ${missingDays.join(', ')}. ` +
            `Expected all 7 days to be present and non-empty.`
          );
        }

        console.log(`[microcycle-generate] Successfully generated day overviews and message for week ${absoluteWeek}${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);

        // Map to legacy format expected by MicrocycleService
        return {
          days: result.response.days,
          description: result.response.overview,
          isDeload: result.response.isDeload,
          message: result.message,
          structure: result.structure,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[microcycle-generate] Attempt ${attempt}/${MAX_RETRIES} failed for week ${absoluteWeek}:`, lastError.message);

        // If this was the last attempt, break out
        if (attempt === MAX_RETRIES) {
          break;
        }
      }
    }

    // All retries exhausted
    throw new Error(
      `Failed to generate microcycle pattern for week ${absoluteWeek} after ${MAX_RETRIES} attempts. ` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

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
  async modifyMicrocycle(
    user: UserWithProfile,
    currentMicrocycle: Microcycle,
    changeRequest: string
  ): Promise<{
    days: string[];
    description: string;
    isDeload: boolean;
    message: string;
    structure?: MicrocycleStructure;
    wasModified: boolean;
    modifications: string;
  }> {
    // Get absoluteWeek from the current microcycle
    const absoluteWeek = currentMicrocycle.absoluteWeek;

    // Build context using ContextService
    const context = await this.contextService.getContext(
      user,
      [
        ContextType.USER,
        ContextType.USER_PROFILE,
        ContextType.CURRENT_MICROCYCLE,
        ContextType.DATE_CONTEXT,
      ],
      { microcycle: currentMicrocycle }
    );

    // Get sub-agents (lazy-initialized)
    const [messageAgent, structuredAgent] = await Promise.all([
      this.getMessageAgent(),
      this.getStructuredAgent(),
    ]);

    // Prompts fetched from DB based on agent name
    // Sub-agents use transform to format main agent output → sub-agent input
    const agent = await createAgent({
      name: PROMPT_IDS.MICROCYCLE_MODIFY,
      context,
      schema: ModifyMicrocycleOutputSchema,
      subAgents: [{
        message: {
          agent: messageAgent,
          transform: (mainResult) => {
            // ModifyMicrocycleOutput has same structure as MicrocycleGenerationOutput
            const data = mainResult as MicrocycleGenerationOutput;
            return microcycleMessageUserPrompt(data);
          },
        },
        structure: {
          agent: structuredAgent,
          transform: (mainResult) => {
            const data = mainResult as MicrocycleGenerationOutput;
            return structuredMicrocycleUserPrompt(data.overview, data.days, absoluteWeek, data.isDeload);
          },
        },
      }],
    }, { model: 'gpt-5.1' });

    // Execute with retry logic
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[microcycle-modify] Retry attempt ${attempt}/${MAX_RETRIES} for week ${absoluteWeek}`);
        }

        // Pass changeRequest directly as the message - it's the user's request, not context
        const result = await agent.invoke(changeRequest) as ModifyMicrocycleOutput;

        // Validate that all 7 days are present and non-empty
        if (!validateDays(result.response.days)) {
          const emptyDayIndices = result.response.days
            .map((day, index) => (!day || day.trim().length === 0) ? index : -1)
            .filter(index => index !== -1);

          const missingDays = emptyDayIndices.map(index => DAY_NAMES[index]);

          throw new Error(
            `Microcycle modify validation failed: Missing or empty days for ${missingDays.join(', ')}. ` +
            `Expected all 7 days to be present and non-empty.`
          );
        }

        console.log(`[microcycle-modify] Successfully modified day overviews and message for week ${absoluteWeek}${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);

        // Map to legacy format expected by WorkoutModificationService
        return {
          days: result.response.days,
          description: result.response.overview,
          isDeload: result.response.isDeload,
          message: result.message,
          structure: result.structure,
          wasModified: result.response.wasModified,
          modifications: result.response.modifications,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[microcycle-modify] Attempt ${attempt}/${MAX_RETRIES} failed for week ${absoluteWeek}:`, lastError.message);

        // If this was the last attempt, break out
        if (attempt === MAX_RETRIES) {
          break;
        }
      }
    }

    // All retries exhausted
    throw new Error(
      `Failed to modify microcycle pattern for week ${absoluteWeek} after ${MAX_RETRIES} attempts. ` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  }
}

/**
 * Factory function to create a MicrocycleAgentService instance
 *
 * @param contextService - ContextService for building agent context
 * @returns A new MicrocycleAgentService instance
 */
export function createMicrocycleAgentService(contextService: ContextService): MicrocycleAgentService {
  return new MicrocycleAgentService(contextService);
}
