import type { PromptPair } from '@/server/models/prompt';
import type { RepositoryContainer } from '../../repositories/factory';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * PromptServiceInstance interface
 *
 * Defines all public methods available on the prompt service.
 */
export interface PromptServiceInstance {
  getPrompts(agentId: string): Promise<PromptPair>;
  getContextPrompt(agentId: string): Promise<string | null>;
  invalidateCache(agentId: string): void;
  clearCache(): void;
}

/**
 * Create a PromptService instance with injected repositories
 *
 * Note: The cache is created per-instance. For shared caching across
 * the application, use the singleton pattern or a shared cache instance.
 *
 * @param repos - Repository container with all repositories
 * @returns PromptServiceInstance
 */
export function createPromptService(repos: RepositoryContainer): PromptServiceInstance {
  const cache = new Map<string, CacheEntry<PromptPair>>();
  const contextCache = new Map<string, CacheEntry<string>>();

  return {
    async getPrompts(agentId: string): Promise<PromptPair> {
      // Check cache first
      const cached = cache.get(agentId);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      // Fetch from database
      const prompts = await repos.prompt.getPromptPair(agentId);

      if (!prompts) {
        throw new Error(
          `Prompt not found for agent '${agentId}'. ` +
            `All prompts must be seeded before use. Run the prompt seeding migration.`
        );
      }

      // Update cache
      cache.set(agentId, {
        data: prompts,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return prompts;
    },

    async getContextPrompt(agentId: string): Promise<string | null> {
      const cacheKey = `${agentId}:context`;

      // Check cache first
      const cached = contextCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      // Fetch from database
      const value = await repos.prompt.getContextPrompt(agentId);

      if (value !== null) {
        // Update cache
        contextCache.set(cacheKey, {
          data: value,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
      }

      return value;
    },

    invalidateCache(agentId: string): void {
      cache.delete(agentId);
      contextCache.delete(`${agentId}:context`);
    },

    clearCache(): void {
      cache.clear();
      contextCache.clear();
    },
  };
}

// =============================================================================
// DEPRECATED: Singleton pattern for backward compatibility
// Remove after all consumers migrate to factory pattern
// =============================================================================

import { promptRepository } from '@/server/repositories/promptRepository';

/**
 * @deprecated Use createPromptService(repos) instead
 */
export class PromptService {
  private static instance: PromptService;
  private cache: Map<string, CacheEntry<PromptPair>> = new Map();
  private contextCache: Map<string, CacheEntry<string>> = new Map();

  private constructor() {}

  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  async getPrompts(agentId: string): Promise<PromptPair> {
    const cached = this.cache.get(agentId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const prompts = await promptRepository.getPromptPair(agentId);

    if (!prompts) {
      throw new Error(
        `Prompt not found for agent '${agentId}'. ` +
          `All prompts must be seeded before use. Run the prompt seeding migration.`
      );
    }

    this.cache.set(agentId, {
      data: prompts,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return prompts;
  }

  async getContextPrompt(agentId: string): Promise<string | null> {
    const cacheKey = `${agentId}:context`;

    const cached = this.contextCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const value = await promptRepository.getContextPrompt(agentId);

    if (value !== null) {
      this.contextCache.set(cacheKey, {
        data: value,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }

    return value;
  }

  invalidateCache(agentId: string): void {
    this.cache.delete(agentId);
    this.contextCache.delete(`${agentId}:context`);
  }

  clearCache(): void {
    this.cache.clear();
    this.contextCache.clear();
  }
}

/**
 * @deprecated Use createPromptService(repos) instead
 */
export const promptService = PromptService.getInstance();
