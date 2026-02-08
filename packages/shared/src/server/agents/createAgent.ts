import type { ZodSchema } from 'zod';
import { initializeModel, type InvokableModel } from './models';
import type {
  AgentDefinition,
  ConfigurableAgent,
  InferSchemaOutput,
  AgentComposedOutput,
  SubAgentBatch,
  RetryContext,
  Message,
  InvokeParams,
  ModelId,
  AgentExample,
} from './types';
import { buildMessages } from './utils';
import { executeSubAgents } from './subAgentExecutor';
import { executeToolLoop } from './toolExecutor';
import { logAgentInvocation } from './logger';

/**
 * Create a configurable agent from a resolved definition
 *
 * This factory function creates agents declaratively, supporting:
 * - Structured output via Zod schemas
 * - Optional userPrompt transformer for input strings
 * - Runtime context and previousMessages via invoke()
 * - Tool-based agents with agentic loops
 * - Composed agents with parallel/sequential subAgents
 *
 * IMPORTANT: Definitions must be resolved via agentDefinitionService.getDefinition()
 * before calling this function. The systemPrompt must be provided in the definition.
 *
 * @param definition - The agent's declarative configuration (must include systemPrompt)
 * @returns A ConfigurableAgent that can be invoked with InvokeParams or string
 *
 * @example
 * ```typescript
 * // Get resolved definition from agentDefinitionService
 * const definition = await agentDefinitionService.getDefinition(AGENTS.CHAT_GENERATE, {
 *   tools: [...],
 * });
 * const agent = createAgent(definition);
 * await agent.invoke({
 *   message: 'Hello',
 *   context: [`<Profile>${user.profile}</Profile>`],
 *   previousMessages: [...],
 * });
 *
 * // Simple string invoke (backward compatible)
 * await agent.invoke('Generate a motivational workout message');
 * ```
 */
export function createAgent<
  TSchema extends ZodSchema | undefined = undefined,
  TSubAgents extends SubAgentBatch[] | undefined = undefined
