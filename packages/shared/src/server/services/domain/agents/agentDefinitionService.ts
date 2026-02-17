import type { ZodSchema } from 'zod';
import type { DbAgentConfig } from '@/server/models/agentDefinition';
import type { AgentDefinition as DbAgentDefinitionRow } from '@/server/models/agentDefinition';
import type { RepositoryContainer } from '../../../repositories/factory';
import type {
  AgentDefinition,
  AgentDefinitionOverrides,
  ModelId,
} from '@/server/agents/types';

/**
 * Extended agent config from the DB columns
 */
interface ExtendedAgentConfig {
  toolIds: string[] | null;
  contextTypes: string[] | null;
  subAgents: unknown[] | null;
  schemaJson: Record<string, unknown> | null;
  validationRules: unknown[] | null;
  userPromptTemplate: string | null;
  examples: unknown[] | null;
  evalPrompt: string | null;
  evalModel: string | null;
  defaultExtensions: Record<string, string> | null;
}

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
   * Get a complete agent definition, ready for createAgent()
   * Fetches from DB (cached) and merges with optional overrides
   *
   * This is the primary way to create agents from the new database-driven system:
   * ```typescript
   * const definition = await agentDefinitionService.getDefinition(AGENTS.CHAT_GENERATE, {
   *   tools: [...],
   *   temperature: 0.5,  // Override DB value
   * });
   * const agent = createAgent(definition);
   * await agent.invoke({ message, context, previousMessages });
   * ```
   *
   * @param id - Agent identifier (e.g., AGENTS.CHAT_GENERATE)
   * @param overrides - Optional DB field overrides and code-provided config
   */
  getDefinition<TSchema extends ZodSchema | undefined = undefined>(
    id: string,
    overrides?: AgentDefinitionOverrides<TSchema>
  ): Promise<AgentDefinition<TSchema>>;

  /**
   * Get the extended configuration for an agent (new DB columns)
   * Returns tool_ids, context_types, sub_agents, etc.
   * Uses the same cache as getAgentDefinition().
   */
  getExtendedConfig(agentId: string): Promise<ExtendedAgentConfig>;

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
    evalRubric: (row.evalPrompt as string | null) ?? null,
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

  /**
   * Extract extended config from a raw DB row
   */
  const toExtendedConfig = (raw: DbAgentDefinitionRow): ExtendedAgentConfig => ({
    toolIds: (raw.toolIds as string[] | null) ?? null,
    contextTypes: (raw.contextTypes as string[] | null) ?? null,
    subAgents: (raw.subAgents as unknown as unknown[] | null) ?? null,
    schemaJson: (raw.schemaJson as unknown as Record<string, unknown> | null) ?? null,
    validationRules: (raw.validationRules as unknown as unknown[] | null) ?? null,
    userPromptTemplate: (raw.userPromptTemplate as string | null) ?? null,
    examples: (raw.examples as unknown[] | null) ?? null,
    evalPrompt: (raw.evalPrompt as string | null) ?? null,
    evalModel: (raw.evalModel as string | null) ?? null,
    defaultExtensions: (raw.defaultExtensions as Record<string, string> | null) ?? null,
  });

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

    async getDefinition<TSchema extends ZodSchema | undefined = undefined>(
      id: string,
      overrides?: AgentDefinitionOverrides<TSchema>
    ): Promise<AgentDefinition<TSchema>> {
      const dbConfig = await this.getAgentDefinition(id);

      return {
        name: id,
        // Resolved DB values (with optional overrides)
        systemPrompt: dbConfig.systemPrompt,
        dbUserPrompt: dbConfig.userPromptTemplate,
        model: (overrides?.model ?? dbConfig.model) as ModelId,
        maxTokens: overrides?.maxTokens ?? dbConfig.maxTokens,
        temperature: overrides?.temperature ?? dbConfig.temperature,
        maxIterations: overrides?.maxIterations ?? dbConfig.maxIterations,
        maxRetries: overrides?.maxRetries ?? 1,
        // Code-provided additions
        tools: overrides?.tools,
        schema: overrides?.schema,
        subAgents: overrides?.subAgents,
        validate: overrides?.validate,
        userPrompt: overrides?.userPrompt,
        loggingContext: overrides?.loggingContext,
        context: overrides?.context,
      };
    },

    async getExtendedConfig(agentId: string): Promise<ExtendedAgentConfig> {
      // Check cache first
      const cached = cache.get(agentId);
      if (cached && cached.expiresAt > Date.now()) {
        return toExtendedConfig(cached.raw);
      }

      const entry = await fetchAndCache(agentId);
      return toExtendedConfig(entry.raw);
    },

    invalidateCache(agentId: string): void {
      cache.delete(agentId);
    },

    clearCache(): void {
      cache.clear();
    },
  };
}
