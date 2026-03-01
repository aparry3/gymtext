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
 * Day names for matching headings in dossier sections.
 */
const DAY_NAMES = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

/**
 * Regex patterns for fence-based day delimiters.
 *
 * Open fence:  === MONDAY - February 23, 2026: Workout ===
 * Close fence: === END MONDAY ===
 */
const FENCE_OPEN_RE = /^=== ([A-Z]+) - .+ ===$/gm;
const FENCE_CLOSE_RE = (day: string) => new RegExp(`^=== END ${day} ===$`, 'm');

/**
 * Extracted fenced day content.
 */
interface FencedDay {
  /** Full block including open/close fences */
  full: string;
  /** Content between fences (excluding fence lines) */
  inner: string;
}

/**
 * Extract all fenced day blocks from dossier content.
 * Returns a map of DAYNAME → { full, inner }.
 */
export function extractFencedDays(content: string): Map<string, FencedDay> {
  const result = new Map<string, FencedDay>();

  // Find all open fences
  const openMatches: { day: string; index: number; line: string }[] = [];
  const openRe = /^(=== ([A-Z]+) - .+ ===)$/gm;
  let match;
  while ((match = openRe.exec(content)) !== null) {
    const day = match[2];
    if (DAY_NAMES.includes(day)) {
      openMatches.push({ day, index: match.index, line: match[1] });
    }
  }

  for (const open of openMatches) {
    const closeRe = FENCE_CLOSE_RE(open.day);
    const afterOpen = content.slice(open.index);
    const closeMatch = closeRe.exec(afterOpen);
    if (!closeMatch) continue;

    const fullEnd = open.index + closeMatch.index + closeMatch[0].length;
    const full = content.slice(open.index, fullEnd);
    const innerStart = open.line.length + 1; // +1 for newline after open fence
    const innerEnd = closeMatch.index;
    const inner = afterOpen.slice(innerStart, innerEnd).replace(/^\n|\n$/g, '');

    result.set(open.day, { full, inner });
  }

  return result;
}

/**
 * Check if content uses fence-based day delimiters.
 */
function hasFences(content: string): boolean {
  return /^=== [A-Z]+ - .+ ===$/m.test(content);
}

/**
 * Extract the day name from a dossier section heading (legacy support).
 * Supports: `# MONDAY - February 16, 2026: Workout`
 * and:      `# Workout — Monday, February 16, 2026`
 */
function extractDayName(section: string): string | null {
  const newMatch = section.match(/^# ([A-Z]+) -/m);
  if (newMatch && DAY_NAMES.includes(newMatch[1])) {
    return newMatch[1];
  }
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
 * Supports two formats:
 * 1. Fence-based: === DAYNAME - ... === / === END DAYNAME === (preferred)
 * 2. Legacy: \n---\n splitting with # DAYNAME headings (backward compat)
 */
export function mergeDossierWithOriginal(modified: string, original: string): string {
  // Try fence-based merge first
  if (hasFences(modified)) {
    return mergeFencedDossier(modified, original);
  }

  // Legacy: split on --- separators
  return mergeLegacyDossier(modified, original);
}

/**
 * Fence-based merge: extract fenced days from both modified and original,
 * replace [NO CHANGES] blocks with original content.
 */
function mergeFencedDossier(modified: string, original: string): string {
  const modifiedDays = extractFencedDays(modified);
  const originalDays = hasFences(original)
    ? extractFencedDays(original)
    : extractFencedDaysFromLegacy(original);

  let result = modified;

  for (const [day, modDay] of modifiedDays) {
    if (!modDay.inner.includes('[NO CHANGES]')) continue;

    const origDay = originalDays.get(day);
    if (origDay) {
      result = result.replace(modDay.full, origDay.full);
    }
  }

  return result;
}

/**
 * Build fenced day blocks from legacy --- separated content.
 * Used when original is in legacy format but modified uses fences.
 */
function extractFencedDaysFromLegacy(content: string): Map<string, FencedDay> {
  const result = new Map<string, FencedDay>();
  const sections = content.split(/\n---\n/);

  for (const section of sections) {
    const day = extractDayName(section);
    if (!day) continue;

    // Extract the date and type from the heading to build a proper fence
    const headingMatch = section.match(/^# [A-Z]+ - (.+)$/m);
    const dateAndType = headingMatch ? headingMatch[1] : 'Unknown';

    const openFence = `=== ${day} - ${dateAndType} ===`;
    const closeFence = `=== END ${day} ===`;
    const full = `${openFence}\n${section.trim()}\n${closeFence}`;
    result.set(day, { full, inner: section.trim() });
  }

  return result;
}

/**
 * Legacy merge: split on --- separators, match by day name headings.
 */
function mergeLegacyDossier(modified: string, original: string): string {
  const modifiedSections = modified.split(/\n---\n/);
  const originalSections = original.split(/\n---\n/);

  const originalByDay = new Map<string, string>();
  for (const section of originalSections) {
    const day = extractDayName(section);
    if (day) {
      originalByDay.set(day, section);
    }
  }

  const merged = modifiedSections.map((section) => {
    if (!section.includes('[NO CHANGES]')) {
      return section;
    }
    const day = extractDayName(section);
    if (day && originalByDay.has(day)) {
      return originalByDay.get(day)!;
    }
    return section;
  });

  return merged.join('\n---\n');
}

/**
 * Parse a dossier response that may contain a ```changes metadata block.
 *
 * If no changes block is found, assumes the entire response is a changed dossier
 * (backward-compatible fallback for agents that haven't been updated yet).
 */
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
