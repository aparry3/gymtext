import type { HookFn } from './types';

/**
 * Registry for hook functions
 *
 * Hooks are registered by name and looked up at runtime by the AgentRunner
 * when executing pre/post hooks defined in DB config.
 */
export class HookRegistry {
  private hooks = new Map<string, HookFn>();

  register(name: string, fn: HookFn): void {
    if (this.hooks.has(name)) {
      console.warn(`[HookRegistry] Overwriting existing hook: ${name}`);
    }
    this.hooks.set(name, fn);
  }

  get(name: string): HookFn | undefined {
    return this.hooks.get(name);
  }

  has(name: string): boolean {
    return this.hooks.has(name);
  }
}
