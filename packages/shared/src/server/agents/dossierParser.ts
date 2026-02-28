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
