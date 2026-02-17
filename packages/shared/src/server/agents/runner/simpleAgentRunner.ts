import type { UserWithProfile } from '@/server/models/user';
import type { JsonValue } from '@/server/models/_types';
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
      const [definition, extended] = await Promise.all([
        agentDefinitionService.getDefinition(agentId),
        agentDefinitionService.getExtendedConfig(agentId),
      ]);

      // 2. Resolve tools if present
      const user = params.params?.user as UserWithProfile | undefined;
      let tools;
      if (extended.toolIds && extended.toolIds.length > 0) {
        if (!user) throw new Error(`[SimpleAgentRunner] Agent ${agentId} requires user for tool resolution`);
        const toolCtx: ToolExecutionContext = {
          user,
          message: params.input || '',
          previousMessages: params.previousMessages,
          services: getServices(),
          extras: params.params as Record<string, unknown>,
        };
        tools = toolRegistry.resolve(extended.toolIds, toolCtx);
      }

      // 3. Build user prompt
      let userPrompt = params.input || '';
      if (extended.userPromptTemplate) {
        const templateData: Record<string, unknown> = {
          input: params.input || '',
          ...(params.params || {}),
        };
        userPrompt = resolveTemplate(extended.userPromptTemplate, templateData);
      }

      // 4. Build messages
      const context = params.context || [];
      const examples = extended.examples as AgentExample[] | undefined;
      const messages = buildMessages({
        systemPrompt: definition.systemPrompt,
        userPrompt,
        context,
        examples: examples || undefined,
        previousMessages: params.previousMessages,
      });

      // 5. Execute
      let response: string;
      let accumulatedMessages: string[] | undefined;

      if (tools && tools.length > 0) {
        const model = initializeModel(undefined, {
          model: definition.model,
          temperature: definition.temperature,
          maxTokens: definition.maxTokens,
        }, { tools });

        const result = await executeToolLoop({
          model,
          messages,
          tools,
          name: definition.name,
          maxIterations: definition.maxIterations ?? 5,
        });

        response = result.response;
        accumulatedMessages = result.messages.length > 0 ? result.messages : undefined;
      } else {
        const model = initializeModel<string>(undefined, {
          model: definition.model,
          temperature: definition.temperature,
          maxTokens: definition.maxTokens,
        });

        response = await model.invoke(messages);
      }

      // 6. Log (fire-and-forget)
      if (agentLogRepository) {
        const durationMs = Date.now() - startTime;
        agentLogRepository.log({
          agentId,
          model: definition.model,
          messages: messages as unknown as JsonValue,
          input: params.input || '',
          response: response as unknown as JsonValue,
          durationMs,
          metadata: {} as JsonValue,
        }).catch((err) => {
          console.error(`[SimpleAgentRunner] Log failed for ${agentId}:`, err);
        });
      }

      console.log(`[SimpleAgentRunner] ${agentId} complete in ${Date.now() - startTime}ms`);

      // 7. Return
      return {
        response,
        messages: accumulatedMessages,
      };
    },
  };
}
