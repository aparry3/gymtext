import { z } from 'zod';
import type { AgentConfig } from '@/server/agents/base';

/**
 * Configuration for formatted mesocycle agent
 */
export interface FormattedMesocycleConfig {
  schema: z.ZodTypeAny;
  operationName: string;
  agentConfig?: AgentConfig;
}

/**
 * Output from the formatted mesocycle agent
 */
export type FormattedMesocycleOutput<TMesocycle = unknown> = TMesocycle;
