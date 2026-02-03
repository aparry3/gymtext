import type { StructuredToolInterface } from '@langchain/core/tools';
import type { Message, ToolExecutionResult } from './types';
import { buildLoopContinuationMessage } from './utils';

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

// Tool execution priority (lower = first)
// Profile updates should happen before modifications
const TOOL_PRIORITY: Record<string, number> = {
  'update_profile': 1,
  'get_workout': 2,
  'make_modification': 3,
};

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

    // Group tool calls by priority for parallel execution within same priority level
    const toolCallsWithPriority = result.tool_calls.map((tc: { name: string; args: unknown }) => ({
      ...tc,
      priority: TOOL_PRIORITY[tc.name] ?? 99,
    }));

    // Group by priority
    const priorityGroups = new Map<number, typeof toolCallsWithPriority>();
    for (const tc of toolCallsWithPriority) {
      const group = priorityGroups.get(tc.priority) || [];
      group.push(tc);
      priorityGroups.set(tc.priority, group);
    }

    // Sort priority levels (lower = first)
    const sortedPriorities = Array.from(priorityGroups.keys()).sort((a, b) => a - b);

    console.log(`[${name}] ${result.tool_calls.length} tool call(s) in ${sortedPriorities.length} priority batch(es): ${
      sortedPriorities.map(p => `P${p}=[${priorityGroups.get(p)!.map((tc: { name: string }) => tc.name).join(',')}]`).join(' → ')
    }`);

    // Track messages from tools for this iteration
    const iterationMessages: string[] = [];
    let toolIndex = 0;

    // Execute priority batches sequentially, tools within batch in parallel
    for (const priority of sortedPriorities) {
      const batch = priorityGroups.get(priority)!;
      const batchStartTime = Date.now();

      console.log(`[${name}] Executing priority ${priority} batch: [${batch.map((tc: { name: string }) => tc.name).join(', ')}]`);

      // Execute all tools in this priority batch in parallel
      const batchPromises = batch.map(async (toolCall: { name: string; args: unknown }, batchIndex: number) => {
        const callId = `call_${iteration}_${toolIndex + batchIndex}`;

        // Find the tool
        const selectedTool = tools.find(t => t.name === toolCall.name);
        if (!selectedTool) {
          console.error(`[${name}] Tool not found: ${toolCall.name}`);
          return { toolCall, callId, error: new Error(`Tool not found: ${toolCall.name}`), result: null };
        }

        const toolStartTime = Date.now();

        try {
          console.log(`[${name}] Executing tool: ${toolCall.name}`);

          const toolResult = await (selectedTool as { invoke: (args: unknown) => Promise<ToolExecutionResult> }).invoke(toolCall.args);

          const durationMs = Date.now() - toolStartTime;
          console.log(`[${name}] ${toolCall.name} complete in ${durationMs}ms`);

          return { toolCall, callId, error: null, result: toolResult, durationMs };
        } catch (error) {
          console.error(`[${name}] Tool error (${toolCall.name}):`, error);
          return { toolCall, callId, error, result: null };
        }
      });

      // Wait for all tools in this batch to complete
      const batchResults = await Promise.all(batchPromises);

      console.log(`[${name}] Priority ${priority} batch completed in ${Date.now() - batchStartTime}ms`);

      // Process results in order (maintain conversation history order)
      for (const { toolCall, callId, error, result: toolResult, durationMs } of batchResults) {
        if (error || !toolResult) {
          // Add error to conversation history so model knows it failed
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
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            tool_call_id: callId,
          });

          accumulatedMessages.push(
            "I tried to help but encountered an issue. Please try again!"
          );
          continue;
        }

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
          durationMs: durationMs ?? 0,
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
      }

      toolIndex += batch.length;
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
