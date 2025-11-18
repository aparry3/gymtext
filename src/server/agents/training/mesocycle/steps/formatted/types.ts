import type { AgentConfig } from '@/server/agents/base';

/**
 * Configuration for formatted mesocycle agent
 */
export interface FormattedMesocycleConfig {
  operationName: string;
  agentConfig?: AgentConfig;
}