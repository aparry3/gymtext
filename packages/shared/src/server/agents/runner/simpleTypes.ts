import type { Message } from '../types';
import type { ToolRegistry } from '../tools/toolRegistry';
import type { ToolServiceContainer } from '../tools/types';
import type { NewAgentLog } from '@/server/models/agentLog';
import type { DbAgentConfig } from '@/server/models/agentDefinition';

export interface SimpleAgentInvokeParams {
  input?: string;
  params?: Record<string, unknown>;
  previousMessages?: Message[];
  context?: string[];
}

export interface SimpleAgentRunnerDeps {
  agentDefinitionService: {
    getAgentDefinition: (agentId: string) => Promise<DbAgentConfig>;
  };
  toolRegistry: ToolRegistry;
  getServices: () => ToolServiceContainer;
  agentLogRepository?: {
    log: (entry: NewAgentLog) => Promise<string | null>;
  };
}

export interface SimpleAgentRunnerInstance {
  invoke(agentId: string, params: SimpleAgentInvokeParams): Promise<{
    response: string;
    messages?: string[];
  }>;
}
