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
import type { AgentExtensionServiceInstance } from '@/server/services/domain/agents/agentExtensionService';
import type { AgentExtension } from '@/server/models/agentExtension';
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
  agentLogRepository?: {
    log: (entry: NewAgentLog) => Promise<string | null>;
    updateEval: (logId: string, evalResult: unknown, evalScore: number | null) => Promise<void>;
  };
  /** Optional agent extension service for resolving per-agent extensions */
  agentExtensionService?: AgentExtensionServiceInstance;
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
    agentExtensionService,
  } = deps;

  /**
   * Build the onLog callback for sub-agent DB logging (no eval)
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
   * Run eval against an agent's output (fire-and-forget)
   */
  async function runEval(
    logId: string,
    agentId: string,
    input: string,
    response: unknown,
    evalPrompt: string,
    evalModel: string | null
  ): Promise<void> {
    try {
      const model = (evalModel || 'gpt-5-nano') as ModelId;
      const evalAgent = createAgent({
        name: `eval:${agentId}`,
        systemPrompt: evalPrompt,
        model,
        maxTokens: 1000,
        temperature: 0,
        maxIterations: 1,
        maxRetries: 0,
      });

      const evalInput = JSON.stringify({
        agentId,
        input,
        response: typeof response === 'string' ? response : JSON.stringify(response),
      });

      const evalResult = await evalAgent.invoke({ message: evalInput });
      const responseText = typeof evalResult.response === 'string'
        ? evalResult.response
        : JSON.stringify(evalResult.response);

      // Try to extract a numeric score from the response
      let score: number | null = null;
      const scoreMatch = responseText.match(/(?:score|rating)[:\s]*(\d+(?:\.\d+)?)/i)
        || responseText.match(/(\d+(?:\.\d+)?)\s*\/\s*\d+/);
      if (scoreMatch) {
        score = parseFloat(scoreMatch[1]);
      }

      await agentLogRepository!.updateEval(logId, evalResult.response, score);
    } catch (error) {
      console.error(`[AgentRunner] Eval failed for ${agentId}:`, error);
    }
  }

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

        // Resolve extensions for sub-agent (inherit parent's explicit extensions)
        let subSystemPrompt = subAgentDef.systemPrompt;
        if (agentExtensionService && params.extensions) {
          const mergedExtKeys: Record<string, string> = {
            ...(subExtended.defaultExtensions || {}),
            ...params.extensions,
          };
          for (const [extType, extKey] of Object.entries(mergedExtKeys)) {
            if (!extKey) continue;
            const ext = await agentExtensionService.getExtension(config.agentId, extType, extKey);
            if (ext?.systemPrompt) {
              subSystemPrompt = ext.systemPromptMode === 'override'
                ? ext.systemPrompt
                : subSystemPrompt + '\n\n' + ext.systemPrompt;
            }
          }
        }

        // Create the sub-agent
        const subAgent = createAgent({
          ...subAgentDef,
          systemPrompt: subSystemPrompt,
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

      // 8. Resolve extensions
      let finalSystemPrompt = definition.systemPrompt;
      let finalEvalPrompt = extended.evalPrompt;
      let finalModel = definition.model as ModelId;
      let finalMaxTokens = definition.maxTokens;
      let finalTemperature = definition.temperature;
      let finalMaxIterations = definition.maxIterations;
      let finalMaxRetries = definition.maxRetries;
      let finalUserPromptTemplate = extended.userPromptTemplate;
      let finalToolIds = extended.toolIds;
      let finalContextTypes = extended.contextTypes;
      let finalSchemaJson = extended.schemaJson;
      let finalValidationRules = extended.validationRules;
      let finalSubAgentConfigs = extended.subAgents;
      let finalExamples = extended.examples;

      if (agentExtensionService) {
        const resolvedExtensions: AgentExtension[] = [];

        // 8a. Explicit extensions (backward compat)
        const mergedExtensionKeys: Record<string, string> = {
          ...(extended.defaultExtensions || {}),
          ...(params.extensions || {}),
        };

        const explicitlyResolved = new Set<string>();

        for (const [extType, extKey] of Object.entries(mergedExtensionKeys)) {
          if (!extKey) continue;
          const ext = await agentExtensionService.getExtension(agentId, extType, extKey);
          if (ext) {
            resolvedExtensions.push(ext);
            explicitlyResolved.add(`${extType}:${extKey}`);
          }
        }

        // 8b. Auto-triggered extensions
        const allExtensions = await agentExtensionService.getFullExtensionsByAgent(agentId);
        const triggerContext = { ...(params.params || {}) };

        for (const ext of allExtensions) {
          const pairKey = `${ext.extensionType}:${ext.extensionKey}`;
          if (explicitlyResolved.has(pairKey)) continue;

          if (ext.triggerConditions && Array.isArray(ext.triggerConditions) && (ext.triggerConditions as unknown[]).length > 0) {
            const result = evaluateRules(ext.triggerConditions as unknown as ValidationRule[], triggerContext);
            if (result.isValid) {
              resolvedExtensions.push(ext);
            }
          }
        }

        // 8c. Apply extensions in order
        for (const ext of resolvedExtensions) {
          // Prompt fields with mode
          if (ext.systemPrompt) {
            finalSystemPrompt = ext.systemPromptMode === 'override'
              ? ext.systemPrompt
              : finalSystemPrompt + '\n\n' + ext.systemPrompt;
          }
          if (ext.userPromptTemplate) {
            finalUserPromptTemplate = ext.userPromptTemplateMode === 'override'
              ? ext.userPromptTemplate
              : [finalUserPromptTemplate, ext.userPromptTemplate].filter(Boolean).join('\n\n') || null;
          }
          if (ext.evalPrompt) {
            finalEvalPrompt = ext.evalPromptMode === 'override'
              ? ext.evalPrompt
              : [finalEvalPrompt, ext.evalPrompt].filter(Boolean).join('\n\n') || null;
          }
          // Non-prompt overrides (when non-null)
          if (ext.model) finalModel = ext.model as ModelId;
          if (ext.maxTokens != null) finalMaxTokens = ext.maxTokens;
          if (ext.temperature != null) finalTemperature = typeof ext.temperature === 'string' ? parseFloat(ext.temperature) : ext.temperature;
          if (ext.maxIterations != null) finalMaxIterations = ext.maxIterations;
          if (ext.maxRetries != null) finalMaxRetries = ext.maxRetries;
          if (ext.toolIds) finalToolIds = ext.toolIds;
          if (ext.contextTypes) finalContextTypes = ext.contextTypes;
          if (ext.schemaJson) finalSchemaJson = ext.schemaJson as unknown as Record<string, unknown>;
          if (ext.validationRules) finalValidationRules = ext.validationRules as unknown as ValidationRule[];
          if (ext.subAgents) finalSubAgentConfigs = ext.subAgents as unknown as SubAgentDbConfig[];
          if (ext.examples) finalExamples = ext.examples as unknown as unknown[];
        }
      }

      // Re-resolve tools if extensions changed toolIds
      if (finalToolIds !== extended.toolIds && finalToolIds && finalToolIds.length > 0) {
        if (!user) throw new Error(`[AgentRunner] Agent ${agentId} requires user for tool resolution`);
        const toolCtx: ToolExecutionContext = {
          user,
          message: params.input || '',
          previousMessages: params.previousMessages,
          services: getServices(),
          extras: params.params as Record<string, unknown>,
        };
        tools = toolRegistry.resolve(finalToolIds, toolCtx);
      }

      // Re-resolve context if extensions changed contextTypes
      if (finalContextTypes !== extended.contextTypes && finalContextTypes && finalContextTypes.length > 0) {
        const resolvedCtx = await contextRegistry.resolve(finalContextTypes, params.params || {});
        context = params.context && params.context.length > 0
          ? [...params.context, ...resolvedCtx]
          : resolvedCtx;
      }

      // Re-build sub-agents if extensions changed them
      if (finalSubAgentConfigs !== extended.subAgents && finalSubAgentConfigs && finalSubAgentConfigs.length > 0) {
        subAgents = await buildSubAgents(finalSubAgentConfigs, params, 0);
      }

      // Re-build validation if extensions changed rules
      if (finalValidationRules !== extended.validationRules && finalValidationRules && finalValidationRules.length > 0) {
        const rules = finalValidationRules;
        validate = (result: unknown) => evaluateRules(rules, result);
      }

      // Re-resolve examples if extensions changed them
      const agentExamplesResolved: AgentExample[] | undefined = finalExamples
        ? finalExamples as AgentExample[]
        : agentExamples;

      // 8b. Build onLog for the top-level agent (with eval support)
      const topLevelOnLog = agentLogRepository
        ? (entry: { agentId: string; model?: string; input: string; messages: unknown; response: unknown; durationMs: number; metadata?: Record<string, unknown> }) => {
            agentLogRepository.log({
              agentId: entry.agentId,
              model: entry.model ?? null,
              messages: entry.messages as JsonValue,
              input: entry.input,
              response: entry.response as JsonValue,
              durationMs: entry.durationMs,
              metadata: (entry.metadata ?? {}) as JsonValue,
            }).then((logId) => {
              if (logId && finalEvalPrompt) {
                runEval(logId, entry.agentId, entry.input, entry.response, finalEvalPrompt, extended.evalModel);
              }
            });
          }
        : undefined;

      // 9. Build the complete agent definition
      const agent = createAgent({
        ...definition,
        systemPrompt: finalSystemPrompt,
        model: finalModel,
        maxTokens: finalMaxTokens,
        temperature: finalTemperature,
        maxIterations: finalMaxIterations,
        maxRetries: finalMaxRetries,
        context,
        tools,
        schema: finalSchemaJson
          ? (finalSchemaJson as unknown as undefined)
          : definition.schema,
        subAgents: subAgents && subAgents.length > 0
          ? subAgents
          : undefined,
        validate,
        onLog: topLevelOnLog,
        examples: agentExamplesResolved,
      });

      // 10. Invoke the agent
      const result = await agent.invoke({
        message: params.input,
        previousMessages: params.previousMessages,
      });

      return result as AgentComposedOutput<unknown, undefined>;
    },
  };
}
