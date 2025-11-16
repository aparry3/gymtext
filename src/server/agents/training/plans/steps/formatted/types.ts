import { z } from 'zod';
import type { AgentConfig } from '@/server/agents/base';

/**
 * Configuration for formatted fitness plan agent
 */
export interface FormattedFitnessPlanConfig {
  schema: z.ZodTypeAny;
  operationName: string;
  agentConfig?: AgentConfig;
}

/**
 * Output from the formatted fitness plan agent
 */
export type FormattedFitnessPlanOutput<TFitnessPlan = unknown> = TFitnessPlan;
