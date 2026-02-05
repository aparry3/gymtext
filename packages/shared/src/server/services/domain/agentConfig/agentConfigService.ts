import type { RepositoryContainer } from '../../../repositories/factory';
import type { AgentConfig, NewAgentConfig, AgentConfigUpdate } from '@/server/models/agentConfig';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * AgentConfigServiceInstance interface
 *
 * Defines all public methods available on the agent config service.
 */
export interface AgentConfigServiceInstance {
  /**
   * Get the latest config for an agent (cached)
   * Returns null if no config exists (agent may use defaults)
   */
  getConfig(id: string): Promise<AgentConfig | null>;

  /**
   * Save a new config version
   * Creates a new row in agent_configs (insert-only versioning)
   */
  saveConfig(id: string, config: AgentConfigUpdate): Promise<AgentConfig>;

  /**
   * Get config history for an agent
   */
  getHistory(id: string, limit?: number): Promise<AgentConfig[]>;

  /**
   * Get all agent config IDs
   */
  getAllIds(): Promise<string[]>;

  /**
   * Get all latest configs (one per agent)
   */
  getAllLatest(): Promise<AgentConfig[]>;

  /**
   * Invalidate cache for a specific agent
   */
  invalidateCache(id: string): void;

  /**
   * Clear entire cache
   */
  clearCache(): void;
}

/**
 * Create an AgentConfigService instance with injected repositories
 *
 * The cache is created per-instance. For shared caching across
 * the application, use the singleton pattern or a shared cache instance.
 *
 * @param repos - Repository container with all repositories
 * @returns AgentConfigServiceInstance
 */
export function createAgentConfigService(repos: RepositoryContainer): AgentConfigServiceInstance {
  const cache = new Map<string, CacheEntry<AgentConfig>>();

  return {
    async getConfig(id: string): Promise<AgentConfig | null> {
      // Check cache first
      const cached = cache.get(id);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      // Fetch from database
      const config = await repos.agentConfig.getLatest(id);

      if (config) {
        // Update cache
        cache.set(id, {
          data: config,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
      }

      return config;
    },

    async saveConfig(id: string, update: AgentConfigUpdate): Promise<AgentConfig> {
      // Get existing config to merge with (if exists)
      const existing = await repos.agentConfig.getLatest(id);

      // Build new config by merging update with existing
      const newConfig: NewAgentConfig = {
        id,
        systemPrompt: update.systemPrompt ?? existing?.systemPrompt ?? '',
        userPrompt: update.userPrompt !== undefined ? update.userPrompt : existing?.userPrompt,
        model: update.model !== undefined ? update.model : existing?.model,
        temperature: update.temperature !== undefined ? update.temperature : existing?.temperature,
        maxTokens: update.maxTokens !== undefined ? update.maxTokens : existing?.maxTokens,
        maxIterations: update.maxIterations !== undefined ? update.maxIterations : existing?.maxIterations,
      };

      // Ensure systemPrompt is not empty
      if (!newConfig.systemPrompt) {
        throw new Error(`Cannot save agent config '${id}' with empty system prompt`);
      }

      // Create new version
      const saved = await repos.agentConfig.create(newConfig);

      // Invalidate cache
      cache.delete(id);

      return saved;
    },

    async getHistory(id: string, limit: number = 10): Promise<AgentConfig[]> {
      return repos.agentConfig.getHistory(id, limit);
    },

    async getAllIds(): Promise<string[]> {
      return repos.agentConfig.getAllIds();
    },

    async getAllLatest(): Promise<AgentConfig[]> {
      return repos.agentConfig.getAllLatest();
    },

    invalidateCache(id: string): void {
      cache.delete(id);
    },

    clearCache(): void {
      cache.clear();
    },
  };
}
