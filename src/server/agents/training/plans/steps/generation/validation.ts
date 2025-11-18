import type { FitnessPlanOutput } from './types';

/**
 * Validation result for fitness plan output
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that the fitness plan output has consistent mesocycle count
 *
 * Checks:
 * - number_of_mesocycles matches the length of the mesocycles array
 *
 * @param output - The fitness plan output to validate
 * @returns Validation result with error message if invalid
 */
export const validateFitnessPlanOutput = (output: FitnessPlanOutput): ValidationResult => {
  const { number_of_mesocycles, mesocycles } = output;

  // Check mesocycle count matches array length
  if (number_of_mesocycles !== mesocycles.length) {
    return {
      isValid: false,
      error: `Mesocycle count mismatch: number_of_mesocycles=${number_of_mesocycles} but mesocycles.length=${mesocycles.length}`
    };
  }

  return { isValid: true };
};
