import { AgentConfig } from "@/server/agents/base";

export interface MicrocycleMessageConfig {
  agentConfig?: AgentConfig;
  operationName: string;
}
