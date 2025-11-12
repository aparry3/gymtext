import { z } from 'zod';
import type { AgentConfig } from '@/server/agents/base';

/**
 * Configuration for formatted workout agent
 */
export interface FormattedWorkoutConfig {
  // Schema to use for validation
  schema: z.ZodTypeAny;

  // Whether to include modificationsApplied field
  includeModifications?: boolean;

  // Operation name for logging
  operationName: string;

  // Optional agent configuration (model, tokens, etc.)
  agentConfig?: AgentConfig;
}

/**
 * Output from formatted workout agent
 */
export type FormattedWorkoutOutput<TWorkout> = TWorkout & { date: Date };
