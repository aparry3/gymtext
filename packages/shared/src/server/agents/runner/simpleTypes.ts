import type { Message } from '../types';
import type { ToolRegistry } from '../tools/toolRegistry';
import type { ToolServiceContainer } from '../tools/types';
import type { NewAgentLog } from '@/server/models/agentLog';

export interface SimpleAgentInvokeParams {
  input?: string;
  params?: Record<string, unknown>;
  previousMessages?: Message[];
  context?: string[];
}

export interface SimpleAgentRunnerDeps {
  agentDefinitionService: {
    getDefinition: (agentId: string) => Promise<{
      name: string;
      systemPrompt: string;
      model?: string;
      maxTokens?: number;
      temperature?: number;
      maxIterations?: number;
      [key: string]: unknown;
    }>;
    getExtendedConfig: (agentId: string) => Promise<{
      toolIds: string[] | null;
      userPromptTemplate: string | null;
      examples: unknown[] | null;
      [key: string]: unknown;
    }>;
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
