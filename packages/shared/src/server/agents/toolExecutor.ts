import type { StructuredToolInterface } from '@langchain/core/tools';
import type { Message, ToolExecutionResult } from './types';
import { buildLoopContinuationMessage } from './utils';
import { toolRegistry } from './registry/toolRegistry';

/**
 * Configuration for tool loop execution
 */
export interface ToolLoopConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any;
  messages: Message[];
  tools: StructuredToolInterface[];
  name: string;
  maxIterations: number;
}

/**
 * Result from tool loop execution
 */
export interface ToolLoopResult {
  response: string;
  messages: string[];
  toolCalls: ToolCallRecord[];
}

/**
 * Record of a tool call for observability
 */
export interface ToolCallRecord {
  name: string;
  args: Record<string, unknown>;
  result: string;
  durationMs: number;
}

/**
 * Execute an agentic tool loop
 *
 * Continues until model returns a response without tool calls
 * or max iterations is reached.
 *
 * @param config - Tool loop configuration
 * @returns Final response string and accumulated messages
 */
export async function executeToolLoop(config: ToolLoopConfig): Promise<ToolLoopResult> {
  const { model, messages, tools, name, maxIterations } = config;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conversationHistory: any[] = [...messages];
  const toolCalls: ToolCallRecord[] = [];
  const accumulatedMessages: string[] = [];
  let lastToolType: 'query' | 'action' = 'action';

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    console.log(`[${name}] Tool loop iteration ${iteration}`);

    const result = await model.invoke(conversationHistory);

    // Check for tool calls
    if (!result.tool_calls || result.tool_calls.length === 0) {
      // No tool calls - return the response
      const response = typeof result.content === 'string'
        ? result.content
        : String(result.content);

      console.log(`[${name}] Tool loop completed after ${iteration} iteration(s)`);

      return {
        response,
        messages: accumulatedMessages,
        toolCalls,
      };
    }

    // Sort tool calls by priority (resolved from ToolRegistry)
    const sortedToolCalls = [...result.tool_calls].sort(
      (a: { name: string }, b: { name: string }) =>
        toolRegistry.getPriority(a.name) - toolRegistry.getPriority(b.name)
    );

    console.log(`[${name}] ${sortedToolCalls.length} tool call(s): ${sortedToolCalls.map((tc: { name: string }) => tc.name).join(', ')}`);

    // Track messages from tools for this iteration
    const iterationMessages: string[] = [];

    // Execute each tool call in priority order
    for (let i = 0; i < sortedToolCalls.length; i++) {
      const toolCall = sortedToolCalls[i];
      const callId = `call_${iteration}_${i}`;

      // Find the tool
      const selectedTool = tools.find(t => t.name === toolCall.name);
      if (!selectedTool) {
        console.error(`[${name}] Tool not found: ${toolCall.name}`);
        continue;
      }

      const toolStartTime = Date.now();

      try {
        console.log(`[${name}] Executing tool: ${toolCall.name}`);

        const toolResult = await (selectedTool as { invoke: (args: unknown) => Promise<ToolExecutionResult> }).invoke(toolCall.args);

        const durationMs = Date.now() - toolStartTime;

        // Track tool type for continuation message
        lastToolType = toolResult.toolType || 'action';

        // Accumulate messages if present
        if (toolResult.messages && toolResult.messages.length > 0) {
          accumulatedMessages.push(...toolResult.messages);
          iterationMessages.push(...toolResult.messages);
          console.log(`[${name}] Accumulated ${toolResult.messages.length} message(s) from ${toolCall.name}`);
        }

        // Record tool call for observability
        toolCalls.push({
          name: toolCall.name,
          args: toolCall.args as Record<string, unknown>,
          result: toolResult.response,
          durationMs,
        });

        // Add to conversation history
        conversationHistory.push({
          role: 'assistant',
          content: '',
          tool_calls: [{
            id: callId,
            type: 'function',
            function: { name: toolCall.name, arguments: JSON.stringify(toolCall.args) },
          }],
        });
        conversationHistory.push({
          role: 'tool',
          content: toolResult.response,
          tool_call_id: callId,
        });

        console.log(`[${name}] ${toolCall.name} complete in ${durationMs}ms`);
      } catch (error) {
        console.error(`[${name}] Tool error (${toolCall.name}):`, error);

        // Add error to conversation history so model knows it failed
        conversationHistory.push({
          role: 'tool',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          tool_call_id: callId,
        });

        accumulatedMessages.push(
          "I tried to help but encountered an issue. Please try again!"
        );
      }
    }

    // Add continuation message for next iteration
    conversationHistory.push({
      role: 'user',
      content: buildLoopContinuationMessage(lastToolType, iterationMessages),
    });

    console.log(`[${name}] All tools complete, continuing loop`);
  }

  // Max iterations reached
  console.warn(`[${name}] Max iterations (${maxIterations}) reached`);

  return {
    response: accumulatedMessages.length > 0
      ? accumulatedMessages[accumulatedMessages.length - 1]
      : "I'm here to help! What would you like to know?",
    messages: accumulatedMessages,
    toolCalls,
  };
}
