import type { AgentConfig } from '@/server/agents/base';
import type { PlanStructure } from '@/server/agents/training/schemas';

/**
 * Configuration for structured plan agent
 * Static configuration passed at agent creation time
 */
export interface StructuredPlanConfig {
  operationName?: string;
  agentConfig?: AgentConfig;
}

/**
 * Input for structured plan agent
 * Runtime context passed through the chain
 */
export interface StructuredPlanInput {
  fitnessPlan: string;
}

/**
 * Output from structured plan agent
 * Returns a structured PlanStructure object
 */
export type StructuredPlanOutput = PlanStructure;

// Re-export for convenience
export type { PlanStructure };
