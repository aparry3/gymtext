/**
 * Microcycles Prompts - Template functions for microcycle generation and modification
 *
 * NOTE: System prompt string constants have been removed.
 * Runtime prompts are fetched from the database via PROMPT_IDS.
 * Zod schemas are in schemas/microcycles.ts.
 */

import {
  formatMessageAgentInput,
  formatStructuredAgentInput,
  type MicrocyclePromptInput
} from '@/shared/utils/microcyclePrompts';
import type { MicrocycleGenerationOutput } from '../schemas/microcycles';

// Re-export types for backwards compatibility
export type { MicrocyclePromptInput };

// =============================================================================
// Message Template Functions
// =============================================================================

/**
 * Format microcycle for message agent
 * Wraps the shared formatMessageAgentInput to accept MicrocycleGenerationOutput
 */
export const microcycleMessageUserPrompt = (microcycle: MicrocycleGenerationOutput): string => {
  return formatMessageAgentInput({
    overview: microcycle.overview,
    days: microcycle.days,
    isDeload: microcycle.isDeload
  });
};

// =============================================================================
// Structured Template Functions
// =============================================================================

/**
 * Format microcycle for structured parsing agent
 * Re-exports the shared function for backwards compatibility
 */
export const structuredMicrocycleUserPrompt = formatStructuredAgentInput;
