import type { RepositoryContainer } from '../../../repositories/factory';
import type { AgentLog } from '../../../models/agentLog';

/**
 * Agent Log Service Instance Interface
 */
export interface AgentLogServiceInstance {
  query(filters: {
    agentId?: string;
    limit?: number;
    offset?: number;
  }): Promise<AgentLog[]>;
  count(filters: { agentId?: string }): Promise<number>;
  deleteAll(): Promise<number>;
  avgScorePerAgent(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<{ agentId: string; avgScore: number; count: number }>>;
}

/**
 * Create the agent log service
 */
export function createAgentLogService(
  repos: RepositoryContainer
): AgentLogServiceInstance {
  return {
    async query(filters) {
      return repos.agentLog.query(filters);
    },

    async count(filters) {
      return repos.agentLog.count(filters);
    },

    async deleteAll() {
      return repos.agentLog.deleteAll();
    },

    async avgScorePerAgent(filters) {
      return repos.agentLog.avgScorePerAgent(filters);
    },
  };
}
