import type { FitnessPlanOutput } from './types';

/**
 * Validation result for fitness plan output
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that the fitness plan output has valid content
 *
 * Checks:
 * - plan is a non-empty string
 * - plan contains expected sections
 *
 * @param output - The fitness plan output to validate
 * @returns Validation result with error message if invalid
 */
export const validateFitnessPlanOutput = (output: FitnessPlanOutput): ValidationResult => {
  const { plan } = output;

  // Check plan is not empty
  if (!plan || plan.trim().length === 0) {
    return {
      isValid: false,
      error: 'Plan is empty or missing'
    };
  }

  // Check for some expected sections (basic validation)
  const lowerPlan = plan.toLowerCase();
  if (!lowerPlan.includes('training') && !lowerPlan.includes('split')) {
    return {
      isValid: false,
      error: 'Plan does not appear to contain training structure information'
    };
  }

  return { isValid: true };
};
