import type { ContextTemplate } from '@/server/models/contextTemplate';
import type { RepositoryContainer } from '../../../repositories/factory';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface ContextTemplateServiceInstance {
  getTemplate(contextType: string, variant?: string): Promise<string | null>;
  getHistory(contextType: string, variant: string, limit?: number): Promise<ContextTemplate[]>;
  saveTemplate(contextType: string, variant: string, template: string): Promise<ContextTemplate>;
  invalidateCache(contextType: string, variant: string): void;
  listDistinct(): Promise<Array<{ contextType: string; variant: string }>>;
}

export function createContextTemplateService(repos: RepositoryContainer): ContextTemplateServiceInstance {
  const cache = new Map<string, CacheEntry<string>>();

  const cacheKey = (contextType: string, variant: string) => `${contextType}:${variant}`;

  return {
    async getTemplate(contextType: string, variant: string = 'default'): Promise<string | null> {
      const key = cacheKey(contextType, variant);
      const cached = cache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      const result = await repos.contextTemplate.getLatest(contextType, variant);
      if (result) {
        cache.set(key, { data: result.template, expiresAt: Date.now() + CACHE_TTL_MS });
        return result.template;
      }

      return null;
    },

    async getHistory(contextType: string, variant: string, limit?: number): Promise<ContextTemplate[]> {
      return repos.contextTemplate.getHistory(contextType, variant, limit);
    },

    async saveTemplate(contextType: string, variant: string, template: string): Promise<ContextTemplate> {
      const result = await repos.contextTemplate.create({ contextType, variant, template });
      // Invalidate cache for this key
      cache.delete(cacheKey(contextType, variant));
      return result;
    },

    invalidateCache(contextType: string, variant: string): void {
      cache.delete(cacheKey(contextType, variant));
    },

    async listDistinct(): Promise<Array<{ contextType: string; variant: string }>> {
      return repos.contextTemplate.listDistinct();
    },
  };
}
