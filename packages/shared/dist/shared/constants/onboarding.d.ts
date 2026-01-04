/**
 * Onboarding Step Configuration
 *
 * Defines the steps in the user onboarding process.
 * Used by both backend (Inngest) and frontend (UserDashboard) to track and display progress.
 */
export declare const ONBOARDING_STEPS: readonly [{
    readonly step: 1;
    readonly name: "Loading your information...";
}, {
    readonly step: 2;
    readonly name: "Analyzing your fitness profile...";
}, {
    readonly step: 3;
    readonly name: "Creating your fitness plan...";
}, {
    readonly step: 4;
    readonly name: "Detailing your first week...";
}, {
    readonly step: 5;
    readonly name: "Creating your first workout...";
}, {
    readonly step: 6;
    readonly name: "Finalizing your program...";
}, {
    readonly step: 7;
    readonly name: "Getting everything ready...";
}];
export declare const TOTAL_STEPS: 7;
/**
 * Get step display name by step number
 */
export declare function getStepName(stepNumber: number): string;
/**
 * Calculate progress percentage
 */
export declare function getProgressPercentage(currentStep: number): number;
//# sourceMappingURL=onboarding.d.ts.map