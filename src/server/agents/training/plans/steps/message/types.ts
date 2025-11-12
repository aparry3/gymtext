import { AgentConfig } from "@/server/agents/base";

export interface PlanMessageConfig {
  agentConfig?: AgentConfig;
  operationName: string;
}
