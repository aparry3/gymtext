/**
 * Microcycle Formatting Utilities
 *
 * Pure functions for formatting microcycle data into string representations
 * for use in prompts, messages, and other contexts.
 */

import type { MicrocyclePattern } from '@/server/models/microcycle/schema';

type StructuredDay = MicrocyclePattern['days'][number];

/**
 * Flexible day input type that accepts both full StructuredDay and partial day objects
 * Omits the strict enum from StructuredDay to allow any string for 'day'
 */
type DayInput = Omit<Partial<StructuredDay>, 'day' | 'theme'> & {
  day: string;
  theme: string;
};

/**
 * Format a structured microcycle day into a detailed string representation
 *
 * Converts all available structured fields into a human-readable format
 * suitable for LLM prompts and workout generation.
 *
 * @param day - Structured day object from microcycle pattern or partial day object
 * @returns Formatted multi-line string with all available day details
 *
 * @example
 * ```typescript
 * const formatted = formatMicrocycleDay({
 *   day: "MONDAY",
 *   theme: "Upper Strength",
 *   load: "heavy",
 *   intensity: { percent1RM: "75-85%", rir: "2-3" },
 *   // ... other fields
 * });
 * // Returns:
 * // Day: MONDAY
 * // Theme: Upper Strength
 * // Load Level: heavy
 * // ...
 * ```
 */
export function formatMicrocycleDay(day: DayInput): string {
  const sections: string[] = [];

  // Day and theme (always present)
  sections.push(`Day: ${day.day}`);
  sections.push(`Theme: ${day.theme}`);

  // Load level
  if (day.load) {
    sections.push(`Load Level: ${day.load}`);
  }

  // Session focus
  if (day.sessionFocus) {
    sections.push(`Focus: ${day.sessionFocus}`);
  }

  // Primary muscle groups
  if (day.primaryMuscleGroups && day.primaryMuscleGroups.length > 0) {
    sections.push(`Primary Muscles: ${day.primaryMuscleGroups.join(', ')}`);
  }

  // Secondary muscle groups
  if (day.secondaryMuscleGroups && day.secondaryMuscleGroups.length > 0) {
    sections.push(`Secondary Muscles: ${day.secondaryMuscleGroups.join(', ')}`);
  }

  // Intensity guidance
  if (day.intensity) {
    const intensityParts: string[] = [];
    if (day.intensity.percent1RM) {
      intensityParts.push(`${day.intensity.percent1RM} 1RM`);
    }
    if (day.intensity.rir) {
      intensityParts.push(`RIR ${day.intensity.rir}`);
    }
    if (intensityParts.length > 0) {
      sections.push(`Intensity: ${intensityParts.join(', ')}`);
    }
  }

  // Volume target
  if (day.volumeTarget) {
    const volumeParts: string[] = [];
    if (day.volumeTarget.setsPerMuscle) {
      volumeParts.push(day.volumeTarget.setsPerMuscle);
    }
    if (day.volumeTarget.totalSetsEstimate) {
      volumeParts.push(`~${day.volumeTarget.totalSetsEstimate} total sets`);
    }
    if (volumeParts.length > 0) {
      sections.push(`Volume: ${volumeParts.join(', ')}`);
    }
  }

  // Conditioning
  if (day.conditioning) {
    sections.push(`Conditioning: ${day.conditioning}`);
  }

  // Session duration
  if (day.sessionDuration) {
    sections.push(`Duration: ${day.sessionDuration}`);
  }

  // Notes (coaching cues, recovery reminders, etc.)
  if (day.notes) {
    sections.push(`Notes: ${day.notes}`);
  }

  return sections.join('\n');
}
