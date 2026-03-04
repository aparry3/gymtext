import type { Message } from '../types';
import type { ToolRegistry } from '../tools/toolRegistry';
import type { ToolServiceContainer } from '../tools/types';
import type { NewAgentLog } from '@/server/models/agentLog';
import type { JsonValue } from '@/server/models/_types';
import type { AgentDefinitionServiceInstance } from '@/server/services/domain/agents/agentDefinitionService';

export interface SimpleAgentInvokeParams {
  input?: string;
  params?: Record<string, unknown>;
  previousMessages?: Message[];
  context?: string[];
  userPromptTemplate?: string;
}

export interface SimpleAgentRunnerDeps {
  agentDefinitionService: AgentDefinitionServiceInstance;
  toolRegistry: ToolRegistry;
  getServices: () => ToolServiceContainer;
  agentLogRepository?: {
    log: (entry: NewAgentLog) => Promise<string | null>;
    updateEval: (logId: string, evalData: { evalResult: JsonValue; evalScore: number }) => Promise<void>;
  };
}

export interface SimpleAgentRunnerInstance {
  invoke(agentId: string, params: SimpleAgentInvokeParams): Promise<{
    response: string;
    messages?: string[];
  }>;
}
