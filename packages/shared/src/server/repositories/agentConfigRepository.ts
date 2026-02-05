import { BaseRepository } from './baseRepository';
import type {
  AgentConfig,
  NewAgentConfig,
  AgentConfigDB,
} from '@/server/models/agentConfig';
import { toAgentConfig, toNewAgentConfigDB } from '@/server/models/agentConfig';

/**
 * AgentConfigRepository - Data access layer for agent configurations
 *
 * Insert-only design for versioning: each update creates a new row,
 * providing full audit trail and ability to revert.
 */
export class AgentConfigRepository extends BaseRepository {
  /**
   * Get the latest (most recent) config for an agent
   */
  async getLatest(id: string): Promise<AgentConfig | null> {
    const record = await this.db
      .selectFrom('agentConfigs')
      .where('id', '=', id)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .selectAll()
      .executeTakeFirst();

    if (!record) return null;
    return toAgentConfig(record as AgentConfigDB);
  }

  /**
   * Create a new config version (insert-only)
   */
  async create(config: NewAgentConfig): Promise<AgentConfig> {
    const dbConfig = toNewAgentConfigDB(config);

    const record = await this.db
      .insertInto('agentConfigs')
      .values(dbConfig)
      .returningAll()
      .executeTakeFirstOrThrow();

    return toAgentConfig(record as AgentConfigDB);
  }

  /**
   * Get config history for an agent (most recent first)
   */
  async getHistory(id: string, limit: number = 10): Promise<AgentConfig[]> {
    const records = await this.db
      .selectFrom('agentConfigs')
      .where('id', '=', id)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();

    return records.map((r) => toAgentConfig(r as AgentConfigDB));
  }

  /**
   * Get all unique agent config IDs
   */
  async getAllIds(): Promise<string[]> {
    const results = await this.db
      .selectFrom('agentConfigs')
      .select('id')
      .distinct()
      .execute();

    return results.map((r) => r.id);
  }

  /**
   * Get config at a specific version (by created_at timestamp)
   */
  async getAtVersion(id: string, createdAt: Date): Promise<AgentConfig | null> {
    const record = await this.db
      .selectFrom('agentConfigs')
      .where('id', '=', id)
      .where('createdAt', '=', createdAt)
      .selectAll()
      .executeTakeFirst();

    if (!record) return null;
    return toAgentConfig(record as AgentConfigDB);
  }

  /**
   * Get all latest configs (one per agent ID)
   * Useful for admin overview
   */
  async getAllLatest(): Promise<AgentConfig[]> {
    // Use a lateral join to get the latest config for each unique ID
    const results = await this.db
      .selectFrom('agentConfigs as ac1')
      .selectAll()
      .where(({ eb, selectFrom }) =>
        eb(
          'ac1.createdAt',
          '=',
          selectFrom('agentConfigs as ac2')
            .select(({ fn }) => fn.max('ac2.createdAt').as('maxCreatedAt'))
            .where('ac2.id', '=', eb.ref('ac1.id'))
        )
      )
      .orderBy('id', 'asc')
      .execute();

    return results.map((r) => toAgentConfig(r as AgentConfigDB));
  }
}
