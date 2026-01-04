import type { ZodSchema } from 'zod';
import type { AgentDefinition, ModelConfig, ConfigurableAgent, InferSchemaOutput, AgentComposedOutput, SubAgentBatch } from './types';
/**
 * Create a configurable agent from a definition and model config
 *
 * This factory function creates agents declaratively, supporting:
 * - Structured output via Zod schemas
 * - Optional userPrompt transformer for input strings
 * - Pre-computed context messages
 * - Tool-based agents with agentic loops
 * - Composed agents with parallel/sequential subAgents
 * - Database-backed prompts (fetched if systemPrompt not provided)
 *
 * @param definition - The agent's declarative configuration
 * @param config - Optional model configuration
 * @returns A Promise resolving to a ConfigurableAgent that can be invoked with a string
 *
 * @example
 * ```typescript
 * // Agent with DB-stored prompts (systemPrompt fetched from database)
 * const messageAgent = await createAgent({
 *   name: 'workout-message',
 *   context: [`<Profile>${user.profile}</Profile>`],
 *   schema: MessageSchema,
 * }, { model: 'gpt-5-nano' });
 *
 * await messageAgent.invoke('Generate a motivational workout message');
 *
 * // Agent with explicit systemPrompt (legacy pattern, bypasses DB)
 * const workoutAgent = await createAgent({
 *   name: 'workout',
 *   systemPrompt: SYSTEM_PROMPT,
 *   userPrompt: (input) => `Create workout based on: ${input}`,
 *   context: [profileContext, historyContext],
 *   subAgents: [
 *     { structured: structuredAgent, message: messageAgent },
 *     { validation: validationAgent }
 *   ]
 * }, { model: 'gpt-5.1' });
 *
 * await workoutAgent.invoke('upper body strength');
 * ```
 */
export declare function createAgent<TSchema extends ZodSchema | undefined = undefined, TSubAgents extends SubAgentBatch[] | undefined = undefined>(definition: AgentDefinition<TSchema>, config?: ModelConfig): Promise<ConfigurableAgent<AgentComposedOutput<InferSchemaOutput<TSchema>, TSubAgents>>>;
//# sourceMappingURL=createAgent.d.ts.map