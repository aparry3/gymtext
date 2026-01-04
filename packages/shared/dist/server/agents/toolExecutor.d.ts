import type { StructuredToolInterface } from '@langchain/core/tools';
import type { Message } from './types';
/**
 * Configuration for tool loop execution
 */
export interface ToolLoopConfig {
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
export declare function executeToolLoop(config: ToolLoopConfig): Promise<ToolLoopResult>;
//# sourceMappingURL=toolExecutor.d.ts.map