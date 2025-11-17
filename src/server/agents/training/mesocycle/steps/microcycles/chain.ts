import { createRunnableAgent } from '@/server/agents/base';
import type { MicrocycleExtractorConfig } from './types';
import type { MesocycleChainContext } from '../generation/types';

/**
 * Microcycle Extractor
 *
 * Extracts microcycle overview strings from long-form mesocycle descriptions.
 * Uses delimiter-based string parsing to extract each weekly microcycle section.
 *
 * @param config - Configuration for the extractor
 * @returns Agent (runnable) that extracts microcycle strings from mesocycle description
 */
export const createMicrocycleExtractor = (config: MicrocycleExtractorConfig) => {
  return createRunnableAgent<MesocycleChainContext, string[]>(async (input) => {
    const { longFormMesocycle } = input;
    const description = longFormMesocycle.description;

    // Extract microcycles using delimiter pattern: "***** MICROCYCLE N: Week N - [Theme] *****"
    const microcyclePattern = /\*\*\*\*\* MICROCYCLE \d+:.*?\*\*\*\*\*/gi;
    const microcycles: string[] = [];

    // Find all microcycle delimiters
    const matches = [...description.matchAll(microcyclePattern)];

    if (matches.length === 0) {
      console.warn(`[${config.operationName}] No microcycle delimiters found in mesocycle description`);
      return [];
    }

    // Extract content between delimiters
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];

      const startIndex = currentMatch.index! + currentMatch[0].length;
      const endIndex = nextMatch ? nextMatch.index! : description.length;

      const microcycleContent = description.slice(startIndex, endIndex).trim();
      microcycles.push(microcycleContent);
    }

    console.log(`[${config.operationName}] Extracted ${microcycles.length} microcycles from mesocycle description`);

    return microcycles;
  });
};
