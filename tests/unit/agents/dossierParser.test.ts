import { describe, it, expect } from 'vitest';
import {
  parseDossierResponse,
  mergeDossierWithOriginal,
  extractFencedDays,
} from '../../../packages/shared/src/server/agents/dossierParser';

describe('parseDossierResponse', () => {
  it('parses a valid changes block with content', () => {
    const response = `\`\`\`changes
{"changed": true, "summary": "Moved legs to Wednesday"}
\`\`\`

# Week 5 — Mesocycle 2
Some dossier content here.`;

    const result = parseDossierResponse(response);
    expect(result.changed).toBe(true);
    expect(result.summary).toBe('Moved legs to Wednesday');
    expect(result.dossierContent).toBe('# Week 5 — Mesocycle 2\nSome dossier content here.');
  });

  it('parses a no-change response', () => {
    const response = `\`\`\`changes
{"changed": false, "summary": "No changes needed"}
\`\`\`

# Week 5 — Mesocycle 2
Same content as before.`;

    const result = parseDossierResponse(response);
    expect(result.changed).toBe(false);
    expect(result.summary).toBe('No changes needed');
    expect(result.dossierContent).toContain('Week 5');
  });

  it('falls back gracefully when no changes block is present', () => {
    const response = '# Week 5 — Mesocycle 2\nJust a plain dossier.';
    const result = parseDossierResponse(response);
    expect(result.changed).toBe(true);
    expect(result.summary).toBe('Updated (no metadata)');
    expect(result.dossierContent).toBe(response);
  });

  it('handles empty response', () => {
    const result = parseDossierResponse('');
    expect(result.changed).toBe(false);
    expect(result.dossierContent).toBe('');
  });

  it('handles null/undefined response', () => {
    const result = parseDossierResponse(null as unknown as string);
    expect(result.changed).toBe(false);
    expect(result.dossierContent).toBe('');
  });

  it('handles malformed JSON in changes block', () => {
    const response = `\`\`\`changes
{not valid json}
\`\`\`

# Some content`;

    const result = parseDossierResponse(response);
    expect(result.changed).toBe(true);
    expect(result.summary).toBe('Updated (parse error)');
  });

  it('defaults changed to true when field is missing', () => {
    const response = `\`\`\`changes
{"summary": "Something changed"}
\`\`\`

# Content`;

    const result = parseDossierResponse(response);
    expect(result.changed).toBe(true);
    expect(result.summary).toBe('Something changed');
  });
});

describe('extractFencedDays', () => {
  it('extracts fenced day blocks', () => {
    const content = [
      '# Microcycle — Week of February 23, 2026',
      '',
      '=== MONDAY - February 23, 2026: Workout ===',
      '# MONDAY - February 23, 2026: Workout',
      '### 1. Bench Press',
      '**Target:** 4 × 5 @ 155 lbs',
      '=== END MONDAY ===',
      '',
      '=== WEDNESDAY - February 25, 2026: Workout ===',
      '# WEDNESDAY - February 25, 2026: Workout',
      '### 1. Squat',
      '**Target:** 4 × 5 @ 225 lbs',
      '=== END WEDNESDAY ===',
    ].join('\n');

    const days = extractFencedDays(content);
    expect(days.size).toBe(2);
    expect(days.has('MONDAY')).toBe(true);
    expect(days.has('WEDNESDAY')).toBe(true);
    expect(days.get('MONDAY')!.inner).toContain('Bench Press');
    expect(days.get('WEDNESDAY')!.inner).toContain('Squat');
  });

  it('returns empty map when no fences found', () => {
    const content = '# Just a plain heading\nNo fences here.';
    const days = extractFencedDays(content);
    expect(days.size).toBe(0);
  });

  it('handles missing close fence gracefully', () => {
    const content = [
      '=== MONDAY - February 23, 2026: Workout ===',
      '# MONDAY - February 23, 2026: Workout',
      '### 1. Bench Press',
      // No close fence
    ].join('\n');

    const days = extractFencedDays(content);
    expect(days.size).toBe(0);
  });
});

