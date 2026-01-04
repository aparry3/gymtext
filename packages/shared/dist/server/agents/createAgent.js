import { initializeModel } from './models';
import { buildMessages } from './utils';
import { executeSubAgents } from './subAgentExecutor';
import { executeToolLoop } from './toolExecutor';
import { logAgentInvocation } from './logger';
import { promptService } from '@/server/services/prompts/promptService';
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
export async function createAgent(definition, config) {
    const { name, systemPrompt: providedSystemPrompt, userPrompt: providedUserPrompt, context = [], previousMessages = [], tools, schema, subAgents = [], } = definition;
    // Fetch prompts from database if systemPrompt not provided directly
    let systemPrompt = providedSystemPrompt;
    let dbUserPrompt = null;
    if (!systemPrompt) {
        const prompts = await promptService.getPrompts(name);
        systemPrompt = prompts.systemPrompt;
        dbUserPrompt = prompts.userPrompt;
    }
    const { maxIterations = 5 } = config || {};
    // Determine if this is a tool-based agent
    const isToolAgent = tools && tools.length > 0;
    // Initialize the model appropriately
    // Tools and schema are mutually exclusive - tools take precedence
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = isToolAgent
        ? initializeModel(undefined, config, { tools })
        : initializeModel(schema, config);
    const invoke = async (input) => {
        const startTime = Date.now();
        console.log(`[${name}] Starting execution`);
        try {
            // Determine the final user message:
            // 1. If userPrompt function provided, use it to transform input
            // 2. Else if DB user prompt exists, prepend it to input
            // 3. Else input IS the user message directly
            let evaluatedUserPrompt;
            if (providedUserPrompt) {
                evaluatedUserPrompt = providedUserPrompt(input);
            }
            else if (dbUserPrompt) {
                // DB user prompt is a template that precedes the actual user input
                evaluatedUserPrompt = `${dbUserPrompt}\n\n${input}`;
            }
            else {
                evaluatedUserPrompt = input;
            }
            // Build messages with context and previous conversation history
            const messages = buildMessages({
                systemPrompt,
                userPrompt: evaluatedUserPrompt,
                context,
                previousMessages,
            });
            // Execute main agent
            let mainResult;
            let accumulatedMessages = [];
            if (isToolAgent) {
                const toolResult = await executeToolLoop({
                    model,
                    messages,
                    tools: tools,
                    name,
                    maxIterations,
                });
                mainResult = toolResult.response;
                accumulatedMessages = toolResult.messages;
            }
            else {
                mainResult = await model.invoke(messages);
            }
            // Log the agent invocation (fire-and-forget, won't block execution)
            logAgentInvocation(name, input, messages, mainResult);
            console.log(`[${name}] Main agent completed in ${Date.now() - startTime}ms`);
            // If no subAgents, return main result wrapped in response (with messages if any)
            if (!subAgents || subAgents.length === 0) {
                return {
                    response: mainResult,
                    ...(accumulatedMessages.length > 0 ? { messages: accumulatedMessages } : {}),
                };
            }
            // Execute subAgents with the main response as their input
            // Convert mainResult to string if needed for subAgent invocation
            const responseString = typeof mainResult === 'string'
                ? mainResult
                : JSON.stringify(mainResult);
            const subAgentResults = await executeSubAgents({
                batches: subAgents,
                input: responseString,
                previousResults: { response: mainResult },
                parentName: name,
            });
            console.log(`[${name}] Total execution time: ${Date.now() - startTime}ms`);
            // Combine main result with subAgent results (and messages if any)
            return {
                response: mainResult,
                ...(accumulatedMessages.length > 0 ? { messages: accumulatedMessages } : {}),
                ...subAgentResults,
            };
        }
        catch (error) {
            console.error(`[${name}] Execution failed:`, error);
            throw error;
        }
    };
    return {
        invoke,
        name,
    };
}
