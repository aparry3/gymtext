import type { HookConfig, HookConfigOrString } from './types';

/**
 * Normalize a hook config shorthand to full HookConfig object
 *
 * @example
 * normalizeHookConfig('sendMessage') -> { hook: 'sendMessage' }
 * normalizeHookConfig({ hook: 'sendMessage', source: 'args.message' }) -> { hook: 'sendMessage', source: 'args.message' }
 */
export function normalizeHookConfig(config: HookConfigOrString): HookConfig {
  if (typeof config === 'string') {
    return { hook: config };
  }
  return config;
}

/**
 * Resolve a dot-path reference against an object
 *
 * @example
 * resolveDotPath({ args: { message: 'hello' } }, 'args.message') -> 'hello'
 * resolveDotPath({ result: { overview: 'text' } }, 'result.overview') -> 'text'
 */
export function resolveDotPath(obj: unknown, path: string): unknown {
  const segments = path.split('.');
  let value: unknown = obj;

  for (const segment of segments) {
    if (value == null) return undefined;
    value = (value as Record<string, unknown>)[segment];
  }

  return value;
}
