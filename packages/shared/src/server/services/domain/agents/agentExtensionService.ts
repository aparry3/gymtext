import type { AgentExtension, ExtensionFields } from '@/server/models/agentExtension';
import type { RepositoryContainer } from '../../../repositories/factory';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface AgentExtensionServiceInstance {
  getExtension(agentId: string, extensionType: string, extensionKey: string): Promise<AgentExtension | null>;
  getFullExtensionsByAgent(agentId: string): Promise<AgentExtension[]>;
  getHistory(agentId: string, extensionType: string, extensionKey: string, limit?: number): Promise<AgentExtension[]>;
  saveExtension(agentId: string, extensionType: string, extensionKey: string, fields: Partial<ExtensionFields>): Promise<AgentExtension>;
  listByAgent(agentId: string): Promise<Array<{ extensionType: string; extensionKey: string }>>;
  listAll(): Promise<Array<{ agentId: string; extensionType: string; extensionKey: string }>>;
  invalidateCache(agentId: string, extensionType: string, extensionKey: string): void;
}

export function createAgentExtensionService(repos: RepositoryContainer): AgentExtensionServiceInstance {
  const extensionCache = new Map<string, CacheEntry<AgentExtension>>();
  const agentCache = new Map<string, CacheEntry<AgentExtension[]>>();

  const extensionCacheKey = (agentId: string, extensionType: string, extensionKey: string) =>
    `${agentId}:${extensionType}:${extensionKey}`;

  const agentCacheKey = (agentId: string) => `agent:${agentId}`;

  return {
    async getExtension(agentId: string, extensionType: string, extensionKey: string) {
      const key = extensionCacheKey(agentId, extensionType, extensionKey);
      const cached = extensionCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      const result = await repos.agentExtension.getLatest(agentId, extensionType, extensionKey);
      if (result) {
        extensionCache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
        return result;
      }

      return null;
    },

    async getFullExtensionsByAgent(agentId: string) {
      const key = agentCacheKey(agentId);
      const cached = agentCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      const results = await repos.agentExtension.getLatestByAgent(agentId);
      agentCache.set(key, { data: results, expiresAt: Date.now() + CACHE_TTL_MS });
      return results;
    },

    async getHistory(agentId: string, extensionType: string, extensionKey: string, limit?: number) {
      return repos.agentExtension.getHistory(agentId, extensionType, extensionKey, limit);
    },

    async saveExtension(agentId: string, extensionType: string, extensionKey: string, fields: Partial<ExtensionFields>) {
      const result = await repos.agentExtension.create({
        agentId,
        extensionType,
        extensionKey,
        ...fields,
      });
      // Invalidate both per-extension and per-agent caches
      extensionCache.delete(extensionCacheKey(agentId, extensionType, extensionKey));
      agentCache.delete(agentCacheKey(agentId));
      return result;
    },

    async listByAgent(agentId: string) {
      return repos.agentExtension.listByAgent(agentId);
    },

    async listAll() {
      return repos.agentExtension.listAll();
    },

    invalidateCache(agentId: string, extensionType: string, extensionKey: string): void {
      extensionCache.delete(extensionCacheKey(agentId, extensionType, extensionKey));
      agentCache.delete(agentCacheKey(agentId));
    },
  };
}
