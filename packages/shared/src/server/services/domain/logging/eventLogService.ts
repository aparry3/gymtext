import type { RepositoryContainer } from '../../../repositories/factory';
import type { EventLogEntry, EventLog, EventLogQueryFilters } from '../../../repositories/eventLogRepository';

/**
 * EventLogServiceInstance interface
 *
 * Defines all public methods available on the event log service.
 */
export interface EventLogServiceInstance {
  log(entry: EventLogEntry): Promise<void>;
  getByChainId(chainId: string): Promise<EventLog[]>;
  query(filters: EventLogQueryFilters): Promise<EventLog[]>;
  getRecentByEntityId(entityId: string, limit?: number): Promise<EventLog[]>;
  getCountsByEventName(since: Date): Promise<Record<string, number>>;
}

/**
 * Create an EventLogService instance with injected dependencies
 *
 * @param repos - Repository container with all repositories
 * @returns EventLogServiceInstance
 */
export function createEventLogService(
  repos: RepositoryContainer
): EventLogServiceInstance {
  return {
    /**
     * Log a new event (fire-and-forget safe)
     */
    async log(entry: EventLogEntry): Promise<void> {
      return repos.eventLog.log(entry);
    },

    /**
     * Get all events for a specific chain ID (correlation)
     */
    async getByChainId(chainId: string): Promise<EventLog[]> {
      return repos.eventLog.getByChainId(chainId);
    },

    /**
     * Query events with filters
     */
    async query(filters: EventLogQueryFilters): Promise<EventLog[]> {
      return repos.eventLog.query(filters);
    },

    /**
     * Get recent events by entity ID (e.g., 'workout:structured')
     */
    async getRecentByEntityId(entityId: string, limit: number = 100): Promise<EventLog[]> {
      return repos.eventLog.getRecentByEntityId(entityId, limit);
    },

    /**
     * Get event counts by event name for a date range
     */
    async getCountsByEventName(since: Date): Promise<Record<string, number>> {
      return repos.eventLog.getCountsByEventName(since);
    },
  };
}
