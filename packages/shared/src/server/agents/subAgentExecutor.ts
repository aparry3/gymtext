import type { SubAgentBatch, SubAgentConfig, ConfigurableAgent } from './types';

/**
 * Configuration for subAgent execution
 */
export interface SubAgentExecutorConfig {
  batches: SubAgentBatch[];
  /** String input passed to each subAgent (typically parent agent's response) */
  input: string;
  /** Original input to the parent agent (for transform functions that need it) */
  parentInput: string;
  previousResults: Record<string, unknown>;
  parentName: string;
}

/**
 * Type guard to check if entry is an extended SubAgentConfig
 */
function isSubAgentConfig(entry: unknown): entry is SubAgentConfig {
  return entry !== null &&
    typeof entry === 'object' &&
    'agent' in entry &&
    typeof (entry as SubAgentConfig).agent?.invoke === 'function';
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
 * NOTE: Validation is now handled by agents internally via their own invoke().
 * When a sub-agent has validate + maxRetries on its AgentDefinition,
 * it handles retries with error feedback automatically.
 *
 * @param config - Executor configuration
 * @returns Combined results from all subAgents (excluding 'response' key)
 */
export async function executeSubAgents(
  config: SubAgentExecutorConfig
): Promise<Record<string, unknown>> {
  const { batches, input, parentInput, previousResults, parentName } = config;

  // Main result for condition/transform functions
  const mainResult = previousResults.response;

  const accumulatedResults: Record<string, unknown> = { ...previousResults };

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchKeys = Object.keys(batch);

    console.log(`[${parentName}] Executing batch ${batchIndex + 1}/${batches.length}: [${batchKeys.join(', ')}]`);

    const batchStartTime = Date.now();

    // Execute all agents in this batch in parallel (fail fast)
    const batchPromises = batchKeys.map(async (key) => {
      const entry = batch[key];

      // Determine agent, condition, transform, and onComplete based on entry type
      let agent: ConfigurableAgent<unknown>;
      let condition: ((r: unknown) => boolean) | undefined;
      let transform: ((r: unknown, parentInput?: string) => string) | undefined;
      let onComplete: ((result: unknown) => void | Promise<void>) | undefined;

      if (isSubAgentConfig(entry)) {
        // Extended config: { agent, transform?, condition?, onComplete? }
        agent = entry.agent;
        condition = entry.condition;
        transform = entry.transform;
        onComplete = entry.onComplete;
      } else {
        // Simple config: bare agent
        agent = entry as ConfigurableAgent<unknown>;
      }

      // Check condition - skip if condition returns false
      if (condition && !condition(mainResult)) {
        console.log(`[${parentName}:${key}] Skipped (condition not met)`);
        return { key, result: null, skipped: true };
      }

      // Determine input: use transform if provided, otherwise default input
      // Transform receives mainResult + optional parentInput (backwards compatible)
      const agentInput = transform
        ? transform(mainResult, parentInput)
        : input;

      const startTime = Date.now();
      console.log(`[${parentName}:${key}] Starting`);

      // Execute the agent - validation is handled internally by the agent
      // Pass InvokeParams with the message
      const result = await agent.invoke({ message: agentInput });

      // Fire onComplete callback (fire-and-forget, don't block)
      if (onComplete) {
        Promise.resolve(onComplete(result)).catch((e) =>
          console.error(`[${parentName}:${key}] onComplete callback failed:`, e)
        );
      }

      console.log(`[${parentName}:${key}] Completed in ${Date.now() - startTime}ms`);
      return { key, result, skipped: false };
    });

    // Wait for all agents in batch (will throw on first failure)
    const batchResults = await Promise.all(batchPromises);

    console.log(`[${parentName}] Batch ${batchIndex + 1} completed in ${Date.now() - batchStartTime}ms`);

    // Accumulate results, flattening { response: X } to just X, skip nulls from conditions
    for (const { key, result, skipped } of batchResults) {
      if (skipped) continue;
      const hasResponse = result && typeof result === 'object' && 'response' in result;
      accumulatedResults[key] = hasResponse ? (result as { response: unknown }).response : result;
    }
  }

  // Remove the 'response' key as it will be added by the caller
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { response: _responseKey, ...subAgentResults } = accumulatedResults;
  return subAgentResults;
}
