/**
 * Experience Level Context Builder
 *
 * Provides language and content guidance for AI agents based on user experience level.
 * Snippets are stored in the prompts table and fetched dynamically.
 *
 * Used in two locations:
 * 1. Microcycle generation (weekly structure, intent, progression logic)
 * 2. Workout generation (daily exercises, cues, and communication style)
 *
 * Intent summary for each experience level:
 * - **Beginner:** Learn movements, build habits, stay confident
 * - **Intermediate:** Build strength and muscle with structure, without overwhelm
 * - **Advanced:** Optimize performance, manage fatigue, and pursue specific strength goals
 */

import { promptService } from '@/server/services/prompts/promptService';

// =============================================================================
// Types
// =============================================================================

/**
 * Types of context snippets available
 */
export enum SnippetType {
  MICROCYCLE = 'microcycle',
  WORKOUT = 'workout',
}

/**
 * User experience levels
 */
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

// =============================================================================
// Prompt ID Mapping
// =============================================================================

/**
 * Maps snippet type and experience level to prompt IDs in the database
 */
const EXPERIENCE_PROMPT_MAP: Record<SnippetType, Record<ExperienceLevel, string>> = {
  [SnippetType.MICROCYCLE]: {
    beginner: 'microcycle:generate:experience:beginner',
    intermediate: 'microcycle:generate:experience:intermediate',
    advanced: 'microcycle:generate:experience:advanced',
  },
  [SnippetType.WORKOUT]: {
    beginner: 'workout:generate:experience:beginner',
    intermediate: 'workout:generate:experience:intermediate',
    advanced: 'workout:generate:experience:advanced',
  },
};

// =============================================================================
// Fetch Function
// =============================================================================

/**
 * Fetch experience level snippet from database
 *
 * @param experienceLevel - User's experience level (beginner, intermediate, advanced)
 * @param snippetType - Type of snippet to return (microcycle or workout)
 * @returns The snippet content or null if not found
 */
export const fetchExperienceLevelSnippet = async (
  experienceLevel: ExperienceLevel | null | undefined,
  snippetType: SnippetType
): Promise<string | null> => {
  if (!experienceLevel) {
    return null;
  }

  const promptId = EXPERIENCE_PROMPT_MAP[snippetType]?.[experienceLevel];
  if (!promptId) {
    return null;
  }

  try {
    return await promptService.getContextPrompt(promptId);
  } catch (error) {
    console.warn(`[experienceLevel] Could not fetch snippet for ${experienceLevel}/${snippetType}:`, error);
    return null;
  }
};

// =============================================================================
// Builder Function
// =============================================================================

/**
 * Build experience level context string
 *
 * Formats the pre-fetched snippet with XML tags for agent context.
 *
 * @param snippet - The pre-fetched snippet content
 * @param experienceLevel - User's experience level (for XML attributes)
 * @param snippetType - Type of snippet (for XML attributes)
 * @returns Formatted context string with XML tags, or empty string if no snippet
 *
 * @example
 * ```typescript
 * const snippet = await fetchExperienceLevelSnippet('beginner', SnippetType.WORKOUT);
 * const context = buildExperienceLevelContext(snippet, 'beginner', SnippetType.WORKOUT);
 * // Returns: <ExperienceLevelContext level="beginner" type="workout">...</ExperienceLevelContext>
 * ```
 */
export const buildExperienceLevelContext = (
  snippet: string | null | undefined,
  experienceLevel: ExperienceLevel | null | undefined,
  snippetType: SnippetType
): string => {
  if (!snippet || !experienceLevel) {
    return '';
  }

  return `<ExperienceLevelContext level="${experienceLevel}" type="${snippetType}">
${snippet.trim()}
</ExperienceLevelContext>`;
};
