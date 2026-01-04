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
/**
 * Types of context snippets available
 */
export declare enum SnippetType {
    MICROCYCLE = "microcycle",
    WORKOUT = "workout"
}
/**
 * User experience levels
 */
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
/**
 * Fetch experience level snippet from database
 *
 * @param experienceLevel - User's experience level (beginner, intermediate, advanced)
 * @param snippetType - Type of snippet to return (microcycle or workout)
 * @returns The snippet content or null if not found
 */
export declare const fetchExperienceLevelSnippet: (experienceLevel: ExperienceLevel | null | undefined, snippetType: SnippetType) => Promise<string | null>;
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
export declare const buildExperienceLevelContext: (snippet: string | null | undefined, experienceLevel: ExperienceLevel | null | undefined, snippetType: SnippetType) => string;
//# sourceMappingURL=experienceLevel.d.ts.map