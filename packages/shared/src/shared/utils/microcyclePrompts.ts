/**
 * Microcycle Prompt Formatting Utilities
 *
 * Pure formatting functions for agent prompts.
 * Used by both server agents and admin UI for consistency.
 */

import { DAY_NAMES } from './date';

export interface MicrocyclePromptInput {
  overview: string;
  days: string[];
  isDeload: boolean;
}

/**
 * Format microcycle data as input for the message agent
 */
export const formatMessageAgentInput = (input: MicrocyclePromptInput): string => {
  const daysFormatted = input.days
    .map((day, index) => `${DAY_NAMES[index]}:\n${day}`)
    .join('\n\n');

  return `
Generate a weekly breakdown SMS message based on the following structured microcycle pattern.

Focus on summarizing the week's training theme and providing a clear, easy-to-read breakdown of training days and rest days for the client.

WEEKLY OVERVIEW:
${input.overview}

IS DELOAD WEEK: ${input.isDeload}

DAILY BREAKDOWNS:

${daysFormatted}

Output only the message text (no JSON wrapper) as specified in your system instructions.
`.trim();
};

/**
 * Format microcycle data as input for the structured agent
 */
export const formatStructuredAgentInput = (
  overview: string,
  days: string[],
  absoluteWeek: number,
  isDeload: boolean
): string => `Parse the following microcycle into structured format:

Week Number: ${absoluteWeek}
Is Deload: ${isDeload}

Weekly Overview:
${overview}

Day Overviews:
${days.map((day, i) => `${DAY_NAMES[i]}: ${day}`).join('\n\n')}`;
