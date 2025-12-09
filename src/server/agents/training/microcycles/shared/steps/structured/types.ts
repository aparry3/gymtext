import type { AgentConfig } from '@/server/agents/base';
import type { MicrocycleStructure } from '@/server/agents/training/schemas';

/**
 * Configuration for structured microcycle agent
 * Static configuration passed at agent creation time
 */
export interface StructuredMicrocycleConfig {
  operationName?: string;
  agentConfig?: AgentConfig;
}

/**
 * Input for structured microcycle agent
 * Runtime context passed through the chain
 */
export interface StructuredMicrocycleInput {
  overview: string;
  days: string[];
  absoluteWeek: number;
  isDeload: boolean;
}

/**
 * Output from structured microcycle agent
 * Returns a structured MicrocycleStructure object
 */
export type StructuredMicrocycleOutput = MicrocycleStructure;

// Re-export for convenience
export type { MicrocycleStructure };