>(
  definition: AgentDefinition<TSchema>
): ConfigurableAgent<AgentComposedOutput<InferSchemaOutput<TSchema>, TSubAgents>> {

  const {
    name,
    systemPrompt,
    dbUserPrompt,
    model: definitionModel,
    maxTokens: definitionMaxTokens,
    temperature: definitionTemperature,
    maxIterations: definitionMaxIterations,
    maxRetries: definitionMaxRetries,
    userPrompt: providedUserPrompt,
    context: definitionContext = [],
    tools,
    schema,
    subAgents = [],
    validate,
    loggingContext,
    onLog,
    examples,
  } = definition;

  // Validate that systemPrompt is provided (required after Phase 2)
  if (!systemPrompt) {
    throw new Error(
      `Agent definition '${name}' missing systemPrompt. ` +
      `Use agentDefinitionService.getDefinition() to resolve the definition before calling createAgent().`
    );
  }

  // Use resolved definition values directly
  const effectiveMaxIterations = definitionMaxIterations ?? 5;
  const effectiveMaxRetries = definitionMaxRetries ?? 1;
  const effectiveConfig = {
    model: definitionModel as ModelId | undefined,
    maxTokens: definitionMaxTokens,
    temperature: definitionTemperature,
    maxIterations: effectiveMaxIterations,
  };

  // Determine if this is a tool-based agent
  const isToolAgent = tools && tools.length > 0;

  // Initialize the model appropriately
  // Tools and schema are mutually exclusive - tools take precedence
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model: InvokableModel<any> = isToolAgent
    ? initializeModel(undefined, effectiveConfig, { tools })
    : initializeModel(schema, effectiveConfig);

  /**
   * Internal invoke function that handles RetryContext for error feedback
   * On retries, previous failed outputs and errors are injected into message history
   */
  const invokeInternal = async (
    input: string,
    context: string[],
    previousMessages: Message[],
    retryContext?: RetryContext
  ): Promise<AgentComposedOutput<InferSchemaOutput<TSchema>, TSubAgents>> => {
    const startTime = Date.now();
    const attemptInfo = retryContext && retryContext.attempt > 1
      ? ` (attempt ${retryContext.attempt})`
      : '';
    console.log(`[${name}] Starting execution${attemptInfo}`);

    try {
      // Determine the final user message:
      // 1. If userPrompt function provided, use it to transform input
      // 2. Else if DB user prompt exists, prepend it to input
      // 3. Else input IS the user message directly
      let evaluatedUserPrompt: string;

      if (providedUserPrompt) {
        evaluatedUserPrompt = providedUserPrompt(input);
      } else if (dbUserPrompt) {
        // DB user prompt is a template that precedes the actual user input
        evaluatedUserPrompt = `${dbUserPrompt}\n\n${input}`;
      } else {
        evaluatedUserPrompt = input;
      }

      // Build retry feedback messages if we have previous failed attempts
      const retryMessages: Message[] = [];

      if (retryContext && retryContext.previousAttempts.length > 0) {
        for (const attempt of retryContext.previousAttempts) {
          // Add the failed output as an assistant message
          retryMessages.push({
            role: 'assistant',
            content: typeof attempt.output === 'string'
              ? attempt.output
              : JSON.stringify(attempt.output),
          });

          // Add error feedback as a user message
          const errorList = attempt.errors.map(e => `- ${e}`).join('\n');
          retryMessages.push({
            role: 'user',
            content: `The previous output failed validation:\n${errorList}\n\nPlease fix these issues.`,
          });
        }
      }

      // Build messages with context, examples, retry feedback, and previous conversation history
      // Retry messages go before previousMessages so they're part of the "context"
      const messages = buildMessages({
        systemPrompt,
        userPrompt: evaluatedUserPrompt,
        context,
        examples,
        previousMessages: [...retryMessages, ...previousMessages],
      });

      // Execute main agent
      let mainResult: InferSchemaOutput<TSchema>;
      let accumulatedMessages: string[] = [];

      if (isToolAgent) {
        const toolResult = await executeToolLoop({
          model,
          messages,
          tools: tools!,
          name,
          maxIterations: effectiveMaxIterations,
        });
        mainResult = toolResult.response as InferSchemaOutput<TSchema>;
        accumulatedMessages = toolResult.messages;
      } else {
        mainResult = await model.invoke(messages) as InferSchemaOutput<TSchema>;
      }

      // Log the agent invocation (fire-and-forget, won't block execution)
      logAgentInvocation(name, input, messages, mainResult);

      // DB logging callback (fire-and-forget)
      if (onLog) {
        try {
          onLog({
            agentId: name,
            model: effectiveConfig.model,
            input,
            messages,
            response: mainResult,
            durationMs: Date.now() - startTime,
          });
        } catch { /* silent */ }
      }

      console.log(`[${name}] Main agent completed in ${Date.now() - startTime}ms${attemptInfo}`);

      // If no subAgents, return main result wrapped in response (with messages if any)
      if (!subAgents || subAgents.length === 0) {
        return {
          response: mainResult,
          ...(accumulatedMessages.length > 0 ? { messages: accumulatedMessages } : {}),
        } as AgentComposedOutput<InferSchemaOutput<TSchema>, TSubAgents>;
      }

      // Execute subAgents with the main response as their input
      // Convert mainResult to string if needed for subAgent invocation
      const responseString = typeof mainResult === 'string'
        ? mainResult
        : JSON.stringify(mainResult);

      const subAgentResults = await executeSubAgents({
        batches: subAgents,
        input: responseString,
        parentInput: input,  // Pass the original input for transform functions that need it
        previousResults: { response: mainResult },
        parentName: name,
      });

      console.log(`[${name}] Total execution time: ${Date.now() - startTime}ms${attemptInfo}`);

      // Combine main result with subAgent results (and messages if any)
      return {
        response: mainResult,
        ...(accumulatedMessages.length > 0 ? { messages: accumulatedMessages } : {}),
        ...subAgentResults,
      } as AgentComposedOutput<InferSchemaOutput<TSchema>, TSubAgents>;

    } catch (error) {
      console.error(`[${name}] Execution failed:`, error);
      throw error;
    }
  };

  /**
   * Public invoke function - wraps invokeInternal with validation and retry logic
   * Accepts InvokeParams object or simple string for backward compatibility
   */
  const invoke = async (
    params: InvokeParams | string,
    retryContext?: RetryContext
  ): Promise<AgentComposedOutput<InferSchemaOutput<TSchema>, TSubAgents>> => {
    // Normalize params - support both InvokeParams and simple string
    const normalizedParams: InvokeParams = typeof params === 'string'
      ? { message: params }
      : params;

    const {
      message = '',
      context: invokeContext = [],
      previousMessages = [],
    } = normalizedParams;

    // Merge definition context with invoke context
    // Definition context comes first (sub-agents bake in context at creation time)
    const mergedContext = [...definitionContext, ...invokeContext];

    // If no validation on this agent, just invoke directly
    if (!validate) {
      return invokeInternal(message, mergedContext, previousMessages, retryContext);
    }

    // Run with validation + retry
    // Merge any incoming retryContext with our own tracking
    const previousAttempts: Array<{ output: unknown; errors: string[] }> = [];

    for (let attempt = 1; attempt <= effectiveMaxRetries; attempt++) {
      // Track attempt timing for logging
      const attemptStartTime = Date.now();

      // Build current retry context (merge with any parent context)
      const currentContext: RetryContext | undefined = previousAttempts.length > 0
        ? { attempt, previousAttempts }
        : retryContext;

      const result = await invokeInternal(message, mergedContext, previousMessages, currentContext);
      const validation = validate(result);

      if (validation.isValid) {
        return result;
      }

      // Calculate duration for this attempt
      const durationMs = Date.now() - attemptStartTime;
      const errors = validation.errors ?? ['Validation failed (no specific errors provided)'];

      // Validation failed - store for retry feedback
      previousAttempts.push({
        output: validation.failedOutput ?? result,
        errors,
      });

      console.log(`[${name}] Validation failed, attempt ${attempt}/${effectiveMaxRetries}`);

      // Fire-and-forget: log validation failure
      if (loggingContext?.onValidationFailure) {
        try {
          loggingContext.onValidationFailure({ attempt, errors, durationMs });
        } catch (e) {
          console.error(`[${name}] Failed to log validation failure:`, e);
        }
      }

      if (attempt === effectiveMaxRetries) {
        // Fire-and-forget: log chain failure (all retries exhausted)
        if (loggingContext?.onChainFailure) {
          try {
            loggingContext.onChainFailure({
              attempt,
              errors,
              durationMs,
              totalAttempts: effectiveMaxRetries,
            });
          } catch (e) {
            console.error(`[${name}] Failed to log chain failure:`, e);
          }
        }

        // Log final errors before throwing
        console.error(`[${name}] Validation failed after ${effectiveMaxRetries} attempts. Final errors:`,
          validation.errors);
        throw new Error(`${name} validation failed after ${effectiveMaxRetries} attempts: ${validation.errors?.join(', ') ?? 'Unknown error'}`);
      }
    }

    // TypeScript needs this even though it's unreachable
    throw new Error(`${name} execution failed unexpectedly`);
  };

  return {
    invoke,
    name,
  };
}
