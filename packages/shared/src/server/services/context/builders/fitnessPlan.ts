/**
 * Build fitness plan context content (raw, without XML wrapper)
 *
 * @param planText - Fitness plan description text
 * @returns Raw content string (XML wrapper applied by template)
 */
export const buildFitnessPlanContext = (planText: string | null | undefined): string => {
  if (!planText || planText.trim().length === 0) {
    return 'No fitness plan available';
  }
  return planText.trim();
};
