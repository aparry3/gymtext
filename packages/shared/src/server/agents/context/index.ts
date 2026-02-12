/**
 * Context Registry System
 *
 * Provider-based context resolution for AI agents.
 * Each context type is a registered provider that declares its params
 * and resolves context strings.
 *
 * @example
 * ```typescript
 * import { ContextRegistry, registerAllContextProviders } from '@/server/agents/context';
 *
 * const registry = new ContextRegistry();
 * registerAllContextProviders(registry, deps);
 *
 * const context = await registry.resolve(
 *   ['user', 'userProfile', 'fitnessPlan'],
 *   { user, planText: 'override text' }
 * );
 * ```
 */

export { ContextRegistry } from './contextRegistry';
export type { ContextProviderMetadata } from './contextRegistry';
export type { ContextProvider } from './types';
export { registerAllContextProviders, type ContextRegistryDeps } from './definitions';
