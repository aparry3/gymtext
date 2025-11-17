import { z } from 'zod';
import type { AgentConfig } from '@/server/agents/base';

/**
 * Configuration for formatted microcycle agent
 */
export interface FormattedMicrocycleConfig {
  // Schema to use for validation
  schema: z.ZodTypeAny;

  // Operation name for logging
  operationName: string;

  // Optional agent configuration (model, tokens, etc.)
  agentConfig?: AgentConfig;
}

/**
 * Output from formatted microcycle agent
 */
export type FormattedMicrocycleOutput<TMicrocycle> = TMicrocycle;
