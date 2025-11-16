import { createRunnableAgent } from '@/server/agents/base';
import type { DaysExtractionConfig, DayOverviews } from './types';
import type { MicrocycleChainContext } from '../generation/chain';

/**
 * Days Extraction Agent
 *
 * Extracts individual day overviews from the long-form microcycle description
 * using regex parsing to find day headers (*** MONDAY - [Focus] ***) and
 * capture the content for each day.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that extracts day overviews from long-form description
 */
export const createDaysExtractionAgent = (config: DaysExtractionConfig) => {
  return createRunnableAgent<MicrocycleChainContext, DayOverviews>(async (input) => {
    const { longFormMicrocycle } = input;
    const description = longFormMicrocycle.description;

    // Regex to match day headers and capture content until next day header or section
    const dayPattern = /\*\*\*\s*(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\s*-\s*[^*]+\*\*\*([\s\S]*?)(?=\*\*\*\s*(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)|======================================|$)/gi;

    const dayOverviews: Partial<DayOverviews> = {};

    let match;
    while ((match = dayPattern.exec(description)) !== null) {
      const dayName = match[1].toLowerCase();
      const content = match[0].trim(); // Include the header and content

      // Map day name to field name
      const fieldName = `${dayName}Overview` as keyof DayOverviews;
      dayOverviews[fieldName] = content;
    }

    // Ensure all days are present (use empty string if not found)
    const result: DayOverviews = {
      mondayOverview: dayOverviews.mondayOverview || '',
      tuesdayOverview: dayOverviews.tuesdayOverview || '',
      wednesdayOverview: dayOverviews.wednesdayOverview || '',
      thursdayOverview: dayOverviews.thursdayOverview || '',
      fridayOverview: dayOverviews.fridayOverview || '',
      saturdayOverview: dayOverviews.saturdayOverview || '',
      sundayOverview: dayOverviews.sundayOverview || ''
    };

    console.log(`[${config.operationName}] Extracted overviews for all 7 days`);

    return result;
  });
};
