import type { ZodSchema } from 'zod';
import { initializeModel, type InvokableModel } from './models';
import type {
  AgentConfig,
  AgentDefinition,
  ModelConfig,
  ConfigurableAgent,
  InferSchemaOutput,
  AgentComposedOutput,
  SubAgentBatch,
  RetryContext,
  Message,
  ModelId,
  InvokeParams,
} from './types';
import { buildMessages } from './utils';
import { executeSubAgents } from './subAgentExecutor';
import { executeToolLoop } from './toolExecutor';
import { logAgentInvocation } from './logger';

/**
 * Default model configuration values
 */
const DEFAULT_MODEL: ModelId = 'gpt-5-nano';
const DEFAULT_TEMPERATURE = 1;
const DEFAULT_MAX_TOKENS = 16000;
const DEFAULT_MAX_ITERATIONS = 5;

/**
 * Check if the argument is a legacy AgentDefinition (has context/previousMessages/dbUserPrompt)
 * vs the new AgentConfig
 */
function isLegacyDefinition(arg: unknown): boolean {
  if (!arg || typeof arg !== 'object') return false;
  const obj = arg as Record<string, unknown>;
  // Legacy definition has these fields at the definition level, not in invoke
  return 'context' in obj || 'previousMessages' in obj || 'dbUserPrompt' in obj;
}

/**
 * Convert legacy AgentDefinition + ModelConfig to unified AgentConfig
 */
function convertLegacyConfig<TSchema extends ZodSchema | undefined>(
  definition: AgentDefinition<TSchema>,
  modelConfig?: ModelConfig
): AgentConfig<TSchema> {
  return {
    name: definition.name,
    systemPrompt: definition.systemPrompt,
    // Convert dbUserPrompt to userPrompt, or use userPrompt transformer
    userPrompt: definition.userPrompt ?? definition.dbUserPrompt ?? undefined,
    // Model config
    model: modelConfig?.model,
    temperature: modelConfig?.temperature,
    maxTokens: modelConfig?.maxTokens,
    maxIterations: modelConfig?.maxIterations,
    // Static capabilities
    tools: definition.tools,
    schema: definition.schema,
    subAgents: definition.subAgents,
    // Behavior
    validate: definition.validate,
    maxRetries: definition.maxRetries,
    loggingContext: definition.loggingContext,
  };
}

/**
 * Create a configurable agent from a unified config
 *
 * This factory function creates agents declaratively, supporting:
 * - Structured output via Zod schemas
 * - Optional userPrompt (string or transformer function)
 * - Tool-based agents with agentic loops
 * - Composed agents with parallel/sequential subAgents
 *
 * IMPORTANT: This is a pure function. Config fetching should be done at the
 * service layer using agentDefinitionService.getDefinition() before calling createAgent.
 *
 * Also supports legacy two-argument signature for backward compatibility:
 * `createAgent(definition, modelConfig)` - deprecated, use unified config instead
 *
 * @param configOrDefinition - The unified agent configuration or legacy AgentDefinition
 * @param legacyModelConfig - Legacy ModelConfig (only when using old two-arg signature)
 * @returns A Promise resolving to a ConfigurableAgent that can be invoked with InvokeParams or string
 *
 * @example
 * ```typescript
 * // NEW PATTERN: Fetch definition at service layer first
 * const definition = await agentDefinitionService.getDefinition(AGENTS.WORKOUT_MESSAGE);
 *
 * // Create agent with unified config
 * const messageAgent = await createAgent({
 *   ...definition,
 *   tools,
 *   schema: MessageSchema,
 * });
 *
 * // Invoke with runtime context
 * await messageAgent.invoke({
 *   message: 'Generate a motivational workout message',
 *   context: [`<Profile>${user.profile}</Profile>`],
 * });
 *
 * // LEGACY PATTERN (deprecated): Two-argument signature still works
 * const agent = await createAgent({
 *   name: 'my-agent',
 *   systemPrompt: '...',
 *   context: [...],  // context at definition level
 * }, modelConfig);
 * await agent.invoke('message');  // string input
 * ```
 */
export async function createAgent<
  TSchema extends ZodSchema | undefined = undefined,
  TSubAgents extends SubAgentBatch[] | undefined = undefined
