import { AgentConfig } from "@/server/agents/base";

export interface FitnessPlanMessageConfig {
  agentConfig?: AgentConfig;
  operationName: string;
}
