import { z } from 'zod';
import { tool, type StructuredToolInterface } from '@langchain/core/tools';
import type { ToolDefinition, ToolExecutionContext } from './types';
import type { HookRegistry } from '../hooks/hookRegistry';
import type { HookableConfig } from '../hooks/types';
import { normalizeHookConfig, resolveDotPath } from '../hooks/resolver';

export interface ToolMetadata {
  name: string;
  description: string;
  priority?: number;
}

/**
 * Registry for tool definitions
 *
 * Tools are registered once at startup. At invocation time, resolve() builds
 * LangChain StructuredToolInterface instances with context + hook wrapping.
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
   * - Hook execution (pre/post hooks from toolHooks config)
   * - Priority metadata on the resulting tool
   *
   * @param toolIds - Array of tool names to resolve
   * @param ctx - Execution context (user, message, services, extras)
   * @param hookRegistry - Optional hook registry for resolving hook functions
   * @param toolHooks - Optional per-tool hook configs from agent DB config
   * @returns Array of LangChain tools sorted by priority
   */
  resolve(
    toolIds: string[],
    ctx: ToolExecutionContext,
    hookRegistry?: HookRegistry,
    toolHooks?: Record<string, HookableConfig>
  ): StructuredToolInterface[] {
    const resolved: StructuredToolInterface[] = [];

    for (const toolId of toolIds) {
      const def = this.tools.get(toolId);
      if (!def) {
        console.warn(`[ToolRegistry] Tool not found: ${toolId}`);
        continue;
      }

      const hookConfig = toolHooks?.[toolId];

      // Build the LangChain tool with context injection and hook wrapping
      const langchainTool = tool(
        async (args: Record<string, unknown>) => {
          // Execute preHook if configured
          if (hookConfig?.preHook && hookRegistry) {
            const config = normalizeHookConfig(hookConfig.preHook);
            const hookFn = hookRegistry.get(config.hook);
            if (hookFn) {
              const value = config.source
                ? resolveDotPath({ args, ctx }, config.source)
                : undefined;
              try {
                await hookFn(ctx.user, value);
              } catch (err) {
                console.error(`[ToolRegistry] preHook ${config.hook} failed:`, err);
              }
            }
          }

          // Execute the tool
          const result = await def.execute(ctx, args);

          // Execute postHook if configured
          if (hookConfig?.postHook && hookRegistry) {
            const config = normalizeHookConfig(hookConfig.postHook);
            const hookFn = hookRegistry.get(config.hook);
            if (hookFn) {
              const value = config.source
                ? resolveDotPath({ args, result }, config.source)
                : result;
              try {
                await hookFn(ctx.user, value);
              } catch (err) {
                console.error(`[ToolRegistry] postHook ${config.hook} failed:`, err);
              }
            }
          }

          return result;
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
