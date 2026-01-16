/**
 * Microcycles Prompts - Template functions for microcycle generation and modification
 *
 * NOTE: System prompt string constants have been removed.
 * Runtime prompts are fetched from the database via PROMPT_IDS.
 * Zod schemas are in schemas/microcycles.ts.
 */

import { DAY_NAMES } from '@/shared/utils/date';
import type { MicrocycleGenerationOutput } from '../schemas/microcycles';

// =============================================================================
// Message Template Functions
// =============================================================================

export const microcycleMessageUserPrompt = (microcycle: MicrocycleGenerationOutput) => {
  const daysFormatted = microcycle.days
    .map((day, index) => `${DAY_NAMES[index]}:\n${day}`)
    .join('\n\n');

  return `
Generate a weekly breakdown SMS message based on the following structured microcycle pattern.

Focus on summarizing the week's training theme and providing a clear, easy-to-read breakdown of training days and rest days for the client.

WEEKLY OVERVIEW:
${microcycle.overview}

IS DELOAD WEEK: ${microcycle.isDeload}

DAILY BREAKDOWNS:

${daysFormatted}

Output only the message text (no JSON wrapper) as specified in your system instructions.
`.trim();
};

// =============================================================================
// Structured Template Functions
// =============================================================================

export const structuredMicrocycleUserPrompt = (
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
${days.map((day, i) => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return `${dayNames[i]}: ${day}`;
}).join('\n\n')}`;
