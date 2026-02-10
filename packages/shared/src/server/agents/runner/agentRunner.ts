import { createAgent } from '../createAgent';
import type { NewAgentLog } from '@/server/models/agentLog';
import type { JsonValue } from '@/server/models/_types';
import type { UserWithProfile } from '@/server/models/user';
import type { AgentDefinitionServiceInstance } from '@/server/services/domain/agents/agentDefinitionService';
import type { ContextRegistry } from '../context/contextRegistry';
import type { ToolRegistry } from '../tools/toolRegistry';
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
  AgentExample,
} from '../types';
import { today } from '@/shared/utils/date';

const MAX_DEPTH = 5;

/**
 * Dependencies for AgentRunner
 */
export interface AgentRunnerDeps {
  agentDefinitionService: AgentDefinitionServiceInstance;
  contextRegistry: ContextRegistry;
  toolRegistry: ToolRegistry;
  /** Lazy getter for service container (avoids circular dep) */
  getServices: () => ToolServiceContainer;
  /** Optional repository for DB logging of agent invocations */
  agentLogRepository?: { log: (entry: NewAgentLog) => Promise<void> };
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
 * 2. Resolve context via contextRegistry
 * 3. Resolve tools via toolRegistry
 * 4. Build sub-agent batches from sub_agents JSONB (recursive)
 * 5. Build validate function from validation_rules
 * 6. Construct AgentDefinition, call createAgent().invoke()
 */
export function createAgentRunner(deps: AgentRunnerDeps): AgentRunnerInstance {
  const {
    agentDefinitionService,
    contextRegistry,
    toolRegistry,
    getServices,
    agentLogRepository,
  } = deps;

  /**
   * Build the onLog callback for DB logging
   */
  const buildOnLog = agentLogRepository
    ? (entry: { agentId: string; model?: string; input: string; messages: unknown; response: unknown; durationMs: number; metadata?: Record<string, unknown> }) => {
        agentLogRepository.log({
          agentId: entry.agentId,
          model: entry.model ?? null,
          messages: entry.messages as JsonValue,
          input: entry.input,
          response: entry.response as JsonValue,
          durationMs: entry.durationMs,
          metadata: (entry.metadata ?? {}) as JsonValue,
        });
      }
    : undefined;

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
          subContext = await contextRegistry.resolve(
            subExtended.contextTypes,
            params.params || {}
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

        // Resolve examples from extended config
        const subExamples: AgentExample[] | undefined = subExtended.examples
          ? subExtended.examples as AgentExample[]
          : undefined;

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
          onLog: buildOnLog,
          examples: subExamples,
        });

        // Build the SubAgentConfig with transform and condition
        const subAgentConfig: SubAgentConfig = {
          agent: subAgent,
        };

        // Build transform from inputMapping + userPromptTemplate
        if (config.inputMapping) {
          const mapping = config.inputMapping;
          const template = subExtended.userPromptTemplate;
          const user = params.params?.user as UserWithProfile | undefined;

          subAgentConfig.transform = (mainResult: unknown, parentInput?: string) => {
            const ctx: MappingContext = {
              result: mainResult,
              user: user!,
              extras: (params.params as Record<string, unknown>) || {},
              parentInput: parentInput || '',
              now: today(user?.timezone || 'UTC').toISOString(),
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
        context = await contextRegistry.resolve(
          extended.contextTypes,
          params.params || {}
        );
      }

      // Prepend manual context if provided
      if (params.context && params.context.length > 0) {
        context = [...params.context, ...context];
      }

      // 4. Resolve tools
      const user = params.params?.user as UserWithProfile | undefined;
      let tools = definition.tools;
      if (extended.toolIds && extended.toolIds.length > 0) {
        if (!user) throw new Error(`[AgentRunner] Agent ${agentId} requires user for tool resolution`);
        const toolCtx: ToolExecutionContext = {
          user,
          message: params.input || '',
          previousMessages: params.previousMessages,
          services: getServices(),
          extras: params.params as Record<string, unknown>,
        };
        tools = toolRegistry.resolve(
          extended.toolIds,
          toolCtx
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

      // 7. Resolve examples from extended config
      const agentExamples: AgentExample[] | undefined = extended.examples
        ? extended.examples as AgentExample[]
        : undefined;

      // 8. Build the complete agent definition
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
        onLog: buildOnLog,
        examples: agentExamples,
      });

      // 8. Invoke the agent
      const result = await agent.invoke({
        message: params.input,
        previousMessages: params.previousMessages,
      });

      return result as AgentComposedOutput<unknown, undefined>;
    },
  };
}
