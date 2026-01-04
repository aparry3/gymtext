import type { SubAgentBatch } from './types';
/**
 * Configuration for subAgent execution
 */
export interface SubAgentExecutorConfig {
    batches: SubAgentBatch[];
    /** String input passed to each subAgent (typically parent agent's response) */
    input: string;
    previousResults: Record<string, unknown>;
    parentName: string;
}
/**
 * Execute subAgent batches
 *
 * - Batches run sequentially (array order)
 * - Agents within a batch run in parallel (object keys)
 * - Each batch receives results from previous batches
 * - Supports extended config with transform and condition per agent
 * - Fails fast if any agent throws
 *
 * @param config - Executor configuration
 * @returns Combined results from all subAgents (excluding 'response' key)
 */
export declare function executeSubAgents(config: SubAgentExecutorConfig): Promise<Record<string, unknown>>;
//# sourceMappingURL=subAgentExecutor.d.ts.map