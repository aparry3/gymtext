import { buildLoopContinuationMessage } from './utils';
// Tool execution priority (lower = first)
// Profile updates should happen before modifications
const TOOL_PRIORITY = {
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
export async function executeToolLoop(config) {
    const { model, messages, tools, name, maxIterations } = config;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversationHistory = [...messages];
    const toolCalls = [];
    const accumulatedMessages = [];
    let lastToolType = 'action';
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
        // Sort tool calls by priority
        const sortedToolCalls = [...result.tool_calls].sort((a, b) => (TOOL_PRIORITY[a.name] ?? 99) - (TOOL_PRIORITY[b.name] ?? 99));
        console.log(`[${name}] ${sortedToolCalls.length} tool call(s): ${sortedToolCalls.map((tc) => tc.name).join(', ')}`);
        // Track messages from tools for this iteration
        const iterationMessages = [];
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
                const toolResult = await selectedTool.invoke(toolCall.args);
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
                    args: toolCall.args,
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
            }
            catch (error) {
                console.error(`[${name}] Tool error (${toolCall.name}):`, error);
                // Add error to conversation history so model knows it failed
                conversationHistory.push({
                    role: 'tool',
                    content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    tool_call_id: callId,
                });
                accumulatedMessages.push("I tried to help but encountered an issue. Please try again!");
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
