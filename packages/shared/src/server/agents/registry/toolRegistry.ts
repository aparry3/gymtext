/**
 * Tool Registry
 *
 * Central registry for tool definitions and implementations.
 * Tools are registered by name and can be resolved at runtime by agents.
 *
 * This separates tool DEFINITIONS (schema, description, priority) from
 * tool IMPLEMENTATIONS (the actual side-effect-producing code), allowing:
 * - Agent configs to reference tools by name instead of importing code
 * - Tool implementations to be swapped (testing, environment switching)
 * - Tool priority to be defined per-tool rather than hardcoded in the executor
 * - Central visibility into all available tools
 *
 * @example
 * ```typescript
 * // Registration (at service initialization)
 * toolRegistry.register({
 *   name: 'update_profile',
 *   description: 'Record permanent user preferences...',
 *   schema: z.object({}),
 *   priority: 1,
 *   toolType: 'action',
 *   execute: async (args, context) => {
 *     return profileService.updateProfile(context.userId, context.message);
 *   },
 * });
 *
 * // Resolution (at agent creation time)
 * const tools = toolRegistry.createTools(
 *   ['update_profile', 'get_workout'],
 *   { userId, message, timezone }
 * );
 * ```
 */
import { z, type ZodSchema } from 'zod';
import { tool, type StructuredToolInterface } from '@langchain/core/tools';
import type { ToolExecutionResult } from '../types';

/**
 * Context passed to tool implementations at execution time.
 * Services populate this when creating tools for a specific request.
 */
export interface ToolContext {
  userId: string;
  message: string;
  previousMessages?: unknown[];
  timezone: string;
  /** Callback for tools that need to send messages immediately */
  onSendMessage?: (message: string) => Promise<void>;
  /** Additional context that specific tools may need */
  [key: string]: unknown;
}

/**
 * A registered tool definition with its implementation.
 *
 * The `execute` function receives the LLM's args and the runtime context,
 * and returns a ToolExecutionResult. Side effects happen inside execute.
 */
export interface ToolDefinition<TArgs = Record<string, unknown>> {
  /** Unique tool name (used as identifier in agent configs and LLM tool calls) */
  name: string;
  /** Description shown to the LLM for tool selection */
  description: string;
  /** Zod schema for the tool's parameters (what the LLM provides) */
  schema: ZodSchema;
  /** Execution priority (lower = runs first when multiple tools called simultaneously) */
  priority: number;
  /** Whether this is a query or action tool (affects continuation messaging) */
  toolType: 'query' | 'action';
  /**
   * Whether this tool sends an immediate message before executing.
   * When true, the tool schema will include a `message` parameter and
   * onSendMessage will be called before execute.
   */
  immediateMessage?: boolean;
  /** The tool implementation. Receives LLM args + runtime context. */
  execute: (args: TArgs, context: ToolContext) => Promise<ToolExecutionResult>;
}

/**
 * Central tool registry.
 *
 * Tools are registered once at initialization and resolved by name
 * when agents need them. The registry handles:
 * - Name-based lookup
 * - Priority ordering
 * - Converting definitions to LangChain StructuredToolInterface
 * - Binding runtime context to tool implementations
 */
class ToolRegistryImpl {
  private tools = new Map<string, ToolDefinition>();

  /**
   * Register a tool definition.
   * Throws if a tool with the same name is already registered.
   */
  register<TArgs = Record<string, unknown>>(definition: ToolDefinition<TArgs>): void {
    if (this.tools.has(definition.name)) {
      throw new Error(`Tool "${definition.name}" is already registered`);
    }
    this.tools.set(definition.name, definition as ToolDefinition);
  }

  /**
   * Replace an existing tool registration (useful for testing or overrides).
   */
  replace<TArgs = Record<string, unknown>>(definition: ToolDefinition<TArgs>): void {
    this.tools.set(definition.name, definition as ToolDefinition);
  }

  /**
   * Check if a tool is registered.
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get a tool definition by name.
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Get the priority for a tool (used by toolExecutor).
   * Returns 99 for unregistered tools (lowest priority).
   */
  getPriority(name: string): number {
    return this.tools.get(name)?.priority ?? 99;
  }

  /**
   * Create LangChain StructuredToolInterface instances for the given tool names,
   * binding them to the provided runtime context.
   *
   * @param names - Tool names to resolve
   * @param context - Runtime context (userId, message, etc.) bound to each tool
   * @returns Array of LangChain tools, sorted by priority
   */
  createTools(names: string[], context: ToolContext): StructuredToolInterface[] {
    const resolved: Array<{ definition: ToolDefinition; tool: StructuredToolInterface }> = [];

    for (const name of names) {
      const definition = this.tools.get(name);
      if (!definition) {
        throw new Error(`Tool "${name}" is not registered. Available tools: ${Array.from(this.tools.keys()).join(', ')}`);
      }

      const langchainTool = this.toLangChainTool(definition, context);
      resolved.push({ definition, tool: langchainTool });
    }

    // Sort by priority (lower = first)
    resolved.sort((a, b) => a.definition.priority - b.definition.priority);

    return resolved.map(r => r.tool);
  }

  /**
   * List all registered tool names.
   */
  listTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Clear all registrations (primarily for testing).
   */
  clear(): void {
    this.tools.clear();
  }

  /**
   * Convert a ToolDefinition to a LangChain StructuredToolInterface,
   * binding the runtime context to the execute function.
   */
  private toLangChainTool(
    definition: ToolDefinition,
    context: ToolContext
  ): StructuredToolInterface {
    if (definition.immediateMessage) {
      // Tool that sends an immediate message before executing
      const wrappedSchema = z.object({
        message: z.string().describe(
          'REQUIRED. Brief acknowledgment to send immediately (1 sentence).'
        ),
      });

      return tool(
        async (args: { message: string }): Promise<ToolExecutionResult> => {
          // Send immediate message before execution
          if (args.message && context.onSendMessage) {
            try {
              await context.onSendMessage(args.message);
            } catch (error) {
              console.error(`[ToolRegistry] Failed to send immediate message for ${definition.name}:`, error);
            }
          }
          return definition.execute({}, context);
        },
        {
          name: definition.name,
          description: definition.description,
          schema: wrappedSchema,
        }
      );
    }

    // Standard tool - pass LLM args + context to execute
    return tool(
      async (args: Record<string, unknown>): Promise<ToolExecutionResult> => {
        return definition.execute(args, context);
      },
      {
        name: definition.name,
        description: definition.description,
        schema: definition.schema,
      }
    );
  }
}

/**
 * Singleton tool registry instance.
 * Tools are registered at module load / service initialization time.
 */
export const toolRegistry = new ToolRegistryImpl();
