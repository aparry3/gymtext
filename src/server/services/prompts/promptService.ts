import { promptRepository } from '@/server/repositories/promptRepository';
import type { PromptPair } from '@/server/models/prompt';

interface CacheEntry {
  data: PromptPair;
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
  private cache: Map<string, CacheEntry> = new Map();

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
   * Invalidate cache for a specific agent (useful after updates)
   */
  invalidateCache(agentId: string): void {
    this.cache.delete(agentId);
  }

  /**
   * Clear entire cache (useful for testing or force refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const promptService = PromptService.getInstance();
