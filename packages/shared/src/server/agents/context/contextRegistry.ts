/**
 * ContextRegistry
 *
 * A registry of context providers that can be resolved in parallel.
 * Validates all required params upfront before resolving any providers.
 */
import type { ContextProvider } from './types';

export interface ContextProviderMetadata {
  name: string;
  description: string;
  params: { required?: string[]; optional?: string[] };
  templateVariables?: string[];
}

export class ContextRegistry {
  private providers = new Map<string, ContextProvider>();

  /** Register a context provider */
  register(provider: ContextProvider): void {
    this.providers.set(provider.name, provider);
  }

  /** Get a provider by name */
  get(name: string): ContextProvider | undefined {
    return this.providers.get(name);
  }

  /** List all registered providers with metadata */
  list(): ContextProviderMetadata[] {
    return Array.from(this.providers.values()).map((p) => ({
      name: p.name,
      description: p.description,
      params: p.params,
      templateVariables: p.templateVariables,
    }));
  }

  /** List all registered provider names */
  listNames(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Resolve multiple context types into an array of context strings.
   *
   * 1. Pre-flight validates ALL required params across ALL requested providers.
   * 2. Resolves all providers in parallel.
   * 3. Filters out null results and empty strings.
   */
  async resolve(
    contextTypes: string[],
    params: Record<string, unknown>
  ): Promise<string[]> {
    // Collect the providers for requested types
    const requested: ContextProvider[] = [];
    for (const type of contextTypes) {
      const provider = this.providers.get(type);
      if (!provider) {
        throw new Error(`[ContextRegistry] Unknown context type: "${type}"`);
      }
      requested.push(provider);
    }

    // Pre-flight: validate ALL required params across ALL providers before resolving any
    const missing: { provider: string; param: string }[] = [];
    for (const provider of requested) {
      for (const requiredParam of provider.params.required ?? []) {
        if (params[requiredParam] === undefined || params[requiredParam] === null) {
          missing.push({ provider: provider.name, param: requiredParam });
        }
      }
    }

    if (missing.length > 0) {
      const details = missing
        .map(m => `"${m.param}" (required by "${m.provider}")`)
        .join(', ');
      throw new Error(`[ContextRegistry] Missing required params: ${details}`);
    }

    // Resolve all providers in parallel
    const results = await Promise.all(
      requested.map(provider => provider.resolve(params))
    );

    // Filter out null results and empty strings
    return results.filter(
      (result): result is string => result !== null && result.trim().length > 0
    );
  }
}
