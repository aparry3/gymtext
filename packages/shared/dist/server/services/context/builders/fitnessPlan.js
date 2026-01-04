/**
 * Build fitness plan context string
 *
 * @param planText - Fitness plan description text
 * @returns Formatted context string with XML tags
 */
export const buildFitnessPlanContext = (planText) => {
    if (!planText || planText.trim().length === 0) {
        return '<FitnessPlan>No fitness plan available</FitnessPlan>';
    }
    return `<FitnessPlan>${planText.trim()}</FitnessPlan>`;
};
