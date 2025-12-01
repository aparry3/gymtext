import type { MicrocycleGenerationInput } from '../types';
import type { MicrocycleGenerationOutput } from '../operations/generate/steps/generation/types';

/**
 * Schema for structured microcycle generation output
 * Re-exported from operations/generate/steps/generation for shared access
 */
export type { MicrocycleGenerationOutput } from '../operations/generate/steps/generation/types';
export { MicrocycleGenerationOutputSchema } from '../operations/generate/steps/generation/types';

/**
 * Context that flows through the microcycle chain
 * Used by both generate and modify operations
 */
export interface MicrocycleChainContext extends MicrocycleGenerationInput {
  microcycle: MicrocycleGenerationOutput;
  // Optional fields added by modify operation
  wasModified?: boolean;
  modifications?: string;
}
