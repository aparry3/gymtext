import { describe, it, expect } from 'vitest';
import { parseDossierResponse } from '@/server/agents/dossierParser';

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
