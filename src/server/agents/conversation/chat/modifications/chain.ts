import { z } from 'zod';
import { RunnableLambda } from '@langchain/core/runnables';
import { initializeModel } from '@/server/agents/base';
import type { ChatSubagentInput } from '../baseAgent';
import { MODIFICATIONS_SYSTEM_PROMPT, buildModificationsUserMessage } from './prompts';
import { modificationTools } from './tools';

/**
 * Schema for modifications agent output
 */
export const ModificationsResponseSchema = z.object({
    response: z.string().describe('acknowledgment of the request and a response to the request'),
});

export type ModificationsResponse = z.infer<typeof ModificationsResponseSchema>;

/**
 * Modifications agent runnable - handles workout change and modification requests using tools
 */
export const modificationsAgentRunnable = (): RunnableLambda<ChatSubagentInput, ModificationsResponse> => {
  return RunnableLambda.from(async (input: ChatSubagentInput) => {
    const agentName = 'MODIFICATIONS';

    console.log(`[${agentName}] Processing message:`, {
      message: input.message.substring(0, 100) + (input.message.length > 100 ? '...' : ''),
      primaryIntent: input.triage.intents[0]?.intent,
      confidence: input.triage.intents[0]?.confidence,
    });

    // Initialize model with tools
    const model = initializeModel(undefined, { model: 'gpt-5-nano' });
    const modelWithTools = model.bindTools(modificationTools);

    const systemMessage = {
      role: 'system',
      content: MODIFICATIONS_SYSTEM_PROMPT,
    };

    const userMessage = {
      role: 'user',
      content: buildModificationsUserMessage(input),
    };

    const messages: any[] = [systemMessage, userMessage]; // eslint-disable-line @typescript-eslint/no-explicit-any
    let toolCallCount = 0;
    const maxToolCalls = 5; // Prevent infinite loops

    // Agent loop: call tools until we get a final response
    while (toolCallCount < maxToolCalls) {
      const response = await modelWithTools.invoke(messages);

      // Check if there are tool calls
      if (response.tool_calls && response.tool_calls.length > 0) {
        console.log(`[${agentName}] Tool calls:`, response.tool_calls.map((tc: any) => tc.name)); // eslint-disable-line @typescript-eslint/no-explicit-any

        // Add AI message with tool calls to history
        messages.push({
          role: 'assistant',
          content: response.content || '',
          tool_calls: response.tool_calls,
        } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

        // Execute each tool call
        for (const toolCall of response.tool_calls) {
          const tool = modificationTools.find(t => t.name === toolCall.name);

          if (!tool) {
            console.error(`[${agentName}] Tool not found: ${toolCall.name}`);
            continue;
          }

          try {
            console.log(`[${agentName}] Executing tool: ${toolCall.name}`, toolCall.args);
            const toolResult = await tool.invoke(toolCall.args);
            console.log(`[${agentName}] Tool result:`, toolResult);

            // Add tool result to messages
            messages.push({
              role: 'tool',
              content: toolResult,
              tool_call_id: toolCall.id,
            } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
          } catch (error) {
            console.error(`[${agentName}] Error executing tool ${toolCall.name}:`, error);
            messages.push({
              role: 'tool',
              content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              tool_call_id: toolCall.id,
            } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
          }
        }

        toolCallCount++;
      } else {
        // No more tool calls, we have our final response
        const finalResponse = response.content as string;

        console.log(`[${agentName}] Generated final response:`, {
          response: finalResponse.substring(0, 100) + (finalResponse.length > 100 ? '...' : ''),
        });

        return {
          response: finalResponse,
        };
      }
    }

    // If we hit the max tool calls, return a fallback response
    console.warn(`[${agentName}] Hit max tool calls (${maxToolCalls}), returning fallback`);
    return {
      response: "I've made the modifications to your workout. Let me know if you need anything else!",
    };
  });
};
