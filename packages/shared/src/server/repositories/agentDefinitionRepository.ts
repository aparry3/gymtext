import { BaseRepository } from './baseRepository';
import type {
  AgentDefinition,
  NewAgentDefinition,
  AgentDefinitionUpdate,
} from '@/server/models/agentDefinition';
import type { Json } from '@/server/models/_types';

/**
 * Ensure a JSON column value is a string so the pg driver doesn't
 * misinterpret JavaScript arrays as PostgreSQL arrays.
 */
function toJsonParam(value: Json | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

/**
 * AgentDefinitionRepository - Data access layer for agent configurations
 *
 * Uses append-only versioning pattern:
 * - Each "update" inserts a new row with updated values
 * - Latest version determined by created_at DESC per agent_id
 * - Full version history is preserved
 */
export class AgentDefinitionRepository extends BaseRepository {
  /**
   * Get the latest active version of an agent definition by agent ID
   */
  async getById(agentId: string): Promise<AgentDefinition | null> {
    const result = await this.db
      .selectFrom('agentDefinitions')
      .where('agentId', '=', agentId)
      .where('isActive', '=', true)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .selectAll()
      .executeTakeFirst();

    return result ?? null;
  }

  /**
   * Get the latest active versions for multiple agent IDs (batch)
   */
  async getByIds(agentIds: string[]): Promise<AgentDefinition[]> {
    if (agentIds.length === 0) return [];

    // Use a subquery to get the latest version for each agent_id
    const latestVersions = await this.db
      .selectFrom('agentDefinitions as ad')
      .selectAll('ad')
      .where('ad.agentId', 'in', agentIds)
      .where('ad.isActive', '=', true)
      .where(({ eb, selectFrom }) =>
        eb(
          'ad.createdAt',
          '=',
          selectFrom('agentDefinitions as inner')
            .select((eb) => eb.fn.max('inner.createdAt').as('maxCreatedAt'))
            .where('inner.agentId', '=', eb.ref('ad.agentId'))
            .where('inner.isActive', '=', true)
        )
      )
      .execute();

    return latestVersions;
  }

  /**
   * Get all active agent definitions (latest version of each)
   */
  async getAllActive(): Promise<AgentDefinition[]> {
    // Get distinct agent_ids first, then get latest version for each
    const latestVersions = await this.db
      .selectFrom('agentDefinitions as ad')
      .selectAll('ad')
      .where('ad.isActive', '=', true)
      .where(({ eb, selectFrom }) =>
        eb(
          'ad.createdAt',
          '=',
          selectFrom('agentDefinitions as inner')
            .select((eb) => eb.fn.max('inner.createdAt').as('maxCreatedAt'))
            .where('inner.agentId', '=', eb.ref('ad.agentId'))
            .where('inner.isActive', '=', true)
        )
      )
      .orderBy('ad.agentId')
      .execute();

    return latestVersions;
  }

  /**
   * Get version history for a specific agent
   */
  async getHistory(agentId: string, limit = 20): Promise<AgentDefinition[]> {
    return this.db
      .selectFrom('agentDefinitions')
      .where('agentId', '=', agentId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();
  }

  /**
   * Get a specific version by version ID
   */
  async getByVersionId(versionId: number): Promise<AgentDefinition | null> {
    const result = await this.db
      .selectFrom('agentDefinitions')
      .where('versionId', '=', versionId)
      .selectAll()
      .executeTakeFirst();

    return result ?? null;
  }

  /**
   * Create a new agent definition (initial version)
   */
  async create(definition: NewAgentDefinition): Promise<AgentDefinition> {
    return this.db
      .insertInto('agentDefinitions')
      .values({
        ...definition,
        subAgents: toJsonParam(definition.subAgents),
        schemaJson: toJsonParam(definition.schemaJson),
        validationRules: toJsonParam(definition.validationRules),
        examples: toJsonParam(definition.examples),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Update an agent definition (append-only: inserts new row with updated values)
   * Merges the update with current values so partial updates are supported.
   */
  async update(
    agentId: string,
    update: AgentDefinitionUpdate
  ): Promise<AgentDefinition> {
    // Get current values to merge with update
    const current = await this.getById(agentId);
    if (!current) {
      throw new Error(`Agent definition not found: ${agentId}`);
    }

    // Insert new version with merged values
    return this.db
      .insertInto('agentDefinitions')
      .values({
        agentId,
        systemPrompt: update.systemPrompt ?? current.systemPrompt,
        userPrompt: update.userPrompt !== undefined ? update.userPrompt : current.userPrompt,
        model: update.model ?? current.model,
        maxTokens: update.maxTokens ?? current.maxTokens,
        temperature: update.temperature ?? current.temperature,
        maxIterations: update.maxIterations ?? current.maxIterations,
        maxRetries: update.maxRetries ?? current.maxRetries,
        description: update.description !== undefined ? update.description : current.description,
        isActive: update.isActive ?? current.isActive,
        toolIds: update.toolIds !== undefined ? update.toolIds : current.toolIds,
        contextTypes: update.contextTypes !== undefined ? update.contextTypes : current.contextTypes,
        subAgents: toJsonParam(update.subAgents !== undefined ? update.subAgents : current.subAgents),
        schemaJson: toJsonParam(update.schemaJson !== undefined ? update.schemaJson : current.schemaJson),
        validationRules: toJsonParam(update.validationRules !== undefined ? update.validationRules : current.validationRules),
        userPromptTemplate: update.userPromptTemplate !== undefined ? update.userPromptTemplate : current.userPromptTemplate,
        examples: toJsonParam(update.examples !== undefined ? update.examples : current.examples),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Revert to a specific version (creates new row with old content)
   */
  async revert(agentId: string, versionId: number): Promise<AgentDefinition> {
    const version = await this.getByVersionId(versionId);
    if (!version) {
      throw new Error(`Version not found: ${versionId}`);
    }
    if (version.agentId !== agentId) {
      throw new Error(`Version ${versionId} does not belong to agent ${agentId}`);
    }

    // Insert new row with the old version's content
    return this.db
      .insertInto('agentDefinitions')
      .values({
        agentId: version.agentId,
        systemPrompt: version.systemPrompt,
        userPrompt: version.userPrompt,
        model: version.model,
        maxTokens: version.maxTokens,
        temperature: version.temperature,
        maxIterations: version.maxIterations,
        maxRetries: version.maxRetries,
        description: version.description,
        isActive: version.isActive,
        toolIds: version.toolIds,
        contextTypes: version.contextTypes,
        subAgents: toJsonParam(version.subAgents),
        schemaJson: toJsonParam(version.schemaJson),
        validationRules: toJsonParam(version.validationRules),
        userPromptTemplate: version.userPromptTemplate,
        examples: toJsonParam(version.examples),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Soft-delete an agent definition by marking latest version as inactive
   * (Inserts a new version with isActive = false)
   */
  async deactivate(agentId: string): Promise<AgentDefinition> {
    return this.update(agentId, { isActive: false });
  }
}

export const agentDefinitionRepository = new AgentDefinitionRepository();
