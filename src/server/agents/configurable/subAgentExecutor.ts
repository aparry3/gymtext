import type { SubAgentBatch, ConfigurableAgent } from './types';

/**
 * Configuration for subAgent execution
 */
export interface SubAgentExecutorConfig {
  batches: SubAgentBatch[];
  input: unknown;
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

  let accumulatedResults: Record<string, unknown> = { ...previousResults };

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchKeys = Object.keys(batch);

    console.log(`[${parentName}] Executing batch ${batchIndex + 1}/${batches.length}: [${batchKeys.join(', ')}]`);

    // Prepare input for this batch - combine original input with accumulated results
    const batchInput = {
      ...(typeof input === 'object' && input !== null ? input : {}),
      ...accumulatedResults,
    };

    const batchStartTime = Date.now();

    // Execute all agents in this batch in parallel (fail fast)
    const batchPromises = batchKeys.map(async (key) => {
      const agent = batch[key] as ConfigurableAgent<typeof batchInput, unknown>;
      const startTime = Date.now();

      console.log(`[${parentName}:${key}] Starting`);

      const result = await agent.invoke(batchInput);

      console.log(`[${parentName}:${key}] Completed in ${Date.now() - startTime}ms`);

      return { key, result };
    });

    // Wait for all agents in batch (will throw on first failure)
    const batchResults = await Promise.all(batchPromises);

    console.log(`[${parentName}] Batch ${batchIndex + 1} completed in ${Date.now() - batchStartTime}ms`);

    // Accumulate results
    for (const { key, result } of batchResults) {
      accumulatedResults[key] = result;
    }
  }

  // Remove the 'response' key as it will be added by the caller
  const { response: _, ...subAgentResults } = accumulatedResults;
  return subAgentResults;
}
