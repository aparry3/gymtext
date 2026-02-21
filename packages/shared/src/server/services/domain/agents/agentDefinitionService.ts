import type { DbAgentConfig } from '@/server/models/agentDefinition';
import type { AgentDefinition as DbAgentDefinitionRow } from '@/server/models/agentDefinition';
import type { RepositoryContainer } from '../../../repositories/factory';

interface CacheEntry {
  data: DbAgentConfig;
  raw: DbAgentDefinitionRow;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// =============================================================================
// Factory Pattern
// =============================================================================

/**
 * AgentDefinitionServiceInstance interface
 *
 * Provides cached access to agent definitions from the database.
 */
export interface AgentDefinitionServiceInstance {
  /**
   * Get a single agent definition by ID (raw DB config)
   * Returns cached config if available and not expired
   */
  getAgentDefinition(agentId: string): Promise<DbAgentConfig>;

  /**
   * Get multiple agent definitions by IDs (batch)
   * Returns a map of agentId -> DbAgentConfig
   */
  getAgentDefinitions(agentIds: string[]): Promise<Map<string, DbAgentConfig>>;

  /**
   * Invalidate cache for a specific agent
   */
  invalidateCache(agentId: string): void;

  /**
   * Clear all cached agent definitions
   */
  clearCache(): void;
}

/**
 * Create an AgentDefinitionService instance with injected repositories
 *
 * Note: The cache is created per-instance. For shared caching across
 * the application, use the singleton pattern or a shared cache instance.
 *
 * @param repos - Repository container with all repositories
 * @returns AgentDefinitionServiceInstance
 */
export function createAgentDefinitionService(
  repos: RepositoryContainer
): AgentDefinitionServiceInstance {
  const cache = new Map<string, CacheEntry>();

  /**
   * Convert database row to DbAgentConfig
   */
  const toDbAgentConfig = (row: DbAgentDefinitionRow): DbAgentConfig => ({
    systemPrompt: row.systemPrompt,
    userPromptTemplate: (row.userPromptTemplate as string | null) ?? null,
    model: row.model,
    maxTokens: row.maxTokens ?? 16000,
    temperature: row.temperature ? parseFloat(String(row.temperature)) : 1.0,
    maxIterations: row.maxIterations ?? 5,
    toolIds: (row.toolIds as string[] | null) ?? null,
    examples: (row.examples as unknown) ?? null,
    evalRubric: row.evalRubric ?? null,
  });

  /**
   * Fetch and cache a full DB row
   */
  const fetchAndCache = async (agentId: string): Promise<CacheEntry> => {
    const definition = await repos.agentDefinition.getById(agentId);

    if (!definition) {
      throw new Error(
        `Agent definition not found for '${agentId}'. ` +
          `All agent definitions must be seeded before use. Run the agent definition migration.`
      );
    }

    const config = toDbAgentConfig(definition);
    const entry: CacheEntry = {
      data: config,
      raw: definition,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    cache.set(agentId, entry);
    return entry;
  };

  return {
    async getAgentDefinition(agentId: string): Promise<DbAgentConfig> {
      // Check cache first
      const cached = cache.get(agentId);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      const entry = await fetchAndCache(agentId);
      return entry.data;
    },

    async getAgentDefinitions(
      agentIds: string[]
    ): Promise<Map<string, DbAgentConfig>> {
      const result = new Map<string, DbAgentConfig>();
      const idsToFetch: string[] = [];

      // Check cache for each ID
      for (const id of agentIds) {
        const cached = cache.get(id);
        if (cached && cached.expiresAt > Date.now()) {
          result.set(id, cached.data);
        } else {
          idsToFetch.push(id);
        }
      }

      // Fetch missing from database in batch
      if (idsToFetch.length > 0) {
        const definitions = await repos.agentDefinition.getByIds(idsToFetch);

        for (const definition of definitions) {
          const config = toDbAgentConfig(definition);

          // Update cache with full row
          cache.set(definition.agentId, {
            data: config,
            raw: definition,
            expiresAt: Date.now() + CACHE_TTL_MS,
          });

          result.set(definition.agentId, config);
        }

        // Check for missing definitions
        const foundIds = new Set(definitions.map((d) => d.agentId));
        const missingIds = idsToFetch.filter((id) => !foundIds.has(id));
        if (missingIds.length > 0) {
          throw new Error(
            `Agent definitions not found for: ${missingIds.join(', ')}. ` +
              `All agent definitions must be seeded before use.`
          );
        }
      }

      return result;
    },

    invalidateCache(agentId: string): void {
      cache.delete(agentId);
    },

    clearCache(): void {
      cache.clear();
    },
  };
}