>(
  configOrDefinition: AgentConfig<TSchema> | AgentDefinition<TSchema>,
  legacyModelConfig?: ModelConfig
): Promise<ConfigurableAgent<AgentComposedOutput<InferSchemaOutput<TSchema>, TSubAgents>>> {
  // Support legacy two-argument signature
  let config: AgentConfig<TSchema>;
  let legacyContext: string[] = [];
  let legacyPreviousMessages: Message[] = [];

  if (isLegacyDefinition(configOrDefinition) || legacyModelConfig !== undefined) {
    // Legacy pattern: createAgent(definition, modelConfig)
    const definition = configOrDefinition as AgentDefinition<TSchema>;
    config = convertLegacyConfig(definition, legacyModelConfig);
    // Capture legacy context/previousMessages for use in invoke
    legacyContext = definition.context ?? [];
    legacyPreviousMessages = definition.previousMessages ?? [];
  } else {
    // New pattern: createAgent(config)
    config = configOrDefinition as AgentConfig<TSchema>;
  }

  const {
    name,
    systemPrompt,
    userPrompt,
    model: modelId = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    maxTokens = DEFAULT_MAX_TOKENS,
    maxIterations = DEFAULT_MAX_ITERATIONS,
    tools,
    schema,
    subAgents = [],
    validate,
    maxRetries = 1,
    loggingContext,
  } = config;

  // Require systemPrompt - no more DB fallback in createAgent
  if (!systemPrompt) {
    throw new Error(
      `systemPrompt is required for agent '${name}'. ` +
      `Use agentDefinitionService.getDefinition() at the service layer to fetch prompts from the database.`
    );
  }

  // Resolve model configuration
  const resolvedConfig = {
    model: modelId,
    temperature,
    maxTokens,
    maxIterations,
  };

  // Determine if this is a tool-based agent
  const isToolAgent = tools && tools.length > 0;

  // Initialize the model appropriately using resolved config
  // Tools and schema are mutually exclusive - tools take precedence
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model: InvokableModel<any> = isToolAgent
    ? initializeModel(undefined, resolvedConfig, { tools })
    : initializeModel(schema, resolvedConfig);

  /**
   * Internal invoke function that handles RetryContext for error feedback
   * On retries, previous failed outputs and errors are injected into message history
   */
  const invokeInternal = async (
    params: InvokeParams,
    retryContext?: RetryContext
  ): Promise<AgentComposedOutput<InferSchemaOutput<TSchema>, TSubAgents>> => {
    const { message: input, context = [], previousMessages = [] } = params;
    const startTime = Date.now();
    const attemptInfo = retryContext && retryContext.attempt > 1
      ? ` (attempt ${retryContext.attempt})`
      : '';
    console.log(`[${name}] Starting execution${attemptInfo}`);

    try {
      // Determine the final user message:
      // 1. If userPrompt is a function, use it to transform input
      // 2. Else if userPrompt is a string, prepend it to input
      // 3. Else input IS the user message directly
      let evaluatedUserPrompt: string;

      if (typeof userPrompt === 'function') {
        evaluatedUserPrompt = userPrompt(input);
      } else if (typeof userPrompt === 'string') {
        // DB user prompt is a template that precedes the actual user input
        evaluatedUserPrompt = `${userPrompt}\n\n${input}`;
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

      // Build messages with context, retry feedback, and previous conversation history
      // Retry messages go before previousMessages so they're part of the "context"
      const messages = buildMessages({
        systemPrompt,
        userPrompt: evaluatedUserPrompt,
        context,
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
          maxIterations,
        });
        mainResult = toolResult.response as InferSchemaOutput<TSchema>;
        accumulatedMessages = toolResult.messages;
      } else {
        mainResult = await model.invoke(messages) as InferSchemaOutput<TSchema>;
      }

      // Log the agent invocation (fire-and-forget, won't block execution)
      logAgentInvocation(name, input, messages, mainResult);

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
   * If validate is defined, runs retry loop with error feedback on failures
   *
   * Supports both new InvokeParams and legacy string input for backward compatibility
   */
  const invoke = async (
    paramsOrMessage: InvokeParams | string,
    retryContext?: RetryContext
  ): Promise<AgentComposedOutput<InferSchemaOutput<TSchema>, TSubAgents>> => {
    // Normalize input: support both InvokeParams and legacy string
    let params: InvokeParams;
    if (typeof paramsOrMessage === 'string') {
      // Legacy string input - use context/previousMessages from definition if available
      params = {
        message: paramsOrMessage,
        context: legacyContext.length > 0 ? legacyContext : undefined,
        previousMessages: legacyPreviousMessages.length > 0 ? legacyPreviousMessages : undefined,
      };
    } else {
      // New InvokeParams - merge with legacy context if not provided
      params = {
        ...paramsOrMessage,
        context: paramsOrMessage.context ?? (legacyContext.length > 0 ? legacyContext : undefined),
        previousMessages: paramsOrMessage.previousMessages ?? (legacyPreviousMessages.length > 0 ? legacyPreviousMessages : undefined),
      };
    }

    // If no validation on this agent, just invoke directly
    if (!validate) {
      return invokeInternal(params, retryContext);
    }

    // Run with validation + retry
    // Merge any incoming retryContext with our own tracking
    const previousAttempts: Array<{ output: unknown; errors: string[] }> = [];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Track attempt timing for logging
      const attemptStartTime = Date.now();

      // Build current retry context (merge with any parent context)
      const currentContext: RetryContext | undefined = previousAttempts.length > 0
        ? { attempt, previousAttempts }
        : retryContext;

      const result = await invokeInternal(params, currentContext);
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

      console.log(`[${name}] Validation failed, attempt ${attempt}/${maxRetries}`);

      // Fire-and-forget: log validation failure
      if (loggingContext?.onValidationFailure) {
        try {
          loggingContext.onValidationFailure({ attempt, errors, durationMs });
        } catch (e) {
          console.error(`[${name}] Failed to log validation failure:`, e);
        }
      }

      if (attempt === maxRetries) {
        // Fire-and-forget: log chain failure (all retries exhausted)
        if (loggingContext?.onChainFailure) {
          try {
            loggingContext.onChainFailure({
              attempt,
              errors,
              durationMs,
              totalAttempts: maxRetries,
            });
          } catch (e) {
            console.error(`[${name}] Failed to log chain failure:`, e);
          }
        }

        // Log final errors before throwing
        console.error(`[${name}] Validation failed after ${maxRetries} attempts. Final errors:`,
          validation.errors);
        throw new Error(`${name} validation failed after ${maxRetries} attempts: ${validation.errors?.join(', ') ?? 'Unknown error'}`);
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