describe('mergeDossierWithOriginal', () => {
  // --- Fence-based tests ---

  const fencedOriginal = [
    '# Microcycle — Week of February 23, 2026',
    '',
    '**Program:** Strength',
    '**Phase:** Build',
    '',
    '=== MONDAY - February 23, 2026: Workout ===',
    '# MONDAY - February 23, 2026: Workout',
    '**Focus:** Upper',
    '',
    '### 1. Bench Press',
    '**Target:** 4 × 5 @ 155 lbs',
    '=== END MONDAY ===',
    '',
    '=== TUESDAY - February 24, 2026: Rest ===',
    '# TUESDAY - February 24, 2026: Rest',
    'Rest day.',
    '=== END TUESDAY ===',
    '',
    '=== WEDNESDAY - February 25, 2026: Workout ===',
    '# WEDNESDAY - February 25, 2026: Workout',
    '**Focus:** Lower',
    '',
    '### 1. Squat',
    '**Target:** 4 × 5 @ 225 lbs',
    '=== END WEDNESDAY ===',
    '',
    '=== FRIDAY - February 27, 2026: Workout ===',
    '# FRIDAY - February 27, 2026: Workout',
    '**Focus:** Full Body',
    '',
    '### 1. Deadlift',
    '**Target:** 3 × 5 @ 275 lbs',
    '=== END FRIDAY ===',
    '',
    '## Weekly Summary',
    '- Good week overall.',
  ].join('\n');

  it('merges [NO CHANGES] fenced sections with originals', () => {
    const modified = [
      '# Microcycle — Week of February 23, 2026',
      '',
      '**Program:** Strength',
      '**Phase:** Build',
      '',
      '=== MONDAY - February 23, 2026: Workout ===',
      '[NO CHANGES]',
      '=== END MONDAY ===',
      '',
      '=== TUESDAY - February 24, 2026: Rest ===',
      '[NO CHANGES]',
      '=== END TUESDAY ===',
      '',
      '=== WEDNESDAY - February 25, 2026: Workout ===',
      '# WEDNESDAY - February 25, 2026: Workout',
      '**Focus:** Lower',
      '',
      '### 1. ~~Squat~~ → Front Squat',
      '**Target:** 4 × 5 @ 185 lbs',
      '=== END WEDNESDAY ===',
      '',
      '=== FRIDAY - February 27, 2026: Workout ===',
      '[NO CHANGES]',
      '=== END FRIDAY ===',
      '',
      '## Weekly Summary',
      '- Modified Wednesday.',
    ].join('\n');

    const result = mergeDossierWithOriginal(modified, fencedOriginal);

    // Monday should be restored from original
    expect(result).toContain('### 1. Bench Press');
    expect(result).toContain('**Target:** 4 × 5 @ 155 lbs');

    // Wednesday should keep modification
    expect(result).toContain('~~Squat~~ → Front Squat');
    expect(result).toContain('**Target:** 4 × 5 @ 185 lbs');

    // Friday should be restored from original
    expect(result).toContain('### 1. Deadlift');
    expect(result).toContain('**Target:** 3 × 5 @ 275 lbs');

    // Should NOT contain [NO CHANGES] markers
    expect(result).not.toContain('[NO CHANGES]');
  });

  it('passes through fully modified fenced days', () => {
    const modified = [
      '# Microcycle — Week of February 23, 2026',
      '',
      '=== MONDAY - February 23, 2026: Workout ===',
      '# MONDAY - February 23, 2026: Workout',
      '**Focus:** Push',
      '',
      '### 1. OHP',
      '**Target:** 3 × 8',
      '=== END MONDAY ===',
    ].join('\n');

    const result = mergeDossierWithOriginal(modified, fencedOriginal);
    expect(result).toContain('### 1. OHP');
    expect(result).not.toContain('Bench Press');
  });

  it('handles fence-modified with legacy original (cross-format merge)', () => {
    const legacyOriginal = [
      '# Microcycle — Week of February 23, 2026',
      '# MONDAY - February 23, 2026: Workout\n**Focus:** Upper\n\n### 1. Bench Press\n**Target:** 4 × 5 @ 155 lbs',
      '# WEDNESDAY - February 25, 2026: Workout\n**Focus:** Lower\n\n### 1. Squat\n**Target:** 4 × 5 @ 225 lbs',
    ].join('\n---\n');

    const modified = [
      '# Microcycle — Week of February 23, 2026',
      '',
      '=== MONDAY - February 23, 2026: Workout ===',
      '[NO CHANGES]',
      '=== END MONDAY ===',
      '',
      '=== WEDNESDAY - February 25, 2026: Workout ===',
      '# WEDNESDAY - February 25, 2026: Workout',
      '**Focus:** Lower',
      '',
      '### 1. Front Squat',
      '**Target:** 3 × 8',
      '=== END WEDNESDAY ===',
    ].join('\n');

    const result = mergeDossierWithOriginal(modified, legacyOriginal);

    // Monday restored from legacy original
    expect(result).toContain('Bench Press');
    expect(result).not.toContain('[NO CHANGES]');

    // Wednesday keeps modification
    expect(result).toContain('Front Squat');
  });

  it('handles missing day in original gracefully (fenced)', () => {
    const modified = [
      '=== SATURDAY - February 28, 2026: Workout ===',
      '[NO CHANGES]',
      '=== END SATURDAY ===',
    ].join('\n');

    const result = mergeDossierWithOriginal(modified, fencedOriginal);
    // Saturday doesn't exist in original, so marker stays
    expect(result).toContain('[NO CHANGES]');
  });

  it('handles no [NO CHANGES] markers (full fenced output)', () => {
    const fullModified = [
      '=== MONDAY - February 23, 2026: Workout ===',
      '# MONDAY - February 23, 2026: Workout',
      '### 1. Incline Bench',
      '**Target:** 4 × 8',
      '=== END MONDAY ===',
    ].join('\n');

    const result = mergeDossierWithOriginal(fullModified, fencedOriginal);
    expect(result).toBe(fullModified);
  });

  // --- Legacy backward compatibility tests ---

  const legacyOriginalDossier = [
    '# Microcycle — Week of February 23, 2026\n\n**Program:** Strength\n**Phase:** Build',
    '# MONDAY - February 23, 2026: Workout\n**Focus:** Upper\n\n### 1. Bench Press\n**Target:** 4 × 5 @ 155 lbs',
    '# TUESDAY - February 24, 2026: Rest\nRest day.',
    '# WEDNESDAY - February 25, 2026: Workout\n**Focus:** Lower\n\n### 1. Squat\n**Target:** 4 × 5 @ 225 lbs',
    '# THURSDAY - February 26, 2026: Rest\nRest day.',
    '# FRIDAY - February 27, 2026: Workout\n**Focus:** Full Body\n\n### 1. Deadlift\n**Target:** 3 × 5 @ 275 lbs',
    '## Weekly Summary\n- Good week overall.',
  ].join('\n---\n');

  it('legacy: merges [NO CHANGES] sections with originals', () => {
    const modified = [
      '# Microcycle — Week of February 23, 2026\n\n**Program:** Strength\n**Phase:** Build',
      '# MONDAY - February 23, 2026: Workout\n[NO CHANGES]',
      '# TUESDAY - February 24, 2026: Rest\n[NO CHANGES]',
      '# WEDNESDAY - February 25, 2026: Workout\n**Focus:** Lower\n\n### 1. ~~Squat~~ → Front Squat\n**Target:** 4 × 5 @ 185 lbs',
      '# THURSDAY - February 26, 2026: Rest\n[NO CHANGES]',
      '# FRIDAY - February 27, 2026: Workout\n[NO CHANGES]',
      '## Weekly Summary\n- Modified Wednesday.',
    ].join('\n---\n');

    const result = mergeDossierWithOriginal(modified, legacyOriginalDossier);

    expect(result).toContain('### 1. Bench Press');
    expect(result).toContain('**Target:** 4 × 5 @ 155 lbs');
    expect(result).toContain('~~Squat~~ → Front Squat');
    expect(result).toContain('### 1. Deadlift');
    expect(result).not.toContain('[NO CHANGES]');
  });

  it('legacy: merges with legacy heading format', () => {
    const legacyOriginal = [
      '# Header',
      '# Workout — Monday, February 23, 2026\n**Focus:** Upper\n\n### 1. Bench Press\n**Target:** 4 × 5',
      '# Workout — Wednesday, February 25, 2026\n**Focus:** Lower\n\n### 1. Squat\n**Target:** 4 × 5',
    ].join('\n---\n');

    const modified = [
      '# Header',
      '# Workout — Monday, February 23, 2026\n[NO CHANGES]',
      '# Workout — Wednesday, February 25, 2026\n**Focus:** Lower\n\n### 1. Front Squat\n**Target:** 3 × 8',
    ].join('\n---\n');

    const result = mergeDossierWithOriginal(modified, legacyOriginal);

    expect(result).toContain('### 1. Bench Press');
    expect(result).not.toContain('[NO CHANGES]');
    expect(result).toContain('### 1. Front Squat');
  });

  it('legacy: passes through modified days unchanged', () => {
    const modified = [
      '# Header',
      '# MONDAY - February 23, 2026: Workout\n**Focus:** Push\n\n### 1. OHP\n**Target:** 3 × 8',
    ].join('\n---\n');

    const result = mergeDossierWithOriginal(modified, legacyOriginalDossier);
    expect(result).toContain('### 1. OHP');
    expect(result).not.toContain('Bench Press');
  });

  it('legacy: handles no [NO CHANGES] markers', () => {
    const fullModified = [
      '# Header',
      '# MONDAY - February 23, 2026: Workout\n**Focus:** Upper\n\n### 1. Incline Bench\n**Target:** 4 × 8',
      '# WEDNESDAY - February 25, 2026: Workout\n**Focus:** Lower\n\n### 1. Leg Press\n**Target:** 4 × 10',
    ].join('\n---\n');

    const result = mergeDossierWithOriginal(fullModified, legacyOriginalDossier);
    expect(result).toBe(fullModified);
  });

  it('legacy: handles missing day in original gracefully', () => {
    const modified = [
      '# Header',
      '# SATURDAY - February 28, 2026: Workout\n[NO CHANGES]',
    ].join('\n---\n');

    const result = mergeDossierWithOriginal(modified, legacyOriginalDossier);
    expect(result).toContain('[NO CHANGES]');
  });
});
