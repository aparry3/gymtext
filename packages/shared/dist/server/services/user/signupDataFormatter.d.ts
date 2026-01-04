import type { SignupData } from '@/server/repositories/onboardingRepository';
/**
 * SignupDataFormatter
 *
 * Service for formatting raw signup form data into LLM-friendly text strings.
 * This logic was moved from the frontend to centralize data formatting on the backend.
 *
 * Responsibilities:
 * - Convert structured form data into natural language descriptions
 * - Provide consistent formatting for LLM consumption
 * - Make it easy to modify formatting without touching frontend
 */
/**
 * Format raw signup data into LLM-friendly text strings
 *
 * Takes structured form data and converts it into natural language
 * descriptions suitable for fitness profile extraction.
 */
export declare function formatSignupDataForLLM(data: SignupData): {
    fitnessGoals: string;
    currentExercise: string;
    environment: string;
    injuries?: string;
};
//# sourceMappingURL=signupDataFormatter.d.ts.map