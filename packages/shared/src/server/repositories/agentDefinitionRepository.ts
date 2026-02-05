import { BaseRepository } from './baseRepository';
import type {
  AgentDefinition,
  NewAgentDefinition,
  AgentDefinitionUpdate,
} from '@/server/models/agentDefinition';

/**
 * AgentDefinitionRepository - Data access layer for agent configurations
 *
 * Provides access to database-stored agent definitions including
 * prompts and model configuration.
 */
export class AgentDefinitionRepository extends BaseRepository {
  /**
   * Get a single agent definition by ID
   */
  async getById(id: string): Promise<AgentDefinition | null> {
    const result = await this.db
      .selectFrom('agentDefinitions')
      .where('id', '=', id)
      .where('isActive', '=', true)
      .selectAll()
      .executeTakeFirst();

    return result ?? null;
  }

  /**
   * Get multiple agent definitions by IDs (batch)
   */
  async getByIds(ids: string[]): Promise<AgentDefinition[]> {
    if (ids.length === 0) return [];

    return this.db
      .selectFrom('agentDefinitions')
      .where('id', 'in', ids)
      .where('isActive', '=', true)
      .selectAll()
      .execute();
  }

  /**
   * Get all active agent definitions
   */
  async getAllActive(): Promise<AgentDefinition[]> {
    return this.db
      .selectFrom('agentDefinitions')
      .where('isActive', '=', true)
      .selectAll()
      .execute();
  }

  /**
   * Upsert an agent definition
   * Inserts if not exists, updates if exists
   */
  async upsert(definition: NewAgentDefinition): Promise<AgentDefinition> {
    return this.db
      .insertInto('agentDefinitions')
      .values(definition)
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          systemPrompt: definition.systemPrompt,
          userPrompt: definition.userPrompt,
          model: definition.model,
          maxTokens: definition.maxTokens,
          temperature: definition.temperature,
          maxIterations: definition.maxIterations,
          maxRetries: definition.maxRetries,
          description: definition.description,
          isActive: definition.isActive,
        })
      )
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Update an agent definition
   */
  async update(
    id: string,
    update: AgentDefinitionUpdate
  ): Promise<AgentDefinition | null> {
    const result = await this.db
      .updateTable('agentDefinitions')
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ?? null;
  }

  /**
   * Soft-delete an agent definition by marking it inactive
   */
  async deactivate(id: string): Promise<boolean> {
    const result = await this.db
      .updateTable('agentDefinitions')
      .set({ isActive: false })
      .where('id', '=', id)
      .executeTakeFirst();

    return (result.numUpdatedRows ?? BigInt(0)) > BigInt(0);
  }
}

export const agentDefinitionRepository = new AgentDefinitionRepository();
