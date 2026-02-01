import { BaseRepository } from '@/server/repositories/baseRepository';

/**
 * Event log entry for creating new events
 */
export interface EventLogEntry {
  eventName: string;
  userId?: string;
  entityId?: string;
  chainId?: string;
  data?: Record<string, unknown>;
}

/**
 * Event log record from database
 */
export interface EventLog {
  id: string;
  eventName: string;
  userId: string | null;
  entityId: string | null;
  chainId: string | null;
  data: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Query filters for event logs
 */
export interface EventLogQueryFilters {
  eventName?: string;
  userId?: string;
  entityId?: string;
  chainId?: string;
  since?: Date;
  limit?: number;
  offset?: number;
}

/**
 * EventLogRepository - Handles event logging for application events
 *
 * Provides a generic event logging system for tracking various application
 * events such as validation failures, chain failures, SMS failures, etc.
 *
 * @example
 * ```typescript
 * // Log a validation failure
 * await eventLogRepo.log({
 *   eventName: 'validation_failed',
 *   userId: user.id,
 *   entityId: 'workout:structured',
 *   chainId: correlationId,
 *   data: { attempt: 1, errors: ['Missing warmup'], durationMs: 1523 }
 * });
 *
 * // Query events by chain ID
 * const events = await eventLogRepo.getByChainId(chainId);
 * ```
 */
export class EventLogRepository extends BaseRepository {
  /**
   * Log a new event (fire-and-forget safe)
   */
  async log(entry: EventLogEntry): Promise<void> {
    try {
      await this.db
        .insertInto('eventLogs')
        .values({
          eventName: entry.eventName,
          userId: entry.userId ?? null,
          entityId: entry.entityId ?? null,
          chainId: entry.chainId ?? null,
          data: JSON.stringify(entry.data ?? {}),
        })
        .execute();
    } catch (error) {
      // Log but don't throw - event logging should never break the main flow
      console.error('[EventLogRepository] Failed to log event:', error);
    }
  }

  /**
   * Get all events for a specific chain ID (correlation)
   */
  async getByChainId(chainId: string): Promise<EventLog[]> {
    const results = await this.db
      .selectFrom('eventLogs')
      .selectAll()
      .where('chainId', '=', chainId)
      .orderBy('createdAt', 'asc')
      .execute();

    return results.map(this.mapToEventLog);
  }

  /**
   * Query events with filters
   */
  async query(filters: EventLogQueryFilters): Promise<EventLog[]> {
    let query = this.db
      .selectFrom('eventLogs')
      .selectAll();

    if (filters.eventName) {
      query = query.where('eventName', '=', filters.eventName);
    }
    if (filters.userId) {
      query = query.where('userId', '=', filters.userId);
    }
    if (filters.entityId) {
      query = query.where('entityId', '=', filters.entityId);
    }
    if (filters.chainId) {
      query = query.where('chainId', '=', filters.chainId);
    }
    if (filters.since) {
      query = query.where('createdAt', '>=', filters.since);
    }

    query = query.orderBy('createdAt', 'desc');

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query.execute();
    return results.map(this.mapToEventLog);
  }

  /**
   * Get recent events by entity ID (e.g., 'workout:structured')
   */
  async getRecentByEntityId(entityId: string, limit: number = 100): Promise<EventLog[]> {
    const results = await this.db
      .selectFrom('eventLogs')
      .selectAll()
      .where('entityId', '=', entityId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .execute();

    return results.map(this.mapToEventLog);
  }

  /**
   * Get event counts by event name for a date range
   */
  async getCountsByEventName(since: Date): Promise<Record<string, number>> {
    const results = await this.db
      .selectFrom('eventLogs')
      .select(['eventName'])
      .select(({ fn }) => fn.count('id').as('count'))
      .where('createdAt', '>=', since)
      .groupBy('eventName')
      .execute();

    return results.reduce((acc, row) => {
      acc[row.eventName] = Number(row.count);
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Map database row to EventLog interface
   */
  private mapToEventLog(row: {
    id: string;
    eventName: string;
    userId: string | null;
    entityId: string | null;
    chainId: string | null;
    data: unknown;
    createdAt: Date | null;
  }): EventLog {
    return {
      id: row.id,
      eventName: row.eventName,
      userId: row.userId,
      entityId: row.entityId,
      chainId: row.chainId,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : (row.data as Record<string, unknown>) ?? {},
      createdAt: row.createdAt ?? new Date(),
    };
  }
}
