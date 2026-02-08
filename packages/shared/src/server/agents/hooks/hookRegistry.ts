import type { HookFn } from './types';

export interface HookMetadata {
  name: string;
  description: string;
}

/**
 * Registry for hook functions
 *
 * Hooks are registered by name and looked up at runtime by the AgentRunner
 * when executing pre/post hooks defined in DB config.
 */
export class HookRegistry {
  private hooks = new Map<string, HookFn>();
  private descriptions = new Map<string, string>();

  register(name: string, fn: HookFn, description?: string): void {
    if (this.hooks.has(name)) {
      console.warn(`[HookRegistry] Overwriting existing hook: ${name}`);
    }
    this.hooks.set(name, fn);
    if (description) {
      this.descriptions.set(name, description);
    }
  }

  get(name: string): HookFn | undefined {
    return this.hooks.get(name);
  }

  has(name: string): boolean {
    return this.hooks.has(name);
  }

  list(): HookMetadata[] {
    return [...this.hooks.keys()].map((name) => ({
      name,
      description: this.descriptions.get(name) || '',
    }));
  }
}
