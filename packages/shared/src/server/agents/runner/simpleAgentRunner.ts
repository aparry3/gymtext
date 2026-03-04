import type { UserWithProfile } from '@/server/models/user';
import type { JsonValue } from '@/server/models/_types';
import type { NewAgentLog } from '@/server/models/agentLog';
import type { AgentExample } from '../types';
import type { ToolExecutionContext } from '../tools/types';
import type {
  SimpleAgentRunnerDeps,
  SimpleAgentRunnerInstance,
  SimpleAgentInvokeParams,
} from './simpleTypes';
import { initializeModel } from '../models';
import { executeToolLoop } from '../toolExecutor';
import { buildMessages } from '../utils';
import { resolveTemplate } from '../templateUtils/templateEngine';
import { evaluateLog } from '../evals';

/**
 * Simplified AgentRunner - no context registry, no sub-agents, no validation,
 * no extensions, no structured output.
 *
 * Flow:
 * 1. Fetch agent config from DB
 * 2. Resolve tools if present
 * 3. Apply user prompt template if present
 * 4. Build messages
 * 5. Execute (tool loop or plain text)
 * 6. Log (fire-and-forget)
 * 7. Return { response, messages }
 */
export function createSimpleAgentRunner(deps: SimpleAgentRunnerDeps): SimpleAgentRunnerInstance {
  const { agentDefinitionService, toolRegistry, getServices, agentLogRepository } = deps;

  return {
    async invoke(agentId: string, params: SimpleAgentInvokeParams) {
      const startTime = Date.now();
      console.log(`[SimpleAgentRunner] Invoking ${agentId}`);

      // 1. Fetch agent config
      const config = await agentDefinitionService.getAgentDefinition(agentId);

      // 1b. Resolve formatters and append to system prompt
      let systemPrompt = config.systemPrompt;
      if (config.formatterIds && config.formatterIds.length > 0) {
        const formatterContents = await agentDefinitionService.getFormatterContents(config.formatterIds);
        systemPrompt = systemPrompt + '\n\n' + formatterContents.join('\n\n');
      }

      // 2. Resolve tools if present
      const user = params.params?.user as UserWithProfile | undefined;
      let tools;
      if (config.toolIds && config.toolIds.length > 0) {
        if (!user) throw new Error(`[SimpleAgentRunner] Agent ${agentId} requires user for tool resolution`);
        const toolCtx: ToolExecutionContext = {
          user,
          message: params.input || '',
          previousMessages: params.previousMessages,
          services: getServices(),
          extras: params.params as Record<string, unknown>,
        };
        tools = toolRegistry.resolve(config.toolIds, toolCtx);
      }

      // 3. Build user prompt
      let userPrompt = params.input || '';
      const template = params.userPromptTemplate || config.userPromptTemplate;
      if (template) {
        const templateData: Record<string, unknown> = {
          input: params.input || '',
          ...(params.params || {}),
        };
        userPrompt = resolveTemplate(template, templateData);
      }

      // 4. Build messages
      const context = params.context || [];
      const examples = config.examples as AgentExample[] | undefined;
      const messages = buildMessages({
        systemPrompt,
        userPrompt,
        context,
        examples: examples || undefined,
        previousMessages: params.previousMessages,
      });

      // 5. Execute
      let response: string;
      let accumulatedMessages: string[] | undefined;
      let logMetadata: Record<string, unknown> = {};

      if (tools && tools.length > 0) {
        if (config.outputSchema) {
          console.warn(`[SimpleAgentRunner] Agent ${agentId} has both tools and outputSchema; tools take precedence, outputSchema ignored`);
        }
        const model = initializeModel(undefined, {
          model: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        }, { tools });

        const result = await executeToolLoop({
          model,
          messages,
          tools,
          name: agentId,
          maxIterations: config.maxIterations ?? 5,
        });

        response = result.response;
        accumulatedMessages = result.messages.length > 0 ? result.messages : undefined;
        logMetadata = {
          usage: result.usage,
          toolCalls: result.toolCalls.map(tc => ({ name: tc.name, durationMs: tc.durationMs })),
          toolIterations: result.iterations,
          isToolAgent: true,
        };
      } else if (config.outputSchema) {
        const model = initializeModel<unknown>(config.outputSchema, {
          model: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        });

        const parsed = await model.invoke(messages);
        response = JSON.stringify(parsed);
        logMetadata = { usage: model.lastUsage };
      } else {
        const model = initializeModel<string>(undefined, {
          model: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        });

        response = await model.invoke(messages);
        logMetadata = { usage: model.lastUsage };
      }

      logMetadata.invokeParams = {
        input: params.input,
        context: params.context,
        params: sanitizeParams(params.params),
      };

      // 6. Log (fire-and-forget) + async eval
      if (agentLogRepository) {
        const durationMs = Date.now() - startTime;
        const logEntry: NewAgentLog = {
          agentId,
          model: config.model,
          messages: messages as unknown as JsonValue,
          input: params.input || '',
          response: response as unknown as JsonValue,
          durationMs,
          metadata: logMetadata as JsonValue,
        };
        agentLogRepository.log(logEntry).then((logId) => {
          // Fire eval async after logging succeeds
          if (logId && agentLogRepository) {
            evaluateLog(logEntry, config).then((evalResult) => {
              if (evalResult) {
                agentLogRepository.updateEval(logId, {
                  evalResult: evalResult.result as unknown as JsonValue,
                  evalScore: evalResult.overallScore,
                });
              }
            }).catch((err) => {
              console.error(`[SimpleAgentRunner] Eval failed for ${agentId} log ${logId}:`, err);
            });
          }
        }).catch((err) => {
          console.error(`[SimpleAgentRunner] Log failed for ${agentId}:`, err);
        });
      }

      console.log(`[SimpleAgentRunner] ${agentId} complete in ${Date.now() - startTime}ms`);

      // 7. Return
      return {
        response,
      };
    },
  };
}

function sanitizeParams(params?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const sanitized = { ...params };
  if (sanitized.user && typeof sanitized.user === 'object') {
    const user = sanitized.user as Record<string, unknown>;
    sanitized.user = {
      id: user.id,
      name: user.name,
      timezone: user.timezone,
    };
  }
  return sanitized;
}
