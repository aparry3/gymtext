import type { Message } from '../types';
import type { ToolRegistry } from '../tools/toolRegistry';
import type { ToolServiceContainer } from '../tools/types';
import type { AgentDefinitionServiceInstance } from '@/server/services/domain/agents/agentDefinitionService';
import type { AgentLogServiceInstance } from '@/server/services/domain/agents/agentLogService';

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
  agentLogService?: AgentLogServiceInstance;
}

export interface SimpleAgentRunnerInstance {
  invoke(agentId: string, params: SimpleAgentInvokeParams): Promise<{
    response: string;
    messages?: string[];
  }>;
}
