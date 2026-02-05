/**
 * Agent Registry
 *
 * Central registry for declarative agent configurations.
 *
 * Agent configs define WHAT an agent does (prompts, model, tools, sub-agents)
 * without containing any code. This enables:
 * - Agent definitions stored in config files or database
 * - Agent composition via name references (no import cycles)
 * - Runtime agent creation from config + registries
 * - Visibility into all agents and their relationships
 *
 * The registry works with ToolRegistry and CallbackRegistry:
 * - Tools are referenced by name (resolved from ToolRegistry at runtime)
 * - Sub-agents are referenced by name (resolved from this registry)
 * - Callbacks are referenced by name (resolved from CallbackRegistry)
 *
 * @example
 * ```typescript
 * // Registration (declarative config, no code)
 * agentRegistry.register({
 *   name: 'chat:generate',
 *   model: 'gpt-5-nano',
 *   tools: ['update_profile', 'get_workout', 'make_modification'],
 *   contextTypes: ['DATE_CONTEXT', 'CURRENT_WORKOUT'],
 *   callbacks: [
 *     { name: 'enforce_sms_length', when: 'on_success' },
 *   ],
 * });
 *
 * // Resolution (at runtime)
 * const config = agentRegistry.get('chat:generate');
 * const tools = toolRegistry.createTools(config.tools, context);
 * const agent = await createAgent({ name: config.name, tools, ... });
 * ```
 */
import type { ModelId } from '../types';
import type { CallbackConfig } from './callbackRegistry';

/**
 * Sub-agent reference in a declarative agent config.
 * References another agent by name instead of holding a code reference.
 */
export interface SubAgentRef {
  /** Key in the composed output */
  key: string;
  /** Name of the registered agent to use as sub-agent */
  agentName: string;
  /**
   * Name of a registered transform function.
   * Transforms are registered separately to keep configs serializable.
   */
  transformName?: string;
  /**
   * Name of a registered condition function.
   * Conditions are registered separately to keep configs serializable.
   */
  conditionName?: string;
}

/**
 * A batch of sub-agents that run in parallel.
 * Multiple batches run sequentially.
 */
export type SubAgentBatchRef = SubAgentRef[];

/**
 * Declarative agent configuration.
 *
 * This is a pure data structure - no functions, no imports.
 * Everything is referenced by name and resolved at runtime.
 */
export interface AgentConfig {
  /** Agent name (also used for prompt lookup in DB) */
  name: string;
  /** Model to use (defaults to system default if not specified) */
  model?: ModelId;
  /** Max tokens for model response */
  maxTokens?: number;
  /** Temperature for model */
  temperature?: number;
  /** Max iterations for tool loops */
  maxIterations?: number;
  /** Tool names from ToolRegistry */
  tools?: string[];
  /** Context types to fetch via ContextService */
  contextTypes?: string[];
  /**
   * Sub-agent batches (sequential batches, parallel within).
   * Each sub-agent is referenced by name from this registry.
   */
  subAgents?: SubAgentBatchRef[];
  /** Validator name (registered in ValidatorRegistry) */
  validatorName?: string;
  /** Max retry attempts if validation fails */
  maxRetries?: number;
  /**
   * Deterministic callbacks that run after agent completion.
   * Unlike tools, these always run (not LLM-decided).
   */
  callbacks?: CallbackConfig[];
  /** Optional static system prompt override (bypasses DB lookup) */
  systemPrompt?: string;
}

/**
 * Transform function: converts parent result to sub-agent input.
 */
export type TransformFn = (mainResult: unknown, parentInput?: string) => string;

/**
 * Condition function: determines if sub-agent should run.
 */
export type ConditionFn = (mainResult: unknown) => boolean;

/**
 * Validator function: validates agent output.
 */
export interface ValidatorDefinition {
  name: string;
  validate: (result: unknown) => { isValid: boolean; errors?: string[]; failedOutput?: unknown };
}

/**
 * Central agent registry.
 */
class AgentRegistryImpl {
  private agents = new Map<string, AgentConfig>();
  private transforms = new Map<string, TransformFn>();
  private conditions = new Map<string, ConditionFn>();
  private validators = new Map<string, ValidatorDefinition>();

  // =========================================================================
  // Agent Config Registration
  // =========================================================================

  /**
   * Register an agent configuration.
   */
  register(config: AgentConfig): void {
    if (this.agents.has(config.name)) {
      throw new Error(`Agent "${config.name}" is already registered`);
    }
    this.agents.set(config.name, config);
  }

  /**
   * Replace an existing agent configuration.
   */
  replace(config: AgentConfig): void {
    this.agents.set(config.name, config);
  }

  /**
   * Get an agent configuration by name.
   */
  get(name: string): AgentConfig | undefined {
    return this.agents.get(name);
  }

  /**
   * Check if an agent is registered.
   */
  has(name: string): boolean {
    return this.agents.has(name);
  }

  /**
   * List all registered agent names.
   */
  listAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  // =========================================================================
  // Transform Registration
  // =========================================================================

  /**
   * Register a named transform function.
   * Transforms convert a parent agent's output to a sub-agent's input.
   */
  registerTransform(name: string, fn: TransformFn): void {
    this.transforms.set(name, fn);
  }

  /**
   * Get a transform function by name.
   */
  getTransform(name: string): TransformFn | undefined {
    return this.transforms.get(name);
  }

  // =========================================================================
  // Condition Registration
  // =========================================================================

  /**
   * Register a named condition function.
   * Conditions determine whether a sub-agent should run.
   */
  registerCondition(name: string, fn: ConditionFn): void {
    this.conditions.set(name, fn);
  }

  /**
   * Get a condition function by name.
   */
  getCondition(name: string): ConditionFn | undefined {
    return this.conditions.get(name);
  }

  // =========================================================================
  // Validator Registration
  // =========================================================================

  /**
   * Register a named validator.
   * Validators check agent output and provide error feedback for retries.
   */
  registerValidator(definition: ValidatorDefinition): void {
    this.validators.set(definition.name, definition);
  }

  /**
   * Get a validator by name.
   */
  getValidator(name: string): ValidatorDefinition | undefined {
    return this.validators.get(name);
  }

  // =========================================================================
  // Utilities
  // =========================================================================

  /**
   * Clear all registrations (primarily for testing).
   */
  clear(): void {
    this.agents.clear();
    this.transforms.clear();
    this.conditions.clear();
    this.validators.clear();
  }

  /**
   * Get a dependency graph showing which agents reference which tools/sub-agents.
   * Useful for debugging and visualization.
   */
  getDependencyGraph(): Record<string, { tools: string[]; subAgents: string[]; callbacks: string[] }> {
    const graph: Record<string, { tools: string[]; subAgents: string[]; callbacks: string[] }> = {};

    for (const [name, config] of this.agents) {
      graph[name] = {
        tools: config.tools ?? [],
        subAgents: (config.subAgents ?? []).flatMap(batch => batch.map(ref => ref.agentName)),
        callbacks: (config.callbacks ?? []).map(cb => cb.name),
      };
    }

    return graph;
  }
}

/**
 * Singleton agent registry instance.
 */
export const agentRegistry = new AgentRegistryImpl();
