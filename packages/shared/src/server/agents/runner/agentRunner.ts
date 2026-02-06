import { createAgent } from '../createAgent';
import type { AgentDefinitionServiceInstance } from '@/server/services/domain/agents/agentDefinitionService';
import type { ContextService } from '@/server/services/context/contextService';
import { ContextType } from '@/server/services/context/types';
import type { ToolRegistry } from '../tools/toolRegistry';
import type { HookRegistry } from '../hooks/hookRegistry';
import type { ToolExecutionContext, ToolServiceContainer } from '../tools/types';
import { resolveInputMapping } from '../declarative/inputMapping';
import { evaluateRules } from '../declarative/validation';
import { resolveTemplate } from '../declarative/templateEngine';
import type { MappingContext, ValidationRule } from '../declarative/types';
import type {
  AgentInvokeParams,
  SubAgentDbConfig,
  ExtendedAgentConfig,
} from './types';
import type {
  SubAgentBatch,
  SubAgentConfig,
  AgentComposedOutput,
  ModelId,
  ValidationResult,
} from '../types';
import { normalizeHookConfig } from '../hooks/resolver';
import { today } from '@/shared/utils/date';

const MAX_DEPTH = 5;

/**
 * Dependencies for AgentRunner
 */
export interface AgentRunnerDeps {
  agentDefinitionService: AgentDefinitionServiceInstance;
  contextService: ContextService;
  toolRegistry: ToolRegistry;
  hookRegistry: HookRegistry;
  /** Lazy getter for service container (avoids circular dep) */
  getServices: () => ToolServiceContainer;
}

/**
 * Public interface for the AgentRunner
 */
export interface AgentRunnerInstance {
  invoke(agentId: string, params: AgentInvokeParams): Promise<AgentComposedOutput<unknown, undefined>>;
}

/**
 * AgentRunner - orchestrates agent execution from DB config
 *
 * Replaces the pattern of manually creating agents in service code.
 * Instead, agent definitions (including tools, context, sub-agents, validation)
 * are all stored in the database and resolved at runtime.
 *
 * Flow:
 * 1. Fetch DB config (base + extended columns)
 * 2. Resolve context via contextService
 * 3. Resolve tools via toolRegistry (with hook wrapping)
 * 4. Build sub-agent batches from sub_agents JSONB (recursive)
 * 5. Build validate function from validation_rules
 * 6. Construct AgentDefinition, call createAgent().invoke()
 * 7. Fire post-hooks if configured
 */
