import { createRunnableAgent } from '@/server/agents/base';
import type { MesocycleExtractorConfig } from './types';
import type { FitnessPlanChainContext } from '../generation/types';

/**
 * Mesocycle Extractor
 *
 * Extracts mesocycle overview strings from long-form fitness plan descriptions.
 * Uses delimiter-based string parsing to extract each mesocycle section.
 *
 * @param config - Configuration for the extractor
 * @returns Agent (runnable) that extracts mesocycle strings from plan description
 */
export const createMesocycleExtractor = (config: MesocycleExtractorConfig) => {
  return createRunnableAgent<FitnessPlanChainContext, string[]>(async (input) => {
    const { longFormPlan } = input;
    const description = longFormPlan;

    // Extract mesocycles using delimiter pattern: "--- MESOCYCLE N: [Name] ---"
    const mesocyclePattern = /--- MESOCYCLE \d+:.*?---/gi;
    const mesocycles: string[] = [];

    // Find all mesocycle delimiters
    const matches = [...description.matchAll(mesocyclePattern)];

    if (matches.length === 0) {
      console.warn(`[${config.operationName}] No mesocycle delimiters found in plan description`);
      return [];
    }

    // Extract content between delimiters
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];

      const startIndex = currentMatch.index! + currentMatch[0].length;
      const endIndex = nextMatch ? nextMatch.index! : description.length;

      const mesocycleContent = description.slice(startIndex, endIndex).trim();
      mesocycles.push(mesocycleContent);
    }

    console.log(`[${config.operationName}] Extracted ${mesocycles.length} mesocycles from plan description`);

    return mesocycles;
  });
};
