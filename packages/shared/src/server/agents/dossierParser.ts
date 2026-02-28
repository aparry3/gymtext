/**
 * Dossier Response Parser
 *
 * Parses agent responses that use the ```changes metadata block format.
 * Modification agents return a changes block followed by the full dossier content.
 *
 * Format:
 * ```changes
 * {"changed": true, "summary": "Brief description of what changed"}
 * ```
 *
 * # Full dossier content follows...
 */

export interface DossierChanges {
  /** Whether the dossier was actually modified */
  changed: boolean;
  /** Human-readable summary of changes (for logging/tool results) */
  summary: string;
  /** The dossier markdown content (without the changes block) */
  dossierContent: string;
}

/**
 * Parse a dossier response that may contain a ```changes metadata block.
 *
 * If no changes block is found, assumes the entire response is a changed dossier
 * (backward-compatible fallback for agents that haven't been updated yet).
 *
 * @param response - Raw agent response text
 * @returns Parsed changes metadata and dossier content
 */
/**
 * Day names for matching headings in dossier sections.
 */
const DAY_NAMES = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

/**
 * Extract the day name from a dossier section heading.
 * Supports new format: `# MONDAY - February 16, 2026: Workout`
 * and legacy format: `# Workout — Monday, February 16, 2026`
 */
function extractDayName(section: string): string | null {
  // New format: # MONDAY - ...
  const newMatch = section.match(/^# ([A-Z]+) -/m);
  if (newMatch && DAY_NAMES.includes(newMatch[1])) {
    return newMatch[1];
  }
  // Legacy format: # Workout — Monday, ...
  const legacyMatch = section.match(/^# Workout — (\w+),/m);
  if (legacyMatch) {
    return legacyMatch[1].toUpperCase();
  }
  return null;
}

/**
 * Merge a modified dossier with the original, replacing [NO CHANGES] sections
 * with the corresponding day's content from the original dossier.
 *
 * @param modified - The modified dossier (may contain [NO CHANGES] markers)
 * @param original - The original dossier to pull unchanged days from
 * @returns Merged dossier content
 */
export function mergeDossierWithOriginal(modified: string, original: string): string {
  const modifiedSections = modified.split(/\n---\n/);
  const originalSections = original.split(/\n---\n/);

  // Build a map of day name → original section content
  const originalByDay = new Map<string, string>();
  for (const section of originalSections) {
    const day = extractDayName(section);
    if (day) {
      originalByDay.set(day, section);
    }
  }

  // Merge: replace [NO CHANGES] sections with originals
  const merged = modifiedSections.map((section) => {
    if (!section.includes('[NO CHANGES]')) {
      return section;
    }
    const day = extractDayName(section);
    if (day && originalByDay.has(day)) {
      return originalByDay.get(day)!;
    }
    // No matching original found — keep modified as-is
    return section;
  });

  return merged.join('\n---\n');
}

export function parseDossierResponse(response: string): DossierChanges {
  if (!response?.trim()) {
    return { changed: false, summary: '', dossierContent: '' };
  }

  const match = response.match(/```changes\n([\s\S]*?)\n```\n*([\s\S]*)/);
  if (!match) {
    // Fallback: no metadata block, assume changed (backward compat)
    return { changed: true, summary: 'Updated (no metadata)', dossierContent: response.trim() };
  }

  try {
    const meta = JSON.parse(match[1]);
    return {
      changed: meta.changed ?? true,
      summary: meta.summary ?? '',
      dossierContent: match[2].trim(),
    };
  } catch {
    // JSON parse failed — treat as changed
    return { changed: true, summary: 'Updated (parse error)', dossierContent: response.trim() };
  }
}
