/**
 * Callback Registry
 *
 * Central registry for deterministic post-agent callbacks.
 *
 * Callbacks are side-effect functions that run AFTER an agent completes.
 * Unlike tools (which the LLM decides to call), callbacks are deterministic:
 * they always run when configured on an agent/pipeline.
 *
 * Use cases:
 * - Send SMS messages after agent generates response
 * - Save results to database after agent produces structured output
 * - Trigger downstream workflows (Inngest events, webhooks)
 * - Log/audit agent results
 *
 * @example
 * ```typescript
 * // Registration
 * callbackRegistry.register({
 *   name: 'send_sms_messages',
 *   execute: async (result, context) => {
 *     const messages = [result.response, ...(result.messages || [])];
 *     for (const msg of messages) {
 *       await messagingOrchestrator.sendImmediate(context.user, msg);
 *     }
 *   },
 * });
 *
 * // Usage in agent config
 * const agentConfig = {
 *   name: 'chat:generate',
 *   callbacks: [
 *     { name: 'send_sms_messages', when: 'on_success' },
 *   ],
 * };
 * ```
 */

/**
 * Context passed to callbacks at execution time.
 * Contains the agent result and any additional context from the caller.
 */
export interface CallbackContext {
  /** The full agent result (response + any sub-agent results) */
  agentResult: unknown;
  /** Additional context passed through from the pipeline */
  [key: string]: unknown;
}

/**
 * When a callback should execute relative to the agent.
 */
export type CallbackTiming = 'on_success' | 'on_failure' | 'always';

/**
 * A callback configuration as used in agent/pipeline definitions.
 * References a registered callback by name.
 */
export interface CallbackConfig {
  /** Name of the registered callback */
  name: string;
  /** When to execute: on_success (default), on_failure, or always */
  when?: CallbackTiming;
}

/**
 * A registered callback definition.
 */
export interface CallbackDefinition {
  /** Unique callback name */
  name: string;
  /** Description of what this callback does */
  description?: string;
  /**
   * The callback implementation.
   * Receives the agent result and runtime context.
   * Can return void (fire-and-forget) or a value (for chaining).
   */
  execute: (context: CallbackContext) => Promise<void>;
}

/**
 * Central callback registry.
 */
class CallbackRegistryImpl {
  private callbacks = new Map<string, CallbackDefinition>();

  /**
   * Register a callback definition.
   */
  register(definition: CallbackDefinition): void {
    if (this.callbacks.has(definition.name)) {
      throw new Error(`Callback "${definition.name}" is already registered`);
    }
    this.callbacks.set(definition.name, definition);
  }

  /**
   * Replace an existing callback registration.
   */
  replace(definition: CallbackDefinition): void {
    this.callbacks.set(definition.name, definition);
  }

  /**
   * Get a callback by name.
   */
  get(name: string): CallbackDefinition | undefined {
    return this.callbacks.get(name);
  }

  /**
   * Check if a callback is registered.
   */
  has(name: string): boolean {
    return this.callbacks.has(name);
  }

  /**
   * Execute callbacks for a given set of configs.
   *
   * @param configs - Callback configs (from agent/pipeline definition)
   * @param context - Runtime context with agent result
   * @param succeeded - Whether the agent succeeded (for timing filters)
   */
  async executeCallbacks(
    configs: CallbackConfig[],
    context: CallbackContext,
    succeeded: boolean
  ): Promise<void> {
    for (const config of configs) {
      const timing = config.when ?? 'on_success';

      // Filter by timing
      if (timing === 'on_success' && !succeeded) continue;
      if (timing === 'on_failure' && succeeded) continue;
      // 'always' runs regardless

      const definition = this.callbacks.get(config.name);
      if (!definition) {
        console.error(`[CallbackRegistry] Callback "${config.name}" not registered, skipping`);
        continue;
      }

      try {
        await definition.execute(context);
      } catch (error) {
        console.error(`[CallbackRegistry] Callback "${config.name}" failed:`, error);
        // Callbacks are deterministic but non-blocking - log and continue
      }
    }
  }

  /**
   * List all registered callback names.
   */
  listCallbacks(): string[] {
    return Array.from(this.callbacks.keys());
  }

  /**
   * Clear all registrations (primarily for testing).
   */
  clear(): void {
    this.callbacks.clear();
  }
}

/**
 * Singleton callback registry instance.
 */
export const callbackRegistry = new CallbackRegistryImpl();
