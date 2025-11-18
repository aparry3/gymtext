import type { AgentConfig } from '@/server/agents/base';

/**
 * Configuration for formatted microcycle agent
 */
export interface FormattedMicrocycleConfig {
  // Operation name for logging
  operationName: string;

  // Optional agent configuration (model, tokens, etc.)
  agentConfig?: AgentConfig;
}