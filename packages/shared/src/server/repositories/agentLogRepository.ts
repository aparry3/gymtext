import { BaseRepository } from './baseRepository';
import type { NewAgentLog, AgentLog } from '@/server/models/agentLog';

/**
 * AgentLogRepository - Data access layer for agent invocation logs
 *
 * Stores every agent invocation (full message chain + response)
 * for review, debugging, and evaluation.
 */
export class AgentLogRepository extends BaseRepository {
  /**
   * Log an agent invocation (fire-and-forget, catches errors silently)
   */
  async log(entry: NewAgentLog): Promise<void> {
    try {
      await this.db
        .insertInto('agentLogs')
        .values({
          ...entry,
          messages: JSON.stringify(entry.messages),
          response: entry.response != null ? JSON.stringify(entry.response) : null,
          metadata: entry.metadata != null ? JSON.stringify(entry.metadata) : null,
        })
        .execute();
    } catch (error) {
      console.error('[AgentLogRepository] Failed to log agent invocation:', error);
    }
  }

  /**
   * Query agent logs with filters for admin UI browsing
   */
  async query(filters: {
    agentId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AgentLog[]> {
    let query = this.db
      .selectFrom('agentLogs')
      .selectAll()
      .orderBy('createdAt', 'desc');

    if (filters.agentId) {
      query = query.where('agentId', '=', filters.agentId);
    }
    if (filters.startDate) {
      query = query.where('createdAt', '>=', filters.startDate);
    }
    if (filters.endDate) {
      query = query.where('createdAt', '<=', filters.endDate);
    }

    query = query.limit(filters.limit ?? 50);

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return query.execute();
  }

  /**
   * Count agent logs matching filters (for pagination)
   */
  async count(filters: {
    agentId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    let query = this.db
      .selectFrom('agentLogs')
      .select(this.db.fn.countAll<number>().as('count'));

    if (filters.agentId) {
      query = query.where('agentId', '=', filters.agentId);
    }
    if (filters.startDate) {
      query = query.where('createdAt', '>=', filters.startDate);
    }
    if (filters.endDate) {
      query = query.where('createdAt', '<=', filters.endDate);
    }

    const result = await query.executeTakeFirstOrThrow();
    return Number(result.count);
  }

  /**
   * Delete logs older than a cutoff date (for cleanup cron)
   */
  async deleteOlderThan(cutoffDate: Date): Promise<number> {
    const result = await this.db
      .deleteFrom('agentLogs')
      .where('createdAt', '<', cutoffDate)
      .executeTakeFirst();

    return Number(result.numDeletedRows ?? 0);
  }

  /**
   * Delete all agent logs
   */
  async deleteAll(): Promise<number> {
    const result = await this.db
      .deleteFrom('agentLogs')
      .executeTakeFirst();

    return Number(result.numDeletedRows ?? 0);
  }
}
