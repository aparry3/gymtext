/**
 * Experience Level Context Builder
 *
 * Provides language and content guidance for AI agents based on user experience level.
 * These snippets help ensure generated content matches the user's fitness knowledge level.
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
// Beginner Snippets
// =============================================================================

const BEGINNER_MICROCYCLE_SNIPPET = `
- Use **simple, everyday language only**.
  - Say **"building strength"** and **"building muscle/size"** instead of hypertrophy.
  - Say **"slowly getting stronger week to week"** instead of progressive overload.
- Keep weekly structure **simple and repetitive**.
  - Favor full-body, upper/lower, or very simple splits.
  - Avoid hybrid or multi-focus splits unless explicitly requested.
- Emphasize **learning movement patterns**, not chasing numbers.
- Prioritize **main compound lifts**:
  - Squat or leg press
  - Hinge (deadlift or hip hinge)
  - Push (bench / push-up / machine press)
  - Pull (row / lat pulldown)
- Limit total weekly exercise variety.
  - Avoid specialty bars, complex variations, unilateral overload, or stability-focused movements.
- Progress conservatively:
  - Small weight increases or 1 extra rep *only if all reps feel controlled*.
- Avoid phases, blocks, deload terminology, or conditioning zones.
- Cardio is described as **"easy cardio"** or **"short conditioning"**, not Zone 2 or intervals.
`;

const BEGINNER_WORKOUT_SNIPPET = `
- Write workouts like **a coach standing next to the lifter**.
- Focus on:
  - Sets
  - Reps
  - Rest time
  - How hard the set should feel
- Use effort cues such as:
  - "You should feel like you could do 1-3 more reps"
  - "Stop the set if your form breaks down"
- Avoid:
  - RIR / RPE
  - Tempo notation
  - Percentages of max
  - Advanced intensity techniques
- Structure each workout as:
  - 1 main lift
  - 1-2 supporting lifts
  - 1-2 simple accessories (optional)
- Include brief setup and form cues.
- Encourage confidence, consistency, and habit-building over optimization.
`;

// =============================================================================
// Intermediate Snippets
// =============================================================================

const INTERMEDIATE_MICROCYCLE_SNIPPET = `
- Use **mostly plain language**, with light exposure to standard training terms.
  - "Muscle growth (hypertrophy)" may appear once, then simplified afterward.
- Allow more structure and variety while staying readable.
- Weekly split can include:
  - Upper / Lower
  - Push / Pull / Legs
  - Simple strength + muscle-building hybrids
- Clearly state the **purpose of each day**:
  - Strength-focused
  - Muscle-building
  - Conditioning or recovery
- Introduce basic progression strategies:
  - Adding reps within a range
  - Small load increases
- Manage fatigue without heavy theory.
  - Occasional lighter weeks are implied, not over-explained.
- Conditioning may reference effort levels, but avoid technical zones unless requested.
`;

const INTERMEDIATE_WORKOUT_SNIPPET = `
- Exercises can include:
  - Secondary variations
  - Targeted accessories (rear delts, hamstrings, calves, arms)
- Supersets and pairings are allowed when they improve efficiency.
- Effort guidance may include optional clarification:
  - "Finish with 1-2 reps left (RIR 1-2)"
- Tempo or pauses may be used sparingly and explained in plain terms.
- Structure workouts clearly:
  - Main lift
  - Secondary lift
  - Accessories that support the day's goal
- Offer simple autoregulation:
  - "If you feel strong today, add a set"
  - "If fatigue is high, reduce volume slightly"
`;

// =============================================================================
// Advanced Snippets
// =============================================================================

const ADVANCED_MICROCYCLE_SNIPPET = `
- Assume full fluency with training concepts:
  - Hypertrophy, volume, intensity, RIR/RPE, deloads, conditioning zones
- Hybrid splits (e.g., Upper/Lower Strength + PPL Hypertrophy) are appropriate.
- Weekly structure should clearly separate:
  - Heavy strength exposures
  - Volume / hypertrophy accumulation
  - Recovery or lighter days
- Progression must be explicit:
  - Load targets
  - Rep goals
  - Top sets + back-offs
  - Double progression where appropriate
- Fatigue management is intentional:
  - Planned deloads
  - Anchor-aware adjustments (e.g., cycle class interference)
- Exercise selection may include:
  - Specialty bars
  - Tempo work
  - Unilateral loading
  - Stability or weak-point emphasis
`;

const ADVANCED_WORKOUT_SNIPPET = `
- Communicate with precision and intent.
- Include:
  - RIR or RPE targets
  - Rest times
  - Tempo prescriptions when relevant
- Advanced methods are acceptable when justified:
  - Top sets + back-offs
  - Clusters
  - Myo-reps
  - Intensity techniques
- Accessories may target:
  - Weak links
  - Stabilizers
  - Joint health / prehab
- Provide clear autoregulation paths:
  - Adjust volume or intensity based on readiness
  - Maintain movement patterns even on low-performance days
- Language should match an experienced lifter chasing specific performance outcomes.
`;

// =============================================================================
// Snippet Map
// =============================================================================

/**
 * All experience level snippets organized by level and type
 */
export const EXPERIENCE_SNIPPETS: Record<ExperienceLevel, Record<SnippetType, string>> = {
  beginner: {
    [SnippetType.MICROCYCLE]: BEGINNER_MICROCYCLE_SNIPPET,
    [SnippetType.WORKOUT]: BEGINNER_WORKOUT_SNIPPET,
  },
  intermediate: {
    [SnippetType.MICROCYCLE]: INTERMEDIATE_MICROCYCLE_SNIPPET,
    [SnippetType.WORKOUT]: INTERMEDIATE_WORKOUT_SNIPPET,
  },
  advanced: {
    [SnippetType.MICROCYCLE]: ADVANCED_MICROCYCLE_SNIPPET,
    [SnippetType.WORKOUT]: ADVANCED_WORKOUT_SNIPPET,
  },
};

// =============================================================================
// Builder Function
// =============================================================================

/**
 * Build experience level context string
 *
 * Provides language and content guidance for AI agents based on user experience level.
 * Different snippets are used for microcycle vs workout generation.
 *
 * @param experienceLevel - User's experience level (beginner, intermediate, advanced)
 * @param snippetType - Type of snippet to return (microcycle or workout)
 * @returns Formatted context string with XML tags, or empty string if no level provided
 *
 * @example
 * ```typescript
 * const context = buildExperienceLevelContext('beginner', SnippetType.WORKOUT);
 * // Returns: <ExperienceLevelContext level="beginner" type="workout">...</ExperienceLevelContext>
 * ```
 */
export const buildExperienceLevelContext = (
  experienceLevel: ExperienceLevel | null | undefined,
  snippetType: SnippetType
): string => {
  if (!experienceLevel) {
    return '';
  }

  const snippet = EXPERIENCE_SNIPPETS[experienceLevel]?.[snippetType];
  if (!snippet) {
    return '';
  }

  return `<ExperienceLevelContext level="${experienceLevel}" type="${snippetType}">
${snippet.trim()}
</ExperienceLevelContext>`;
};
