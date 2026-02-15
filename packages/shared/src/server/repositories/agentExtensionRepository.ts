import { sql } from 'kysely';
import { BaseRepository } from './baseRepository';
import type { AgentExtension, NewAgentExtension } from '@/server/models/agentExtension';

/**
 * AgentExtensionRepository - Data access for agent extensions
 *
 * Insert-only design for versioning: each update creates a new row.
 */
export class AgentExtensionRepository extends BaseRepository {
  /**
   * Get the latest extension for a specific agent/type/key combination
   */
  async getLatest(agentId: string, extensionType: string, extensionKey: string): Promise<AgentExtension | null> {
    const result = await this.db
      .selectFrom('agentExtensions')
      .where('agentId', '=', agentId)
      .where('extensionType', '=', extensionType)
      .where('extensionKey', '=', extensionKey)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .selectAll()
      .executeTakeFirst();

    return result ?? null;
  }

  /**
   * Get version history for a specific extension
   */
  async getHistory(
    agentId: string,
    extensionType: string,
    extensionKey: string,
    limit: number = 20
  ): Promise<AgentExtension[]> {
    return this.db
      .selectFrom('agentExtensions')
      .where('agentId', '=', agentId)
      .where('extensionType', '=', extensionType)
      .where('extensionKey', '=', extensionKey)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();
  }

  /**
   * Create a new extension version (insert-only)
   */
  async create(entry: NewAgentExtension): Promise<AgentExtension> {
    return this.db
      .insertInto('agentExtensions')
      .values(entry)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Get the latest version of each (extensionType, extensionKey) pair for an agent.
   * Returns full row data for every unique extension.
   */
  async getLatestByAgent(agentId: string): Promise<AgentExtension[]> {
    const results = await sql<AgentExtension>`
      SELECT DISTINCT ON (extension_type, extension_key) *
      FROM agent_extensions
      WHERE agent_id = ${agentId}
      ORDER BY extension_type, extension_key, created_at DESC
    `.execute(this.db);
    return results.rows;
  }

  /**
   * List distinct (extensionType, extensionKey) pairs for an agent
   */
  async listByAgent(agentId: string): Promise<Array<{ extensionType: string; extensionKey: string }>> {
    const results = await this.db
      .selectFrom('agentExtensions')
      .where('agentId', '=', agentId)
      .select(['extensionType', 'extensionKey'])
      .distinct()
      .orderBy('extensionType')
      .orderBy('extensionKey')
      .execute();

    return results;
  }

  /**
   * Get the latest version of every extension across all agents.
   * Returns full row data for every unique (agentId, extensionType, extensionKey) triple.
   */
  async getAllLatest(): Promise<AgentExtension[]> {
    const results = await sql<AgentExtension>`
      SELECT DISTINCT ON (agent_id, extension_type, extension_key) *
      FROM agent_extensions
      ORDER BY agent_id, extension_type, extension_key, created_at DESC
    `.execute(this.db);
    return results.rows;
  }

  /**
   * List all distinct (agentId, extensionType, extensionKey) triples
   */
  async listAll(): Promise<Array<{ agentId: string; extensionType: string; extensionKey: string }>> {
    const results = await this.db
      .selectFrom('agentExtensions')
      .select(['agentId', 'extensionType', 'extensionKey'])
      .distinct()
      .orderBy('agentId')
      .orderBy('extensionType')
      .orderBy('extensionKey')
      .execute();

    return results;
  }
}
