/**
 * Resolve a template string with {{variable}} substitutions
 *
 * Variables are replaced with their string values from the data object.
 * Objects and arrays are JSON.stringified.
 *
 * @param template - Template string with {{variable}} placeholders
 * @param data - Key-value data to substitute
 * @returns Resolved template string
 */
export function resolveTemplate(
  template: string,
  data: Record<string, unknown>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = data[key];
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  });
}
