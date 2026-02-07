import { createAgent, AGENTS, type ConfigurableAgent } from '@/server/agents';
import { PlanStructureSchema, type PlanStructure } from '@/server/models/fitnessPlan';
import {
  ModifyFitnessPlanOutputSchema,
  type ModifyFitnessPlanSchemaOutput,
} from '@/server/services/agents/schemas/plans';
import type { PlanMessageData } from '@/server/services/agents/types/plans';
import {
  planSummaryMessageUserPrompt,
  structuredPlanUserPrompt,
} from '@/server/services/agents/prompts/plans';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { ContextService } from '@/server/services/context/contextService';
import { ContextType } from '@/server/services/context/types';
import type { AgentDefinitionServiceInstance } from '@/server/services/domain/agents/agentDefinitionService';

/**
 * FitnessPlanAgentService - Handles all fitness plan-related AI operations
 *
 * Responsibilities:
 * - Creates and invokes agents for fitness plan generation
 * - Uses ContextService (injected) to build context from user profile
 * - Returns structured results in legacy format
 *
 * @example
 * ```typescript
 * const fitnessPlanAgentService = createFitnessPlanAgentService(contextService);
 * const result = await fitnessPlanAgentService.generateFitnessPlan(user);
 * const { description, message, structure } = result;
 * ```
 */
export class FitnessPlanAgentService {
  private contextService: ContextService;
  private agentDefinitionService: AgentDefinitionServiceInstance;

  // Lazy-initialized sub-agents (promises cached after first creation)
  private messageAgentPromise: Promise<ConfigurableAgent<{ response: string }>> | null = null;
  private structuredAgentPromise: Promise<ConfigurableAgent<{ response: PlanStructure }>> | null = null;

  constructor(contextService: ContextService, agentDefinitionService: AgentDefinitionServiceInstance) {
    this.contextService = contextService;
    this.agentDefinitionService = agentDefinitionService;
  }

  /**
   * Get the message sub-agent (lazy-initialized)
   * Definition resolved from agentDefinitionService, userPrompt transforms JSON data
   */
  public async getMessageAgent(): Promise<ConfigurableAgent<{ response: string }>> {
    if (!this.messageAgentPromise) {
      this.messageAgentPromise = (async () => {
        const definition = await this.agentDefinitionService.getDefinition(AGENTS.PLAN_MESSAGE, {
          userPrompt: (input: string) => {
            const data = JSON.parse(input) as PlanMessageData;
            return planSummaryMessageUserPrompt(data);
          },
        });
        return createAgent(definition);
      })();
    }
    return this.messageAgentPromise;
  }

  /**
   * Get the structured sub-agent (lazy-initialized)
   * Definition resolved from agentDefinitionService, userPrompt transforms JSON data
   */
  public async getStructuredAgent(): Promise<ConfigurableAgent<{ response: PlanStructure }>> {
    if (!this.structuredAgentPromise) {
      this.structuredAgentPromise = (async () => {
        const definition = await this.agentDefinitionService.getDefinition(AGENTS.PLAN_STRUCTURED, {
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
        });
        return createAgent(definition);
      })();
    }
    return this.structuredAgentPromise;
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
    // Build context using ContextService
    // PROGRAM_VERSION first (guides generation), then user context
    const context = await this.contextService.getContext(
      user,
      [ContextType.PROGRAM_VERSION, ContextType.USER, ContextType.USER_PROFILE]
    );

    // Get sub-agents (lazy-initialized)
    const [messageAgent, structuredAgent] = await Promise.all([
      this.getMessageAgent(),
      this.getStructuredAgent(),
    ]);

    // Transform to inject user info into the JSON for message agent
    const injectUserForMessage = (mainResult: unknown): string => {
      try {
        const overview = mainResult as string;
        return JSON.stringify({
          userName: user.name,
          userProfile: user.profile || '',
          overview,
        } as PlanMessageData);
      } catch {
        return JSON.stringify({
          userName: user.name,
          userProfile: user.profile || '',
          overview: mainResult,
        } as PlanMessageData);
      }
    };

    // Create main agent with resolved definition
    const definition = await this.agentDefinitionService.getDefinition(AGENTS.PLAN_GENERATE, {
      subAgents: [{
        message: { agent: messageAgent, transform: injectUserForMessage },
        structure: structuredAgent,
      }],
    });

    const agent = createAgent(definition);

    // Empty input - DB user prompt provides the instructions. Context passed at invoke time.
    const result = await agent.invoke({ message: '', context }) as {
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
    // Build context using ContextService
    // PROGRAM_VERSION first (guides modification), then user context and current plan
    const context = await this.contextService.getContext(
      user,
      [ContextType.PROGRAM_VERSION, ContextType.USER, ContextType.USER_PROFILE, ContextType.FITNESS_PLAN],
      { planText: currentPlan.description || '' }
    );

    // Get structured sub-agent (lazy-initialized)
    const structuredAgent = await this.getStructuredAgent();

    // Get resolved definition and create agent
    const definition = await this.agentDefinitionService.getDefinition(AGENTS.PLAN_MODIFY, {
      schema: ModifyFitnessPlanOutputSchema,
      subAgents: [{
        structure: structuredAgent,  // No message needed for modify
      }],
    });

    const agent = createAgent(definition);

    // Pass changeRequest as message and context at invoke time
    const result = await agent.invoke({ message: changeRequest, context }) as {
      response: ModifyFitnessPlanSchemaOutput;
      structure?: PlanStructure;
      messages?: string[];
    };

    console.log(`[plan-modify] Modified fitness plan, wasModified: ${result.response.wasModified}`);

    // Map to legacy format expected by PlanModificationService
    return {
      description: result.response.description,
      wasModified: result.response.wasModified,
      modifications: result.response.modifications,
      structure: result.structure!,
    };
  }
}

/**
 * Factory function to create a FitnessPlanAgentService instance
 *
 * @param contextService - ContextService for building agent context
 * @param agentDefinitionService - AgentDefinitionService for resolving agent definitions
 * @returns A new FitnessPlanAgentService instance
 */
export function createFitnessPlanAgentService(
  contextService: ContextService,
  agentDefinitionService: AgentDefinitionServiceInstance
): FitnessPlanAgentService {
  return new FitnessPlanAgentService(contextService, agentDefinitionService);
}
