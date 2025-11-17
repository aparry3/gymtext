import { z } from 'zod';
import type { AgentConfig } from '@/server/agents/base';

/**
 * Configuration for formatted mesocycle agent
 */
export interface FormattedMesocycleConfig {
  operationName: string;
  agentConfig?: AgentConfig;
}

/**
 * Output from the formatted mesocycle agent
 */
export type FormattedMesocycleOutput<TMesocycle = unknown> = TMesocycle;
