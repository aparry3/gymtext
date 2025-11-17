import { createRunnableAgent } from '@/server/agents/base';
import type { DaysExtractionConfig, DaysExtractionOutput, DayOverviews } from './types';
import type { MicrocycleChainContext } from '../generation/types';

/**
 * Days Extraction Agent
 *
 * Extracts individual day overviews from the long-form microcycle description
 * using regex parsing to find day headers (*** MONDAY - [Focus] ***) and
 * capture the content for each day. Also detects if this is a deload week.
 *
 * @param config - Static configuration for the agent
 * @returns Agent (runnable) that extracts day overviews and isDeload flag from long-form description
 */
export const createDaysExtractionAgent = (config: DaysExtractionConfig) => {
  return createRunnableAgent<MicrocycleChainContext, DaysExtractionOutput>(async (input) => {
    const { longFormMicrocycle } = input;
    const description = longFormMicrocycle.description;

    // Regex to match day headers and capture content until next day header or section
    const dayPattern = /\*\*\*\s*(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\s*-\s*[^*]+\*\*\*([\s\S]*?)(?=\*\*\*\s*(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)|======================================|$)/gi;

    const dayOverviews: Partial<DayOverviews> = {};
    let matchCount = 0;

    let match;
    while ((match = dayPattern.exec(description)) !== null) {
      const dayName = match[1].toLowerCase();
      const content = match[0].trim(); // Include the header and content

      // Map day name to field name
      const fieldName = `${dayName}Overview` as keyof DayOverviews;
      dayOverviews[fieldName] = content;
      matchCount++;
    }

    // Validate that day headers were found
    if (matchCount === 0) {
      console.error(`[${config.operationName}] ERROR: No day headers found in microcycle description!`);
      console.error('Expected format: *** MONDAY - <Session Type> ***');
      console.error('Description preview:', description.substring(0, 500));
      throw new Error(
        `Day extraction failed: No day headers found in microcycle description. ` +
        `Expected headers like "*** MONDAY - <Session Type> ***" but none were detected. ` +
        `The LLM may not be following the prompt instructions to generate the DAY-BY-DAY BREAKDOWN section.`
      );
    }

    if (matchCount < 7) {
      console.warn(`[${config.operationName}] WARNING: Only found ${matchCount}/7 day headers in description. This will trigger a retry.`);
    }

    // Detect if this is a deload week by checking for the explicit *** DELOAD WEEK *** marker
    // This marker is required to appear at the top of WEEKLY OVERVIEW section for deload weeks
    const isDeload = /\*\*\*\s*DELOAD WEEK\s*\*\*\*/i.test(description);

    // Ensure all days are present (use empty string if not found)
    const result: DaysExtractionOutput = {
      mondayOverview: dayOverviews.mondayOverview || '',
      tuesdayOverview: dayOverviews.tuesdayOverview || '',
      wednesdayOverview: dayOverviews.wednesdayOverview || '',
      thursdayOverview: dayOverviews.thursdayOverview || '',
      fridayOverview: dayOverviews.fridayOverview || '',
      saturdayOverview: dayOverviews.saturdayOverview || '',
      sundayOverview: dayOverviews.sundayOverview || '',
      isDeload
    };

    console.log(`[${config.operationName}] Extracted ${matchCount}/7 day overviews, isDeload=${isDeload}`);

    return result;
  });
};
