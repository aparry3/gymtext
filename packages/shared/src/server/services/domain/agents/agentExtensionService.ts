import type { AgentExtension } from '@/server/models/agentExtension';
import type { RepositoryContainer } from '../../../repositories/factory';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface AgentExtensionServiceInstance {
  getExtension(agentId: string, extensionType: string, extensionKey: string): Promise<{ content: string; evalRubric: string | null } | null>;
  getHistory(agentId: string, extensionType: string, extensionKey: string, limit?: number): Promise<AgentExtension[]>;
  saveExtension(agentId: string, extensionType: string, extensionKey: string, content: string, evalRubric?: string | null): Promise<AgentExtension>;
  listByAgent(agentId: string): Promise<Array<{ extensionType: string; extensionKey: string }>>;
  listAll(): Promise<Array<{ agentId: string; extensionType: string; extensionKey: string }>>;
  invalidateCache(agentId: string, extensionType: string, extensionKey: string): void;
}

export function createAgentExtensionService(repos: RepositoryContainer): AgentExtensionServiceInstance {
  const cache = new Map<string, CacheEntry<{ content: string; evalRubric: string | null }>>();

  const cacheKey = (agentId: string, extensionType: string, extensionKey: string) =>
    `${agentId}:${extensionType}:${extensionKey}`;

  return {
    async getExtension(agentId: string, extensionType: string, extensionKey: string) {
      const key = cacheKey(agentId, extensionType, extensionKey);
      const cached = cache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      const result = await repos.agentExtension.getLatest(agentId, extensionType, extensionKey);
      if (result) {
        const data = { content: result.content, evalRubric: result.evalRubric };
        cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
        return data;
      }

      return null;
    },

    async getHistory(agentId: string, extensionType: string, extensionKey: string, limit?: number) {
      return repos.agentExtension.getHistory(agentId, extensionType, extensionKey, limit);
    },

    async saveExtension(agentId: string, extensionType: string, extensionKey: string, content: string, evalRubric?: string | null) {
      const result = await repos.agentExtension.create({
        agentId,
        extensionType,
        extensionKey,
        content,
        evalRubric: evalRubric ?? null,
      });
      cache.delete(cacheKey(agentId, extensionType, extensionKey));
      return result;
    },

    async listByAgent(agentId: string) {
      return repos.agentExtension.listByAgent(agentId);
    },

    async listAll() {
      return repos.agentExtension.listAll();
    },

    invalidateCache(agentId: string, extensionType: string, extensionKey: string): void {
      cache.delete(cacheKey(agentId, extensionType, extensionKey));
    },
  };
}
