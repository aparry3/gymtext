import { createAgent } from '@/server/agents';
import { MicrocycleStructureSchema, type MicrocycleStructure } from '@/server/models/microcycle';
import {
  MICROCYCLE_SYSTEM_PROMPT,
  MicrocycleGenerationOutputSchema,
  MICROCYCLE_MESSAGE_SYSTEM_PROMPT,
  microcycleMessageUserPrompt,
  STRUCTURED_MICROCYCLE_SYSTEM_PROMPT,
  structuredMicrocycleUserPrompt,
  MICROCYCLE_MODIFY_SYSTEM_PROMPT,
  modifyMicrocycleUserPrompt,
  ModifyMicrocycleOutputSchema,
  type MicrocycleGenerationOutput,
} from '@/server/services/agents/prompts/microcycles';
import type { MicrocycleGenerateOutput, ModifyMicrocycleOutput } from '@/server/services/agents/types/microcycles';
import type { Microcycle } from '@/server/models/microcycle';
import type { DayOfWeek } from '@/shared/utils/date';
import { ContextService, ContextType, SnippetType } from '@/server/services/context';
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
export class MicrocycleAgentService {
  private static instance: MicrocycleAgentService;

  // Sub-agents as class properties (reused between generate/modify)
  private messageAgent = createAgent({
    name: 'microcycle-message',
    systemPrompt: MICROCYCLE_MESSAGE_SYSTEM_PROMPT,
    userPrompt: (input: string) => {
      const data = JSON.parse(input) as MicrocycleGenerationOutput;
      return microcycleMessageUserPrompt(data);
    },
  }, { model: 'gpt-5-nano' });

  private structuredAgent = createAgent({
    name: 'structured-microcycle',
    systemPrompt: STRUCTURED_MICROCYCLE_SYSTEM_PROMPT,
    userPrompt: (input: string) => {
      const data = JSON.parse(input) as MicrocycleGenerationOutput & { absoluteWeek?: number };
      return structuredMicrocycleUserPrompt(
        data.overview,
        data.days,
        data.absoluteWeek ?? 1,
        data.isDeload
      );
    },
    schema: MicrocycleStructureSchema,
  }, { model: 'gpt-5-nano', maxTokens: 32000 });

  private constructor() {}

  /**
   * Lazy-load ContextService to avoid module-load-time initialization
   */
  private getContextService(): ContextService {
    return ContextService.getInstance();
  }

  public static getInstance(): MicrocycleAgentService {
    if (!MicrocycleAgentService.instance) {
      MicrocycleAgentService.instance = new MicrocycleAgentService();
    }
    return MicrocycleAgentService.instance;
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
   * Generate a weekly microcycle training pattern
   *
   * Includes retry logic (MAX_RETRIES = 3) with validation to ensure all 7 days are generated.
   *
   * @param user - User with profile
   * @param planText - Full fitness plan description
   * @param absoluteWeek - Week number from plan start (1-indexed)
   * @param isDeload - Whether this should be a deload week
   * @returns Object with days, description, isDeload, message, and structure (matching legacy format)
   */
  async generateMicrocycle(
    user: UserWithProfile,
    planText: string,
    absoluteWeek: number,
    isDeload: boolean
  ): Promise<{
    days: string[];
    description: string;
    isDeload: boolean;
    message: string;
    structure?: MicrocycleStructure;
  }> {
    // Build context using ContextService
    const context = await this.getContextService().getContext(
      user,
      [
        ContextType.FITNESS_PLAN,
        ContextType.USER_PROFILE,
        ContextType.EXPERIENCE_LEVEL,
        ContextType.TRAINING_META,
      ],
      {
        planText,
        absoluteWeek,
        isDeload,
        snippetType: SnippetType.MICROCYCLE,
      }
    );

    // Transform to inject absoluteWeek into the JSON for structured agent
    const injectWeekNumber = (mainResult: unknown): string => {
      const jsonString = typeof mainResult === 'string' ? mainResult : JSON.stringify(mainResult);
      try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify({ ...parsed, absoluteWeek });
      } catch {
        return jsonString;
      }
    };

    // Create main agent with context (using class property sub-agents)
    const agent = createAgent({
      name: 'microcycle-generate',
      systemPrompt: MICROCYCLE_SYSTEM_PROMPT,
      context,
      schema: MicrocycleGenerationOutputSchema,
      subAgents: [{
        message: this.messageAgent,
        structure: { agent: this.structuredAgent, transform: injectWeekNumber },
      }],
    }, { model: 'gpt-5.1' });

    // Execute with retry logic
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[microcycle-generate] Retry attempt ${attempt}/${MAX_RETRIES} for week ${absoluteWeek}`);
        }

        const result = await agent.invoke(
          `Generate the Weekly Training Pattern for **Week ${absoluteWeek}**.`
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
   * @param changeRequest - User's modification request
   * @param currentDayOfWeek - Current day of the week
   * @param weekNumber - Week number (absolute)
   * @returns Object with days, description, isDeload, message, structure, wasModified, modifications (matching legacy format)
   */
  async modifyMicrocycle(
    user: UserWithProfile,
    currentMicrocycle: Microcycle,
    changeRequest: string,
    currentDayOfWeek: DayOfWeek,
    weekNumber: number
  ): Promise<{
    days: string[];
    description: string;
    isDeload: boolean;
    message: string;
    structure?: MicrocycleStructure;
    wasModified: boolean;
    modifications: string;
  }> {
    // Transform to inject weekNumber as absoluteWeek into the JSON for structured agent
    const injectWeekNumber = (mainResult: unknown): string => {
      const jsonString = typeof mainResult === 'string' ? mainResult : JSON.stringify(mainResult);
      try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify({ ...parsed, absoluteWeek: weekNumber });
      } catch {
        return jsonString;
      }
    };

    // Build the user prompt using the existing function
    const userPromptContent = modifyMicrocycleUserPrompt({
      fitnessProfile: user.profile || '',
      currentMicrocycle,
      changeRequest,
      currentDayOfWeek,
    });

    const agent = createAgent({
      name: 'microcycle-modify',
      systemPrompt: MICROCYCLE_MODIFY_SYSTEM_PROMPT,
      schema: ModifyMicrocycleOutputSchema,
      subAgents: [{
        message: this.messageAgent,
        structure: { agent: this.structuredAgent, transform: injectWeekNumber },
      }],
    }, { model: 'gpt-5.1' });

    // Execute with retry logic
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[microcycle-modify] Retry attempt ${attempt}/${MAX_RETRIES} for week ${weekNumber}`);
        }

        const result = await agent.invoke(userPromptContent) as ModifyMicrocycleOutput;

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

        console.log(`[microcycle-modify] Successfully modified day overviews and message for week ${weekNumber}${attempt > 1 ? ` (after ${attempt} attempts)` : ''}`);

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
        console.error(`[microcycle-modify] Attempt ${attempt}/${MAX_RETRIES} failed for week ${weekNumber}:`, lastError.message);

        // If this was the last attempt, break out
        if (attempt === MAX_RETRIES) {
          break;
        }
      }
    }

    // All retries exhausted
    throw new Error(
      `Failed to modify microcycle pattern for week ${weekNumber} after ${MAX_RETRIES} attempts. ` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  }
}

export const microcycleAgentService = MicrocycleAgentService.getInstance();
