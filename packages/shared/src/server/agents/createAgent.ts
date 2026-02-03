import type { ZodSchema } from 'zod';
import { initializeModel, type InvokableModel } from './models';
import type {
  AgentDefinition,
  ModelConfig,
  ConfigurableAgent,
  InferSchemaOutput,
  AgentComposedOutput,
  SubAgentBatch,
  RetryContext,
  Message,
} from './types';
import { buildMessages } from './utils';
import { executeSubAgents } from './subAgentExecutor';
import { executeToolLoop } from './toolExecutor';
import { logAgentInvocation } from './logger';
import type { PromptServiceInstance } from '@/server/services/domain/prompts/promptService';

// Lazy-loaded prompt service instance
let _promptService: PromptServiceInstance | null = null;

async function getPromptService(): Promise<PromptServiceInstance> {
  if (!_promptService) {
    const { createServicesFromDb } = await import('@/server/services/factory');
    const { postgresDb } = await import('@/server/connections/postgres/postgres');
    const services = createServicesFromDb(postgresDb);
    _promptService = services.prompt;
  }
  return _promptService;
}

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
export async function createAgent<
  TSchema extends ZodSchema | undefined = undefined,
  TSubAgents extends SubAgentBatch[] | undefined = undefined
>(
  definition: AgentDefinition<TSchema>,
  config?: ModelConfig
): Promise<ConfigurableAgent<AgentComposedOutput<InferSchemaOutput<TSchema>, TSubAgents>>> {

  const {
    name,
    systemPrompt: providedSystemPrompt,
    userPrompt: providedUserPrompt,
    context = [],
    previousMessages = [],
    tools,
    schema,
    subAgents = [],
    validate,
    maxRetries = 1,
    loggingContext,
    callbacks,
  } = definition;

  // Fetch prompts from database if systemPrompt not provided directly
  let systemPrompt = providedSystemPrompt;
  let dbUserPrompt: string | null = null;

  if (!systemPrompt) {
    const promptService = await getPromptService();
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
  const model: InvokableModel<any> = isToolAgent
    ? initializeModel(undefined, config, { tools })
    : initializeModel(schema, config);

  /**
   * Internal invoke function that handles RetryContext for error feedback
   * On retries, previous failed outputs and errors are injected into message history
   */
  const invokeInternal = async (
    input: string,
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

      // Fire onMainComplete callback (non-blocking - don't await)
      // This enables "fire early" patterns where actions can be triggered
      // before sub-agents complete (e.g., send message immediately)
      if (callbacks?.onMainComplete) {
        try {
          const callbackResult = callbacks.onMainComplete({
            result: mainResult,
            input,
            messages: accumulatedMessages.length > 0 ? accumulatedMessages : undefined,
          });
          // If callback returns a promise, don't await it - let it run in background
          if (callbackResult instanceof Promise) {
            callbackResult.catch(err =>
              console.error(`[${name}] onMainComplete callback error:`, err)
            );
          }
        } catch (err) {
          console.error(`[${name}] onMainComplete callback error:`, err);
        }
      }

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
        onSubAgentComplete: callbacks?.onSubAgentComplete,
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
   */
  const invoke = async (
    input: string,
    retryContext?: RetryContext
  ): Promise<AgentComposedOutput<InferSchemaOutput<TSchema>, TSubAgents>> => {
    // If no validation on this agent, just invoke directly
    if (!validate) {
      return invokeInternal(input, retryContext);
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

      const result = await invokeInternal(input, currentContext);
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
