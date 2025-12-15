import type { SubAgentBatch, ConfigurableAgent } from './types';

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
 * - Fails fast if any agent throws
 *
 * @param config - Executor configuration
 * @returns Combined results from all subAgents (excluding 'response' key)
 */
export async function executeSubAgents(
  config: SubAgentExecutorConfig
): Promise<Record<string, unknown>> {
  const { batches, input, previousResults, parentName } = config;

  const accumulatedResults: Record<string, unknown> = { ...previousResults };

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchKeys = Object.keys(batch);

    console.log(`[${parentName}] Executing batch ${batchIndex + 1}/${batches.length}: [${batchKeys.join(', ')}]`);

    const batchStartTime = Date.now();

    // Execute all agents in this batch in parallel (fail fast)
    // Each agent receives the string input (parent's response)
    const batchPromises = batchKeys.map(async (key) => {
      const agent = batch[key] as ConfigurableAgent<unknown>;
      const startTime = Date.now();

      console.log(`[${parentName}:${key}] Starting`);

      const result = await agent.invoke(input);

      console.log(`[${parentName}:${key}] Completed in ${Date.now() - startTime}ms`);

      return { key, result };
    });

    // Wait for all agents in batch (will throw on first failure)
    const batchResults = await Promise.all(batchPromises);

    console.log(`[${parentName}] Batch ${batchIndex + 1} completed in ${Date.now() - batchStartTime}ms`);

    // Accumulate results, flattening { response: X } to just X
    for (const { key, result } of batchResults) {
      const hasResponse = result && typeof result === 'object' && 'response' in result;
      accumulatedResults[key] = hasResponse ? (result as { response: unknown }).response : result;
    }
  }

  // Remove the 'response' key as it will be added by the caller
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { response: _responseKey, ...subAgentResults } = accumulatedResults;
  return subAgentResults;
}
