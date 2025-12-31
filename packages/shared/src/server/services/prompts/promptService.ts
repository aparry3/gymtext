import { promptRepository } from '@/server/repositories/promptRepository';
import type { PromptPair } from '@/server/models/prompt';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * PromptService - Manages prompt retrieval with caching
 *
 * Features:
 * - TTL-based in-memory cache (5 minutes)
 * - Throws if prompt not found (all prompts must be seeded)
 * - Singleton pattern for consistent cache state
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

  /**
   * Get prompts for an agent, using cache when available
   *
   * @throws Error if prompt not found (prompts must be seeded)
   */
  async getPrompts(agentId: string): Promise<PromptPair> {
    // Check cache first
    const cached = this.cache.get(agentId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    // Fetch from database
    const prompts = await promptRepository.getPromptPair(agentId);

    if (!prompts) {
      throw new Error(
        `Prompt not found for agent '${agentId}'. ` +
          `All prompts must be seeded before use. Run the prompt seeding migration.`
      );
    }

    // Update cache
    this.cache.set(agentId, {
      data: prompts,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return prompts;
  }

  /**
   * Get context prompt for an agent, using cache when available
   *
   * @returns The context prompt value, or null if not found
   */
  async getContextPrompt(agentId: string): Promise<string | null> {
    const cacheKey = `${agentId}:context`;

    // Check cache first
    const cached = this.contextCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    // Fetch from database
    const value = await promptRepository.getContextPrompt(agentId);

    if (value !== null) {
      // Update cache
      this.contextCache.set(cacheKey, {
        data: value,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }

    return value;
  }

  /**
   * Invalidate cache for a specific agent (useful after updates)
   */
  invalidateCache(agentId: string): void {
    this.cache.delete(agentId);
    this.contextCache.delete(`${agentId}:context`);
  }

  /**
   * Clear entire cache (useful for testing or force refresh)
   */
  clearCache(): void {
    this.cache.clear();
    this.contextCache.clear();
  }
}

export const promptService = PromptService.getInstance();
