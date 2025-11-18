import type { MesocycleGenerationOutput } from './types';

/**
 * Validation result for mesocycle output
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that the mesocycle output has consistent microcycle count
 *
 * Checks:
 * - number_of_microcycles matches the length of the microcycles array
 *
 * @param output - The mesocycle output to validate
 * @returns Validation result with error message if invalid
 */
export const validateMesocycleOutput = (output: MesocycleGenerationOutput): ValidationResult => {
  const { number_of_microcycles, microcycles } = output;

  // Check microcycle count matches array length
  if (number_of_microcycles !== microcycles.length) {
    return {
      isValid: false,
      error: `Microcycle count mismatch: number_of_microcycles=${number_of_microcycles} but microcycles.length=${microcycles.length}`
    };
  }

  return { isValid: true };
};
