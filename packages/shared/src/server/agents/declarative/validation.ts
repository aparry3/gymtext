import type { ValidationRule, ValidationResult } from './types';

/**
 * Resolve a dot-path against data (for validation)
 */
function resolveField(data: unknown, path: string): unknown {
  const segments = path.split('.');
  let value: unknown = data;

  for (const segment of segments) {
    if (value == null) return undefined;
    value = (value as Record<string, unknown>)[segment];
  }

  return value;
}

/**
 * Evaluate declarative validation rules against data
 *
 * Checks each rule against the data and returns a ValidationResult.
 * Used for both agent output validation (with retry) and sub-agent conditions.
 *
 * @param rules - Array of validation rules
 * @param data - The data to validate (e.g., agent output)
 * @returns Validation result with isValid flag and error messages
 */
export function evaluateRules(rules: ValidationRule[], data: unknown): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    const value = resolveField(data, rule.field);
    let passed = false;

    switch (rule.check) {
      case 'equals':
        passed = value === rule.expected;
        break;
      case 'truthy':
        passed = !!value;
        break;
      case 'nonEmpty':
        passed = Array.isArray(value) ? value.length > 0 : !!value;
        break;
      case 'allNonEmpty':
        passed = Array.isArray(value) && value.every(v => !!v);
        break;
      case 'length':
        passed = Array.isArray(value) && value.length === rule.expected;
        break;
    }

    if (!passed) {
      errors.push(rule.error || `Validation failed: ${rule.field} ${rule.check}`);
    }
  }

  return { isValid: errors.length === 0, errors };
}
