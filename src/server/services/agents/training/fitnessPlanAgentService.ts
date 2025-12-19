import { createAgent } from '@/server/agents/configurable';
import { PlanStructureSchema, type PlanStructure } from '@/server/agents/training/schemas';
import {
  FITNESS_PLAN_SYSTEM_PROMPT,
  fitnessPlanUserPrompt,
  PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT,
  planSummaryMessageUserPrompt,
  type PlanMessageData,
  STRUCTURED_PLAN_SYSTEM_PROMPT,
  structuredPlanUserPrompt,
  FITNESS_PLAN_MODIFY_SYSTEM_PROMPT,
  modifyFitnessPlanUserPrompt,
  ModifyFitnessPlanOutputSchema,
} from '@/server/agents/training/plans/prompts';
import type { UserWithProfile } from '@/server/models/userModel';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { ModifyFitnessPlanOutput } from '@/server/agents/training/plans/types';

/**
 * FitnessPlanAgentService - Handles all fitness plan-related AI operations
 *
 * Responsibilities:
 * - Creates and invokes agents for fitness plan generation
 * - Returns structured results in legacy format
 *
 * Note: Fitness plan generation uses userPrompt transformer rather than context
 * because it creates the initial plan from the user's profile directly.
 *
 * @example
 * ```typescript
 * const result = await fitnessPlanAgentService.generateFitnessPlan(user);
 * const { description, message, structure } = result;
 * ```
 */
export class FitnessPlanAgentService {
  private static instance: FitnessPlanAgentService;

  // Sub-agents as class properties (reused between generate/modify)
  private messageAgent = createAgent({
    name: 'message-plan',
    systemPrompt: PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT,
    userPrompt: (input: string) => {
      const data = JSON.parse(input) as PlanMessageData;
      return planSummaryMessageUserPrompt(data);
    },
  }, { model: 'gpt-5-nano' });

  private structuredAgent = createAgent({
    name: 'structure-plan',
    systemPrompt: STRUCTURED_PLAN_SYSTEM_PROMPT,
    userPrompt: (input: string) => {
      try {
        const parsed = JSON.parse(input);
        const planText = parsed.description || parsed.fitnessPlan || input;
        return structuredPlanUserPrompt(planText);
      } catch {
        return structuredPlanUserPrompt(input);
      }
    },
    schema: PlanStructureSchema,
  }, { model: 'gpt-5-nano', maxTokens: 32000 });

  private constructor() {}

  public static getInstance(): FitnessPlanAgentService {
    if (!FitnessPlanAgentService.instance) {
      FitnessPlanAgentService.instance = new FitnessPlanAgentService();
    }
    return FitnessPlanAgentService.instance;
  }

  /**
   * Generate a fitness plan for a user
   *
   * @param user - User with profile containing goals, preferences, etc.
   * @returns Object with description, message, and structure (matching legacy format)
   */
  async generateFitnessPlan(user: UserWithProfile): Promise<{
    description: string;
    message: string;
    structure: PlanStructure;
  }> {
    // Transform to inject user info into the JSON for message agent
    const injectUserForMessage = (mainResult: unknown): string => {
      const jsonString = typeof mainResult === 'string' ? mainResult : JSON.stringify(mainResult);
      try {
        const parsed = JSON.parse(jsonString);
        const overview = parsed.description || parsed.fitnessPlan || jsonString;
        return JSON.stringify({
          userName: user.name,
          userProfile: user.profile || '',
          overview,
        } as PlanMessageData);
      } catch {
        return JSON.stringify({
          userName: user.name,
          userProfile: user.profile || '',
          overview: jsonString,
        } as PlanMessageData);
      }
    };

    // Create main agent - no context needed, uses userPrompt transformer
    const agent = createAgent({
      name: 'plan-generate',
      systemPrompt: FITNESS_PLAN_SYSTEM_PROMPT,
      subAgents: [{
        message: { agent: this.messageAgent, transform: injectUserForMessage },
        structure: this.structuredAgent,
      }],
    }, { model: 'gpt-5.1' });

    // Build the user prompt
    const userPromptContent = fitnessPlanUserPrompt(user);

    const result = await agent.invoke(userPromptContent) as {
      response: string;
      message: string;
      structure: PlanStructure;
    };

    console.log(`[plan-generate] Generated fitness plan for user ${user.id}`);

    // Map to legacy format expected by FitnessPlanService
    return {
      description: result.response,
      message: result.message,
      structure: result.structure,
    };
  }

  /**
   * Modify an existing fitness plan based on user constraints/requests
   *
   * @param user - User with profile
   * @param currentPlan - Current fitness plan to modify
   * @param changeRequest - User's modification request
   * @returns Object with description, wasModified, modifications, structure (matching legacy format)
   */
  async modifyFitnessPlan(
    user: UserWithProfile,
    currentPlan: FitnessPlan,
    changeRequest: string
  ): Promise<{
    description: string;
    wasModified: boolean;
    modifications: string;
    structure: PlanStructure;
  }> {
    // Build the user prompt using the existing function
    const userPromptContent = modifyFitnessPlanUserPrompt({
      userProfile: user.profile || '',
      currentPlan,
      changeRequest,
    });

    const agent = createAgent({
      name: 'plan-modify',
      systemPrompt: FITNESS_PLAN_MODIFY_SYSTEM_PROMPT,
      schema: ModifyFitnessPlanOutputSchema,
      subAgents: [{
        structure: this.structuredAgent,  // No message needed for modify
      }],
    }, { model: 'gpt-5.1' });

    const result = await agent.invoke(userPromptContent) as ModifyFitnessPlanOutput;

    console.log(`[plan-modify] Modified fitness plan, wasModified: ${result.response.wasModified}`);

    // Map to legacy format expected by PlanModificationService
    return {
      description: result.response.description,
      wasModified: result.response.wasModified,
      modifications: result.response.modifications,
      structure: result.structure,
    };
  }
}

export const fitnessPlanAgentService = FitnessPlanAgentService.getInstance();
