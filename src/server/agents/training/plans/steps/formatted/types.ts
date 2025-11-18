import type { AgentConfig } from '@/server/agents/base';

/**
 * Configuration for formatted fitness plan agent
 */
export interface FormattedFitnessPlanConfig {
  operationName: string;
  agentConfig?: AgentConfig;
}
