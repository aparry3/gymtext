import { z } from 'zod';
import { tool, type StructuredToolInterface } from '@langchain/core/tools';
import type { ToolDefinition, ToolExecutionContext } from './types';

export interface ToolMetadata {
  name: string;
  description: string;
  priority?: number;
}

/**
 * Registry for tool definitions
 *
 * Tools are registered once at startup. At invocation time, resolve() builds
 * LangChain StructuredToolInterface instances with context injection.
 */
export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  register(def: ToolDefinition): void {
    if (this.tools.has(def.name)) {
      console.warn(`[ToolRegistry] Overwriting existing tool: ${def.name}`);
    }
    this.tools.set(def.name, def);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  list(): ToolMetadata[] {
    return [...this.tools.values()].map((def) => ({
      name: def.name,
      description: def.description,
      priority: def.priority,
    }));
  }

  /**
   * Resolve tool IDs into LangChain StructuredToolInterface instances
   *
   * Wraps each tool's execute function with:
   * - Context injection (user, message, services, extras)
   * - Priority metadata on the resulting tool
   *
   * @param toolIds - Array of tool names to resolve
   * @param ctx - Execution context (user, message, services, extras)
   * @returns Array of LangChain tools sorted by priority
   */
  resolve(
    toolIds: string[],
    ctx: ToolExecutionContext
  ): StructuredToolInterface[] {
    const resolved: StructuredToolInterface[] = [];

    for (const toolId of toolIds) {
      const def = this.tools.get(toolId);
      if (!def) {
        console.warn(`[ToolRegistry] Tool not found: ${toolId}`);
        continue;
      }

      const langchainTool = tool(
        async (args: Record<string, unknown>) => {
          return await def.execute(ctx, args);
        },
        {
          name: def.name,
          description: def.description,
          schema: def.schema as z.ZodObject<Record<string, z.ZodTypeAny>>,
          metadata: { priority: def.priority ?? 99 },
        }
      );

      resolved.push(langchainTool);
    }

    // Sort by priority (lower = first)
    resolved.sort((a, b) => {
      const aPri = (a as unknown as { metadata?: { priority?: number } }).metadata?.priority ?? 99;
      const bPri = (b as unknown as { metadata?: { priority?: number } }).metadata?.priority ?? 99;
      return aPri - bPri;
    });

    return resolved;
  }
}
