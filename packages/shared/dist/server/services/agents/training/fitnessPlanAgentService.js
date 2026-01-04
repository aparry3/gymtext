import { createAgent, PROMPT_IDS } from '@/server/agents';
import { PlanStructureSchema } from '@/server/models/fitnessPlan';
import { planSummaryMessageUserPrompt, structuredPlanUserPrompt, ModifyFitnessPlanOutputSchema, } from '@/server/services/agents/prompts/plans';
import { ContextService } from '@/server/services/context/contextService';
import { ContextType } from '@/server/services/context/types';
/**
 * FitnessPlanAgentService - Handles all fitness plan-related AI operations
 *
 * Responsibilities:
 * - Creates and invokes agents for fitness plan generation
 * - Uses ContextService to build context from user profile
 * - Returns structured results in legacy format
 *
 * @example
 * ```typescript
 * const result = await fitnessPlanAgentService.generateFitnessPlan(user);
 * const { description, message, structure } = result;
 * ```
 */
export class FitnessPlanAgentService {
    static instance;
    // Lazy-initialized sub-agents (promises cached after first creation)
    messageAgentPromise = null;
    structuredAgentPromise = null;
    getContextService() {
        return ContextService.getInstance();
    }
    constructor() { }
    static getInstance() {
        if (!FitnessPlanAgentService.instance) {
            FitnessPlanAgentService.instance = new FitnessPlanAgentService();
        }
        return FitnessPlanAgentService.instance;
    }
    /**
     * Get the message sub-agent (lazy-initialized)
     * System prompt fetched from DB, userPrompt transforms JSON data
     */
    async getMessageAgent() {
        if (!this.messageAgentPromise) {
            this.messageAgentPromise = createAgent({
                name: PROMPT_IDS.PLAN_MESSAGE,
                userPrompt: (input) => {
                    const data = JSON.parse(input);
                    return planSummaryMessageUserPrompt(data);
                },
            }, { model: 'gpt-5-nano' });
        }
        return this.messageAgentPromise;
    }
    /**
     * Get the structured sub-agent (lazy-initialized)
     * System prompt fetched from DB, userPrompt transforms JSON data
     */
    async getStructuredAgent() {
        if (!this.structuredAgentPromise) {
            this.structuredAgentPromise = createAgent({
                name: PROMPT_IDS.PLAN_STRUCTURED,
                userPrompt: (input) => {
                    try {
                        const parsed = JSON.parse(input);
                        const planText = parsed.description || parsed.fitnessPlan || input;
                        return structuredPlanUserPrompt(planText);
                    }
                    catch {
                        return structuredPlanUserPrompt(input);
                    }
                },
                schema: PlanStructureSchema,
            }, { model: 'gpt-5-nano', maxTokens: 32000 });
        }
        return this.structuredAgentPromise;
    }
    /**
     * Generate a fitness plan for a user
     *
     * @param user - User with profile containing goals, preferences, etc.
     * @returns Object with description, message, and structure (matching legacy format)
     */
    async generateFitnessPlan(user) {
        // Build context using ContextService
        const context = await this.getContextService().getContext(user, [ContextType.USER, ContextType.USER_PROFILE]);
        // Get sub-agents (lazy-initialized)
        const [messageAgent, structuredAgent] = await Promise.all([
            this.getMessageAgent(),
            this.getStructuredAgent(),
        ]);
        // Transform to inject user info into the JSON for message agent
        const injectUserForMessage = (mainResult) => {
            try {
                const overview = mainResult;
                return JSON.stringify({
                    userName: user.name,
                    userProfile: user.profile || '',
                    overview,
                });
            }
            catch {
                return JSON.stringify({
                    userName: user.name,
                    userProfile: user.profile || '',
                    overview: mainResult,
                });
            }
        };
        // Create main agent with context (prompts fetched from DB)
        const agent = await createAgent({
            name: PROMPT_IDS.PLAN_GENERATE,
            context,
            subAgents: [{
                    message: { agent: messageAgent, transform: injectUserForMessage },
                    structure: structuredAgent,
                }],
        }, { model: 'gpt-5.1' });
        // Empty input - DB user prompt provides the instructions
        const result = await agent.invoke('');
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
    async modifyFitnessPlan(user, currentPlan, changeRequest) {
        // Build context using ContextService
        const context = await this.getContextService().getContext(user, [ContextType.USER, ContextType.USER_PROFILE, ContextType.FITNESS_PLAN], { planText: currentPlan.description || '' });
        // Get structured sub-agent (lazy-initialized)
        const structuredAgent = await this.getStructuredAgent();
        // Prompts fetched from DB based on agent name
        const agent = await createAgent({
            name: PROMPT_IDS.PLAN_MODIFY,
            context,
            schema: ModifyFitnessPlanOutputSchema,
            subAgents: [{
                    structure: structuredAgent, // No message needed for modify
                }],
        }, { model: 'gpt-5.1' });
        // Pass changeRequest directly as the message - it's the user's request, not context
        const result = await agent.invoke(changeRequest);
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