export function createAgentRunner(deps: AgentRunnerDeps): AgentRunnerInstance {
  const {
    agentDefinitionService,
    contextService,
    toolRegistry,
    hookRegistry,
    getServices,
  } = deps;

  /**
   * Get extended config from the service (reads from same cache)
   */
  async function getExtendedConfig(agentId: string): Promise<ExtendedAgentConfig> {
    return agentDefinitionService.getExtendedConfig(agentId);
  }

  /**
   * Build sub-agent batches from DB config
   */
  async function buildSubAgents(
    subAgentConfigs: SubAgentDbConfig[],
    params: AgentInvokeParams,
    depth: number
  ): Promise<SubAgentBatch[]> {
    if (depth >= MAX_DEPTH) {
      console.warn(`[AgentRunner] Max sub-agent depth (${MAX_DEPTH}) reached`);
      return [];
    }

    // Group by batch number
    const batchMap = new Map<number, SubAgentDbConfig[]>();
    for (const config of subAgentConfigs) {
      const batch = batchMap.get(config.batch) || [];
      batch.push(config);
      batchMap.set(config.batch, batch);
    }

    // Sort batches by number
    const sortedBatches = [...batchMap.entries()].sort(([a], [b]) => a - b);

    const batches: SubAgentBatch[] = [];

    for (const [, configs] of sortedBatches) {
      const batch: SubAgentBatch = {};

      for (const config of configs) {
        // Recursively resolve the sub-agent (it may have its own sub-agents)
        const subAgentDef = await agentDefinitionService.getDefinition(config.agentId);

        // Get extended config for the sub-agent
        const subExtended = await getExtendedConfig(config.agentId);

        // Resolve context for the sub-agent
        let subContext: string[] = [];
        if (subExtended.contextTypes && subExtended.contextTypes.length > 0) {
          const contextTypes = subExtended.contextTypes.map(
            t => t as ContextType
          );
          subContext = await contextService.getContext(
            params.user,
            contextTypes,
            params.extras
          );
        }

        // Recursively build sub-agent's own sub-agents
        let subSubAgents: SubAgentBatch[] | undefined;
        if (subExtended.subAgents && subExtended.subAgents.length > 0) {
          subSubAgents = await buildSubAgents(
            subExtended.subAgents,
            params,
            depth + 1
          );
        }

        // Build validate function from sub-agent's validation rules
        let validate: ((result: unknown) => ValidationResult) | undefined;
        if (subExtended.validationRules && subExtended.validationRules.length > 0) {
          const rules = subExtended.validationRules;
          validate = (result: unknown) => evaluateRules(rules, result);
        }

        // Create the sub-agent
        const subAgent = createAgent({
          ...subAgentDef,
          context: subContext,
          schema: subExtended.schemaJson
            ? (subExtended.schemaJson as unknown as undefined)
            : subAgentDef.schema,
          subAgents: subSubAgents && subSubAgents.length > 0
            ? subSubAgents
            : subAgentDef.subAgents,
          validate: validate ?? subAgentDef.validate,
        });

        // Build the SubAgentConfig with transform and condition
        const subAgentConfig: SubAgentConfig = {
          agent: subAgent,
        };

        // Build transform from inputMapping + userPromptTemplate
        if (config.inputMapping) {
          const mapping = config.inputMapping;
          const template = subExtended.userPromptTemplate;

          subAgentConfig.transform = (mainResult: unknown, parentInput?: string) => {
            const ctx: MappingContext = {
              result: mainResult,
              user: params.user,
              extras: (params.extras as Record<string, unknown>) || {},
              parentInput: parentInput || '',
              now: today(params.user.timezone).toISOString(),
            };
            const mapped = resolveInputMapping(mapping, ctx);

            if (template) {
              return resolveTemplate(template, mapped);
            }
            return JSON.stringify(mapped);
          };
        }

        // Build condition from validation rules
        if (config.condition && config.condition.length > 0) {
          const conditionRules = config.condition;
          subAgentConfig.condition = (mainResult: unknown) => {
            return evaluateRules(conditionRules, mainResult).isValid;
          };
        }

        batch[config.key] = subAgentConfig;
      }

      batches.push(batch);
    }

    return batches;
  }

  return {
    async invoke(
      agentId: string,
      params: AgentInvokeParams
    ): Promise<AgentComposedOutput<unknown, undefined>> {
      console.log(`[AgentRunner] Invoking ${agentId}`);

      // 1. Fetch base DB config
      const definition = await agentDefinitionService.getDefinition(agentId);

      // 2. Fetch extended config
      const extended = await getExtendedConfig(agentId);

      // 3. Resolve context
      let context: string[] = [];
      if (extended.contextTypes && extended.contextTypes.length > 0) {
        const contextTypes = extended.contextTypes.map(
          t => t as ContextType
        );
        context = await contextService.getContext(
          params.user,
          contextTypes,
          params.extras
        );
      }

      // 4. Resolve tools
      let tools = definition.tools;
      if (extended.toolIds && extended.toolIds.length > 0) {
        const toolCtx: ToolExecutionContext = {
          user: params.user,
          message: params.message || '',
          previousMessages: params.previousMessages,
          services: getServices(),
          extras: params.extras as Record<string, unknown>,
        };
        tools = toolRegistry.resolve(
          extended.toolIds,
          toolCtx,
          hookRegistry,
          extended.toolHooks ?? undefined
        );
      }

      // 5. Build sub-agent batches
      let subAgents = definition.subAgents;
      if (extended.subAgents && extended.subAgents.length > 0) {
        subAgents = await buildSubAgents(extended.subAgents, params, 0);
      }

      // 6. Build validate from validation rules
      let validate = definition.validate;
      if (extended.validationRules && extended.validationRules.length > 0) {
        const rules = extended.validationRules;
        validate = (result: unknown) => evaluateRules(rules, result);
      }

      // 7. Build the complete agent definition
      const agent = createAgent({
        ...definition,
        model: definition.model as ModelId,
        context,
        tools,
        schema: extended.schemaJson
          ? (extended.schemaJson as unknown as undefined)
          : definition.schema,
        subAgents: subAgents && subAgents.length > 0
          ? subAgents
          : undefined,
        validate,
      });

      // 8. Invoke the agent
      const result = await agent.invoke({
        message: params.message,
        previousMessages: params.previousMessages,
      });

      // 9. Fire agent-level post-hooks
      if (extended.hooks?.postHook) {
        const config = normalizeHookConfig(extended.hooks.postHook);
        const hookFn = hookRegistry.get(config.hook);
        if (hookFn) {
          try {
            await hookFn(params.user, result);
          } catch (err) {
            console.error(`[AgentRunner] Agent post-hook ${config.hook} failed:`, err);
          }
        }
      }

      return result as AgentComposedOutput<unknown, undefined>;
    },
  };
}
