import type { UserWithProfile } from '@/server/models/user';

/**
 * Hook function - atomic side-effect executed before/after tool or agent execution
 */
export type HookFn = (user: UserWithProfile, value: unknown) => Promise<void>;

/**
 * Declarative hook configuration stored in DB
 */
export interface HookConfig {
  /** Name of the registered hook function */
  hook: string;
  /** Dot-path source for the value (e.g., 'args.message', 'result.overview') */
  source?: string;
}

/**
 * Hook config can be a full object or shorthand string (hook name only)
 * Shorthand: 'sendMessage' -> { hook: 'sendMessage' }
 */
export type HookConfigOrString = HookConfig | string;

/**
 * Configuration for pre/post hooks on tools or agents
 */
export interface HookableConfig {
  preHook?: HookConfigOrString;
  postHook?: HookConfigOrString;
}
