/**
 * Onboarding Step Configuration
 *
 * Defines the steps in the user onboarding process.
 * Used by both backend (Inngest) and frontend (UserDashboard) to track and display progress.
 */
export const ONBOARDING_STEPS = [
    { step: 1, name: 'Loading your information...' },
    { step: 2, name: 'Analyzing your fitness profile...' },
    { step: 3, name: 'Creating your fitness plan...' },
    { step: 4, name: 'Detailing your first week...' },
    { step: 5, name: 'Creating your first workout...' },
    { step: 6, name: 'Finalizing your program...' },
    { step: 7, name: 'Getting everything ready...' },
];
export const TOTAL_STEPS = ONBOARDING_STEPS.length;
/**
 * Get step display name by step number
 */
export function getStepName(stepNumber) {
    const step = ONBOARDING_STEPS.find(s => s.step === stepNumber);
    return step?.name || 'Processing...';
}
/**
 * Calculate progress percentage
 */
export function getProgressPercentage(currentStep) {
    return Math.round((currentStep / TOTAL_STEPS) * 100);
}
