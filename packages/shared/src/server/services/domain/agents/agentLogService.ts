import type { RepositoryContainer } from '../../../repositories/factory';
import type { AgentLog, NewAgentLog } from '../../../models/agentLog';
import type { JsonValue } from '../../../models/_types';

/**
 * Agent Log Service Instance Interface
 */
export interface AgentLogServiceInstance {
  log(entry: NewAgentLog): Promise<string | null>;
  updateEval(logId: string, evalData: { evalResult: JsonValue; evalScore: number }): Promise<void>;
  query(filters: {
    agentId?: string;
    limit?: number;
    offset?: number;
  }): Promise<AgentLog[]>;
  count(filters: { agentId?: string }): Promise<number>;
  deleteAll(): Promise<number>;
}

/**
 * Create the agent log service
 */
export function createAgentLogService(
  repos: RepositoryContainer
): AgentLogServiceInstance {
  return {
    async log(entry: NewAgentLog) {
      return repos.agentLog.log(entry);
    },

    async updateEval(logId: string, evalData: { evalResult: JsonValue; evalScore: number }) {
      return repos.agentLog.updateEval(logId, evalData);
    },

    async query(filters) {
      return repos.agentLog.query(filters);
    },

    async count(filters) {
      return repos.agentLog.count(filters);
    },

    async deleteAll() {
      return repos.agentLog.deleteAll();
    },
  };
}
